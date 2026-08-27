# @stone-js/auth

## 0.8.17

### Patch Changes

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17
  - @stone-js/http-core@0.8.17
  - @stone-js/config@0.8.17

## 0.8.16

### Patch Changes

- Updated dependencies [2c11b54]
  - @stone-js/http-core@0.8.16
  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/http-core@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14
  - @stone-js/http-core@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- Updated dependencies [8c2b600]
  - @stone-js/http-core@0.8.13
  - @stone-js/core@0.8.13
  - @stone-js/config@0.8.13

## 0.8.12

### Patch Changes

- c971168: fix: authentication reads the header, and a contract describes the API

  Six defects reported from a pilot application, each reproduced before it was touched.

  - `@stone-js/auth` read the bearer token with `event.get('Authorization')`, and that accessor deliberately refuses to read headers, because it also reads the query string and the body. So the real header was ignored, every request stayed anonymous, and `?Authorization=` would have been read in its place. It reads `getHeader` now.
  - `@stone-js/openapi` documented every endpoint under `/`: a route's `path` is the pathname of the event it is answering, and no event is bound while generating a document. It reads the declared template, translates `:id` into `{id}`, declares the parameters the template requires, and publishes both paths for an optional segment.
  - A Zod 4 schema converted to `{}`, an empty JSON Schema meaning "anything", so every documented body and response was silently unconstrained. A schema that can describe itself is now asked to.
  - An explicit `contract:` block replaced everything derived, so documenting one `404` deleted the derived success response. It merges instead, per status, and a declared success status replaces the derived one rather than joining it.
  - The derived success status was always `200`, even for a handler answering `201`. The response decorators now record the status they build, so the document cannot contradict the code it came from.
  - `@stone-js/resources`: every `@ApiResource` the container resolved crashed on `checker`, an optional dependency read straight off the container, which resolves any name it is asked for and throws when nothing is bound.
  - `@stone-js/core`: `@Middleware` could only ever declare kernel middleware, so a middleware that reads the matched route could be registered from a blueprint but not from the decorator. `layer: 'app' | 'kernel' | 'router'` closes that, `global` keeps working.

  Packaging: `@stone-js/i18n`, `@stone-js/mcp-dev`, `@stone-js/openapi` and `@stone-js/use-react-native` published types referencing `@stone-js/cli` while declaring it as a dev dependency only. It is an optional peer now, so an application is never asked to resolve a package nobody told it about.

- Updated dependencies [047d9b0]
- Updated dependencies [c971168]
  - @stone-js/http-core@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- 13cebd1: fix: authentication reads the header, and a contract describes the API

  Six defects reported from a pilot application, each reproduced before it was touched.

  - `@stone-js/auth` read the bearer token with `event.get('Authorization')`, and that accessor deliberately refuses to read headers, because it also reads the query string and the body. So the real header was ignored, every request stayed anonymous, and `?Authorization=` would have been read in its place. It reads `getHeader` now.
  - `@stone-js/openapi` documented every endpoint under `/`: a route's `path` is the pathname of the event it is answering, and no event is bound while generating a document. It reads the declared template, translates `:id` into `{id}`, declares the parameters the template requires, and publishes both paths for an optional segment.
  - A Zod 4 schema converted to `{}`, an empty JSON Schema meaning "anything", so every documented body and response was silently unconstrained. A schema that can describe itself is now asked to.
  - An explicit `contract:` block replaced everything derived, so documenting one `404` deleted the derived success response. It merges instead, per status, and a declared success status replaces the derived one rather than joining it.
  - The derived success status was always `200`, even for a handler answering `201`. The response decorators now record the status they build, so the document cannot contradict the code it came from.
  - `@stone-js/resources`: every `@ApiResource` the container resolved crashed on `checker`, an optional dependency read straight off the container, which resolves any name it is asked for and throws when nothing is bound.
  - `@stone-js/core`: `@Middleware` could only ever declare kernel middleware, so a middleware that reads the matched route could be registered from a blueprint but not from the decorator. `layer: 'app' | 'kernel' | 'router'` closes that, `global` keeps working.

  Packaging: `@stone-js/i18n`, `@stone-js/mcp-dev`, `@stone-js/openapi` and `@stone-js/use-react-native` published types referencing `@stone-js/cli` while declaring it as a dev dependency only. It is an optional peer now, so an application is never asked to resolve a package nobody told it about.

- Updated dependencies [13cebd1]
  - @stone-js/http-core@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- 35c159b: Resources declare what leaves as a schema, and hold themselves to it.

  A projection written as code answered "what does this endpoint return?" only to someone who read it
  and trusted it: nothing checked it, nothing documented it, and a field added to the model later leaked
  because a mapping was not updated. A resource now declares a **schema**, in whatever dialect the
  application already validates input with, and that one declaration does three jobs — it _is_ the
  projection (what it does not describe is not exposed), it validates the response before it is sent,
  and `@stone-js/openapi` derives the output contract from it.

  - `schema(context)` is the contract. `fragments(context)` names subsets a caller may select through a
    configurable query parameter (`?view=summary` by default), each a documented contract of its own
    rather than an ad-hoc filter.
  - `data(model, context)` is an optional, asynchronous hook resolved from the container: fetch a
    relation, translate a label, compute a total. Whatever it returns is what the schema validates.
  - `item`, `collection` and `response` are asynchronous. The previous synchronous path turned an async
    projection into `{}` without a word.
  - A breach raises `ResourceContractError` naming the field that failed. It fires on a genuine breach,
    never on a difference, since a schema strips what it does not describe. `onViolation: 'warn'` trades
    integrity for availability, explicitly.
  - The context now carries the authenticated principal and the event, so a resource deciding what a
    caller may see no longer has to be told by the handler.

  **Fixes a defect that made route-declared resources unusable with a response decorator.**
  `@JsonHttpResponse(201)` wraps the method itself, so by the time route middleware ran the handler had
  already produced a response; projecting that object produced an empty payload and dropped the status.
  The payload is now shaped in place, and the status, headers and everything else the handler chose are
  left alone.

  Also fixed, all found by consumers rather than by us:

  - `@ValidationSchema` was **invisible to TypeScript**: the barrel exported an interface and a decorator
    of the same name, and TypeScript drops a name two `export *` both provide. The interface is now
    `NativeSchema`, matching the `isNativeSchema` guard that already existed.
  - `@stone-js/auth`'s `AuthorizationError` is now `InsufficientScopeError`. It is thrown for a missing
    scope, and it shared a name with `@stone-js/authz`'s error for a policy denial, so an application
    mapping errors had to map two identical names from two packages.
  - The auth documentation described an `Authenticator` with `authenticate(event)` that was never
    shipped; it now documents `resolveUser`, which is the real extension point, and `event.getUser()`
    rather than `event.get('user')` — the principal travels through a resolver, so the generic accessor
    never reached it. The same mistake was in this module's own code.
  - Two decorator examples showed options that do not exist (`@Validation({ abortEarly })`,
    `@Authz({ abilities })`); they now show `schemas` and `resolveAbility`.

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/http-core@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

- fac1e2f: feat: a route declares who may call it, and what they may do

  The last two of the four route props, on the same shape as `validation` and `resource`. A route, or a handler, states its requirement; the module enforces it; and because it is **declared rather than wired**, `@stone-js/openapi` can publish the endpoint as protected. A guard buried in a middleware list protects the endpoint but tells nothing else about it, so the contract stays silent and a caller reads its 401 as a bug.

  ```ts
  @Get('/me', { auth: true })                                    // authenticated
  @Post('/tasks', { auth: 'tasks:write' })                       // and holding a scope
  @Delete('/posts/:id', { authz: { action: 'delete', subject: 'Post' } })
  @Patch('/posts/:id', { authz: 'post.update' })                 // a registered policy
  ```

  Neither module knows anything about the router. `@Protect()` and `@Can()` record the requirement on the handler under each module's own key, so it holds in a routed application, a single-handler service, a CLI command or the browser; the route props stay the tidier transport when a router is in play, and win when both are present.

  ## Policies, for what an ability cannot express

  An ability answers what a _role_ may do. A policy answers what _this caller_ may do to _this record_, which needs the record:

  ```ts
  @Policy("post.update")
  export class UpdatePostPolicy implements IPolicy {
    constructor({ posts }: { posts: PostService }) {
      this.posts = posts;
    }

    async authorize(event: IncomingEvent): Promise<boolean> {
      const post = await this.posts.find(event.get("id"));
      return post.authorId === event.getMetadataValue<JwtClaims>("auth")?.sub;
    }
  }
  ```

  Resolved through the container, so it gets its services, and collected into `stone.authz.policies` by the same scan the router uses. `definePolicy` is the imperative counterpart.

  **A missing policy denies.** Naming one that is not registered throws rather than passing through, because a gap in the rules must never read as permission. The same applies when no ability was attached at all.

  ## Ordering

  Authentication (priority 3), then authorization (4), then validation (5): who the caller is, then whether they may, then what they sent. There is no point parsing a payload for a caller who is not allowed to send one.

- 617bfc6: feat: `@Auth()`, `@Authz()`, `@Telemetry()` and `@Validation()`, so every module has its two activation paths

  A Stone.js module is enabled in exactly two ways, and every module must expose both: its **decorator** for the declarative API, or its **blueprint** handed to the application manifest for the imperative one. An audit of every package found 27 modules exposing both and four exposing only the blueprint. These are those four.

  ```ts
  @Auth({ secret: getString("JWT_SECRET") })
  @StoneApp({ name: "my-app" })
  export class Application {}

  // or, imperatively
  export const Application = defineStoneApp({ name: "my-app" }, [
    authBlueprint,
  ]);
  ```

  Each decorator clones its blueprint and overrides only its options bucket, the way `@I18n()` and `@Cors()` do: the blueprint stays the single source of truth for what the module declares, so the two paths cannot drift apart, and each decorated application gets its own copy instead of sharing the exported constant.

  **Breaking (pre-1.0), `@stone-js/telemetry`**: the service class `Telemetry` is renamed **`TelemetryManager`**, freeing the bare name for the decorator, exactly as `CacheManager`, `RealtimeManager` and `I18nManager` do. Rollup was already dropping one of the two `Telemetry` exports as a conflicting re-export. Update `Telemetry` to `TelemetryManager` where you import the service; the container aliases `telemetry` and `Telemetry` are unchanged, so `constructor ({ telemetry })` keeps working.

  **The documented activation was also wrong.** Three places taught `blueprint.set(authBlueprint)` from inside a `@Configuration`, which merges a fragment into the store rather than registering a module: the `@stone-js/auth` README, the website Auth page, and the `stateless-auth` blog starter. All three now enable the module on the application and keep the configuration for what it is for. The four READMEs and the Auth, Authorization and Validation pages document both paths; `authz` and `validation` documented no activation at all, and `telemetry` already documented a `@Telemetry()` decorator that did not exist.

  The two remaining blueprints without a decorator are deliberate: `stoneCliBlueprint` is the CLI's own application, and `testAdapterBlueprint` is consumed by `createTestApp()`. Neither is ever declared on an application class.

  **Also fixed, `@stone-js/node-cli-adapter`**: `@NodeConsole()` merged its options **into** the exported `nodeConsoleAdapterBlueprint` and handed that very object to every decorated class, so a second application built alongside the first inherited its options and the constant stayed dirty for the rest of the process. It now clones before merging, as every other adapter decorator already did.

- defebab: fix(auth): `resolveUser` may be asynchronous

  `AuthenticateMiddleware` called the configured `resolveUser` without awaiting it, and the option was typed synchronous. Resolving a principal hits a store in any real application (the token subject has to become _your_ user, and that first lookup often provisions the account), so `stone.auth.resolveUser` was unusable and consumers kept a second middleware of their own.

  The option now accepts `Promiseable<unknown>` and the middleware awaits it. A synchronous resolver keeps working unchanged. Documented in the README, which never showed the option at all.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [97a6730]
- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/http-core@0.8.9
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/http-core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/http-core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/http-core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/http-core@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/http-core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/http-core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/http-core@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/http-core@0.8.1
