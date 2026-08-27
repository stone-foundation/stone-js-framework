---
"@stone-js/rate-limit": patch
"@stone-js/cache": patch
---

fix: a limiter that never limited, and a cache that never cached

Both modules built their manager in a service provider, and a provider registers with the container. The container is an execution context: it is rebuilt for every event. So the manager was rebuilt for every event too, taking its state along.

Measured on a real Node HTTP server before the fix. A route declaring `{ max: 2, window: 60 }`: five requests, five `200`s, with `RateLimit-Remaining: 1` on every one of them, because the memory limiter arrived empty each time. A route setting then reading a cache key: the read never saw the write, so `remember` recomputed on every request. Both silent, both with a green test suite, because a test builds the manager once.

Counters and cached values have to outlive the event that produced them, by definition, so both managers are now process-scoped: the provider reuses the published instance instead of replacing it, and the container merely gets a handle on it. After the fix, on the same server: `200, 200, 429`, and a cache read that sees the previous request's write.

The same shape exists in `@stone-js/queue` (a memory connection holds the queued jobs) and `@stone-js/realtime` (a memory broadcaster holds the subscriptions). Both are tracked separately, to be fixed with their own measurement rather than by analogy.
