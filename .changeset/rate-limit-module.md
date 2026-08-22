---
"@stone-js/rate-limit": patch
---

feat: rate limiting, declared on the route and keyed on the subject

`@stone-js/rate-limit` enforces a budget declared where the route is declared, on the router layer and outside every other route middleware: rejecting a caller past its budget is worth nothing once authentication has run, the database has been read and the mail provider called.

```ts
@Post('/auth/code', { rateLimit: { max: 3, window: 900, by: 'email' } })
sendCode (event: IncomingHttpEvent) { }
```

**The rule the module exists to serve: throttle the subject, not the address alone.** A per-address quota assumes one address is one person. On mobile networks using carrier-grade NAT, the norm across much of the world, hundreds of unrelated subscribers share one public address, so the quota refuses legitimate users at random and hardest where the audience is largest. The budget therefore belongs to the account, the mailbox or the phone number, and the address keeps a much looser bucket whose only job is to stop one machine enumerating subjects in bulk. A request carrying no subject is billed to that looser bucket, so a malformed request cannot spend an account's budget and omitting a field is not a way to buy an unlimited one.

A budget on a group holds for every child alongside the child's own, through `stone.router.composableProps`, each counted in its own bucket so neither spends the other's allowance. A group rule is copied onto each child, so `scope` names a bucket shared across routes when the intent is one ceiling rather than one per route. `@Throttle` declares a budget on a handler method, for a command or a queue consumer that has no route at all.

`memory` is always available and needs no configuration, `redis` counts in one round trip with no read (the window index is part of the key, so a new window is a new key and the old one expires by itself), and a deployment can register a limiter for the store it already runs on. `hit` receives the limit rather than holding it, so a driver that refuses through a conditional write pays nothing for a refusal.

A refusal answers `429` with `Retry-After`, and the error carries its own status rather than an HTTP shape, so a CLI or a queue consumer reads it directly. Within budget, `RateLimit-*` headers report the budget closest to being exceeded. No forwarded header is read unless the application names it trusted: one is client-spoofable unless an edge overwrites it, and reading one by default would hand every caller an unlimited supply of identities. Ports are stripped from addresses, since a port is per connection and leaving it in fires only on the callers well-behaved enough to reuse a keep-alive connection. Subjects are hashed, and a refusal is logged without the subject, the address or the body.
