---
"@stone-js/rate-limit": patch
---

feat: a subject the application resolves, and a `by` nobody can forget

Three fixes to subject resolution, from a pilot's report, all of the same family: a limiter must never break the route it protects, and must never degrade in silence.

**`by: '<field>'` answered 500 on a routed application.** It read the field through `event.get()`, which consults the route parameters first, and on the router layer parameters are bound only *after* the route middleware have run. So a declared budget raised `RouterError: Event is not bound` on the very route it was protecting, for a body field just as much as for a path parameter. Fields are now read through the router's own `findParam` (asked through the container, so this module still imports no router), then the body, then the query, and every read is wrapped: whatever fails, the request falls back to the address bucket instead of failing.

**`by` accepts a function**, `(event) => string | undefined`. It is the honest answer for everything a field name cannot reach, a claim in a token, a header an edge signs, a lookup an earlier middleware did, and it means this module never has to guess where an application keeps its subject.

**`by: 'user'` had no principal to bill.** Enforcement runs before authentication on purpose, so nothing has resolved one yet, and the rule fell back to the address bucket at ten times the limit: a budget of three allowed thirty, with no error, no log, and every test green. There is now `stone.rateLimit.principal`, a resolver an application points at whatever already knows; the default reads `event.getUser?.()` and takes its `id`, `sub` or `userId`; and any rule that names a subject the request does not carry logs a warning naming the rule. The behaviour was always right, the silence never was.

**`by` is now required.** The only default it could have is `'address'`, which is the single thing this module argues against in its own documentation, so a rule that omitted the word quietly meant the opposite of what was recommended, and nothing in a review showed it. Whoever wants the address writes `'address'`, and it becomes a decision on the page. This is a type-level change: every existing rule needs the word, and none changes behaviour by gaining it.

Also: a limiter an application builds itself is declared with the others, `limiters: [{ name: 'mine', factory: () => myLimiter }]`, instead of being registered on the manager from a provider, which did not survive the container being rebuilt. And `RateLimitError` carries the stable code `RATE_LIMIT_EXCEEDED`, so an application maps a refusal to its own error envelope without importing this package into its error handler.
