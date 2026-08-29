# @stone-js/rate-limit

## 0.8.19

### Patch Changes

- 865579c: fix(http-core): the published types resolve for a strict consumer

  `@stone-js/http-core` referenced `send`, `accepts` and `range-parser` from its **published** declarations while their `@types/*` sat in `devDependencies`. So a consumer compiling with `skipLibCheck: false`, which is what a careful team turns on, got three `TS7016` errors from inside our own package and had to install type packages it never asked for.

  The three are `dependencies` now, which is what a package referencing them from its public API owes its consumers. Measured on a real install from the registry: those were the only three errors of that kind across every published entry point.

  Also in `@stone-js/rate-limit`, the guard that decides whether a value identifies a subject is now a **type guard**. It already made `String(value)` safe, and the comment said so; saying it in the type says it to the compiler instead, which is what the analyser was asking for.

- Updated dependencies [6b76c36]
- Updated dependencies [cb52a51]
  - @stone-js/core@0.8.19
  - @stone-js/config@0.8.19

## 0.8.18

### Patch Changes

- aa3f3b5: fix(rate-limit): a subject that stringifies to `[object Object]` is not a subject

  `String(value)` answers `'[object Object]'` for anything that never defined its own `toString`, and that string makes a perfectly good bucket key. So every caller whose subject happened to be an object landed in the same bucket and spent each other's budget: two strangers, one limit, no error, no warning, every test green.

  Two doors led there. A principal whose `id`, `sub` or `userId` is an object, which is what several database drivers hand over. And a request field declared as the subject, `by: 'email'`, arriving as an object because a client sent one.

  Such a value is now refused as a subject, so the request falls back to the address bucket, which is this module's designed degradation and which warns. A value carrying its own `toString`, an object id from a driver, a `Date`, an array, still says something distinct and is kept.

  Also: what a rule bills is now written once as a label rather than three times as the same conditional, which is what put `enforce` over the complexity limit.

  - @stone-js/core@0.8.18
  - @stone-js/config@0.8.18

## 0.8.17

### Patch Changes

- 07b3cc9: fix: the security audit follows the lockfiles, and a few smells go with it

  A vulnerable transitive `uuid` sat in the monorepo starter, seen by Dependabot and by nothing else. Two separate holes let it, and both are measured rather than assumed.

  **The audit only looked at the root.** A starter with its own lockfile resolves independently: the root's `pnpm.overrides` never reached it, so the `uuid@<11.1.1` pin that protects every other package did nothing there. The audit now follows the **lockfiles** rather than the workspace, through `scripts/audit-lockfiles.mjs`, and CI runs the same script as `pnpm run audit:ci` so the two cannot drift. Verified by pointing it at the vulnerable lockfile: it fails and names the path, `apps__mobile>expo>@expo/config-plugins>xcode>uuid`.

  **The threshold was above the advisory.** `pnpm audit` classifies this one `moderate`, so a gate at `high` would never have stopped it, wherever it ran. Measured before changing it: the repository is clean at `low`, so `moderate` costs nothing today and catches the class that got through.

  Nothing local ran the audit either, so there is now a `pre-push` hook for it alone, seconds against the registry, and a `pnpm run verify` that bundles the whole pre-push gauntlet for when you want all of it.

  Also, twelve reported smells, each a real one. Four object literals used as default parameters, rebuilt on every call and now named values. `String(value)` on an `unknown` in two places, where an object would have landed as `[object Object]` in a message somebody reads or in a URL that matches no route: both now leave the placeholder, visibly unfinished. A nested template literal, a nested ternary, two verbose character classes, and an import that existed only to be re-exported.

- d7ddd44: fix: a limiter that never limited, and a cache that never cached

  Both modules built their manager in a service provider, and a provider registers with the container. The container is an execution context: it is rebuilt for every event. So the manager was rebuilt for every event too, taking its state along.

  Measured on a real Node HTTP server before the fix. A route declaring `{ max: 2, window: 60 }`: five requests, five `200`s, with `RateLimit-Remaining: 1` on every one of them, because the memory limiter arrived empty each time. A route setting then reading a cache key: the read never saw the write, so `remember` recomputed on every request. Both silent, both with a green test suite, because a test builds the manager once.

  Counters and cached values have to outlive the event that produced them, by definition, so both managers are now process-scoped: the provider reuses the published instance instead of replacing it, and the container merely gets a handle on it. After the fix, on the same server: `200, 200, 429`, and a cache read that sees the previous request's write.

  The same shape exists in `@stone-js/queue` (a memory connection holds the queued jobs) and `@stone-js/realtime` (a memory broadcaster holds the subscriptions). Both are tracked separately, to be fixed with their own measurement rather than by analogy.

- d7ddd44: fix: a rule that names no subject says so out loud

  `by` is required, and the type says so. It says so to TypeScript only, and Stone.js is JavaScript as much as TypeScript: a vanilla application would have kept the silent default this module exists to argue against, which is the very failure the requirement removes.

  A rule arriving without a `by` is now enforced on the caller's address, as before, and logs what it is doing and how to say it on purpose:

  > Rate limit rule declares no `by`, so it is counted on the caller address. Name the subject it should belong to, or write `by: 'address'` to say you meant it.

  Nothing is waved through, nothing throws, and the one decision this module cares about is visible in a log rather than absent from a type nobody checked.

- d7ddd44: feat: a subject the application resolves, and a `by` nobody can forget

  Three fixes to subject resolution, from a pilot's report, all of the same family: a limiter must never break the route it protects, and must never degrade in silence.

  **`by: '<field>'` answered 500 on a routed application.** It read the field through `event.get()`, which consults the route parameters first, and on the router layer parameters are bound only _after_ the route middleware have run. So a declared budget raised `RouterError: Event is not bound` on the very route it was protecting, for a body field just as much as for a path parameter. Fields are now read through the router's own `findParam` (asked through the container, so this module still imports no router), then the body, then the query, and every read is wrapped: whatever fails, the request falls back to the address bucket instead of failing.

  **`by` accepts a function**, `(event) => string | undefined`. It is the honest answer for everything a field name cannot reach, a claim in a token, a header an edge signs, a lookup an earlier middleware did, and it means this module never has to guess where an application keeps its subject.

  **`by: 'user'` had no principal to bill.** Enforcement runs before authentication on purpose, so nothing has resolved one yet, and the rule fell back to the address bucket at ten times the limit: a budget of three allowed thirty, with no error, no log, and every test green. There is now `stone.rateLimit.principal`, a resolver an application points at whatever already knows; the default reads `event.getUser?.()` and takes its `id`, `sub` or `userId`; and any rule that names a subject the request does not carry logs a warning naming the rule. The behaviour was always right, the silence never was.

  **`by` is now required.** The only default it could have is `'address'`, which is the single thing this module argues against in its own documentation, so a rule that omitted the word quietly meant the opposite of what was recommended, and nothing in a review showed it. Whoever wants the address writes `'address'`, and it becomes a decision on the page. This is a type-level change: every existing rule needs the word, and none changes behaviour by gaining it.

  Also: a limiter an application builds itself is declared with the others, `limiters: [{ name: 'mine', factory: () => myLimiter }]`, instead of being registered on the manager from a provider, which did not survive the container being rebuilt. And `RateLimitError` carries the stable code `RATE_LIMIT_EXCEEDED`, so an application maps a refusal to its own error envelope without importing this package into its error handler.

- d7ddd44: fix: state that outlives an event belongs to the store, not to the framework

  Both modules built their manager in a service provider, and a provider registers with the container. The container is an execution context: it is rebuilt for every event. So the manager was rebuilt too, taking its state along, and neither module did what it existed to do.

  Measured on a real Node HTTP server. A route declaring `{ max: 2, window: 60 }`: five requests, five `200`s, with `RateLimit-Remaining: 1` on every one, because the memory limiter arrived empty each time. A route setting then reading a cache key: the read never saw the write, so `remember` recomputed on every request. Both silent, both with a green suite, because a test builds the thing once.

  **The fix is not to hold state where the framework can see it.** The container being ephemeral is the design, and on a function-as-a-service platform it is also the truth: a cold start restarts everything. Anything the framework kept between events would be per warm container there, so a count would be wrong, unshared and reset unpredictably, while looking correct in development. That is the same class of failure as the bug itself.

  So the state moved to where it belongs: **the store**. A driver owns its own backing, because a store is the persistence boundary and choosing one is choosing where the state is kept. The memory limiter and the memory cache store now hold theirs, filed under the name they were configured with, so two named stores stay apart exactly as two Redis prefixes would. Managers, providers and everything else are rebuilt per event, unchanged.

  Both memory drivers now say plainly what they are: one process wide, right for a single server and for tests, and **not** a shared limit or a shared cache anywhere else. An application that needs one across instances configures Redis, or registers its own driver with `limiters: [{ name, factory }]`, which is the seam for counting in the store a deployment already runs on.

  After the fix, on the same server: `200, 200, 429`, and a cache read that sees the previous request's write.

  One more consequence of a container rebuilt per event, and it predates this change: the Redis driver rebuilt its **client** with it, so a busy server opened a TCP connection per request and kept opening them. A connection is a resource, not state, since the counters are in Redis and rebuilding a client loses nothing at all. `@stone-js/rate-limit` now opens one connection per **connection target**, shared by every limiter pointing at it, with `disconnect()` to close them for a graceful shutdown or a test. A client the application supplies is left entirely alone: whoever opened it closes it.

  `@stone-js/cache`, `@stone-js/queue` and `@stone-js/realtime` have the same connection behaviour, unchanged here and tracked with their state issue, so each is fixed with its own measurement rather than by analogy.

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17
  - @stone-js/config@0.8.17

## 0.8.16

### Patch Changes

- 2c11b54: feat: rate limiting, declared on the route and keyed on the subject

  `@stone-js/rate-limit` enforces a budget declared where the route is declared, on the router layer and outside every other route middleware: rejecting a caller past its budget is worth nothing once authentication has run, the database has been read and the mail provider called.

  ```ts
  @Post('/auth/code', { rateLimit: { max: 3, window: 900, by: 'email' } })
  sendCode (event: IncomingHttpEvent) { }
  ```

  **The rule the module exists to serve: throttle the subject, not the address alone.** A per-address quota assumes one address is one person. On mobile networks using carrier-grade NAT, the norm across much of the world, hundreds of unrelated subscribers share one public address, so the quota refuses legitimate users at random and hardest where the audience is largest. The budget therefore belongs to the account, the mailbox or the phone number, and the address keeps a much looser bucket whose only job is to stop one machine enumerating subjects in bulk. A request carrying no subject is billed to that looser bucket, so a malformed request cannot spend an account's budget and omitting a field is not a way to buy an unlimited one.

  A budget on a group holds for every child alongside the child's own, through `stone.router.composableProps`, each counted in its own bucket so neither spends the other's allowance. A group rule is copied onto each child, so `scope` names a bucket shared across routes when the intent is one ceiling rather than one per route. `@Throttle` declares a budget on a handler method, for a command or a queue consumer that has no route at all.

  `memory` is always available and needs no configuration, `redis` counts in one round trip with no read (the window index is part of the key, so a new window is a new key and the old one expires by itself), and a deployment can register a limiter for the store it already runs on. `hit` receives the limit rather than holding it, so a driver that refuses through a conditional write pays nothing for a refusal.

  A refusal answers `429` with `Retry-After`, and the error carries its own status rather than an HTTP shape, so a CLI or a queue consumer reads it directly. Within budget, `RateLimit-*` headers report the budget closest to being exceeded. No forwarded header is read unless the application names it trusted: one is client-spoofable unless an edge overwrites it, and reading one by default would hand every caller an unlimited supply of identities. Ports are stripped from addresses, since a port is per connection and leaving it in fires only on the callers well-behaved enough to reuse a keep-alive connection. Subjects are hashed, and a refusal is logged without the subject, the address or the body.

  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16
