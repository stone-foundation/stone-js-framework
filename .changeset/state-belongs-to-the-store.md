---
"@stone-js/rate-limit": patch
"@stone-js/cache": patch
---

fix: state that outlives an event belongs to the store, not to the framework

Both modules built their manager in a service provider, and a provider registers with the container. The container is an execution context: it is rebuilt for every event. So the manager was rebuilt too, taking its state along, and neither module did what it existed to do.

Measured on a real Node HTTP server. A route declaring `{ max: 2, window: 60 }`: five requests, five `200`s, with `RateLimit-Remaining: 1` on every one, because the memory limiter arrived empty each time. A route setting then reading a cache key: the read never saw the write, so `remember` recomputed on every request. Both silent, both with a green suite, because a test builds the thing once.

**The fix is not to hold state where the framework can see it.** The container being ephemeral is the design, and on a function-as-a-service platform it is also the truth: a cold start restarts everything. Anything the framework kept between events would be per warm container there, so a count would be wrong, unshared and reset unpredictably, while looking correct in development. That is the same class of failure as the bug itself.

So the state moved to where it belongs: **the store**. A driver owns its own backing, because a store is the persistence boundary and choosing one is choosing where the state is kept. The memory limiter and the memory cache store now hold theirs, filed under the name they were configured with, so two named stores stay apart exactly as two Redis prefixes would. Managers, providers and everything else are rebuilt per event, unchanged.

Both memory drivers now say plainly what they are: one process wide, right for a single server and for tests, and **not** a shared limit or a shared cache anywhere else. An application that needs one across instances configures Redis, or registers its own driver with `limiters: [{ name, factory }]`, which is the seam for counting in the store a deployment already runs on.

After the fix, on the same server: `200, 200, 429`, and a cache read that sees the previous request's write.
