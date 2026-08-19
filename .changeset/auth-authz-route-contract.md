---
"@stone-js/authz": patch
"@stone-js/auth": patch
---

feat: a route declares who may call it, and what they may do

The last two of the four route props, on the same shape as `validation` and `resource`. A route, or a handler, states its requirement; the module enforces it; and because it is **declared rather than wired**, `@stone-js/openapi` can publish the endpoint as protected. A guard buried in a middleware list protects the endpoint but tells nothing else about it, so the contract stays silent and a caller reads its 401 as a bug.

```ts
@Get('/me', { auth: true })                                    // authenticated
@Post('/tasks', { auth: 'tasks:write' })                       // and holding a scope
@Delete('/posts/:id', { authz: { action: 'delete', subject: 'Post' } })
@Patch('/posts/:id', { authz: 'post.update' })                 // a registered policy
```

Neither module knows anything about the router. `@Protect()` and `@Can()` record the requirement on the handler under each module's own key, so it holds in a routed application, a single-handler service, a CLI command or the browser; the route props stay the tidier transport when a router is in play, and win when both are present.

## Policies, for what an ability cannot express

An ability answers what a *role* may do. A policy answers what *this caller* may do to *this record*, which needs the record:

```ts
@Policy('post.update')
export class UpdatePostPolicy implements IPolicy {
  constructor ({ posts }: { posts: PostService }) { this.posts = posts }

  async authorize (event: IncomingEvent): Promise<boolean> {
    const post = await this.posts.find(event.get('id'))
    return post.authorId === event.getMetadataValue<JwtClaims>('auth')?.sub
  }
}
```

Resolved through the container, so it gets its services, and collected into `stone.authz.policies` by the same scan the router uses. `definePolicy` is the imperative counterpart.

**A missing policy denies.** Naming one that is not registered throws rather than passing through, because a gap in the rules must never read as permission. The same applies when no ability was attached at all.

## Ordering

Authentication (priority 3), then authorization (4), then validation (5): who the caller is, then whether they may, then what they sent. There is no point parsing a payload for a caller who is not allowed to send one.
