---
"@stone-js/queue": patch
"@stone-js/realtime": patch
---

fix: work and subscriptions that outlive the event that made them

The last two modules holding inter-request state where the framework rebuilds it. Same defect already fixed in `@stone-js/rate-limit` and `@stone-js/cache`: the driver kept its state in the instance, and the container is an execution context, rebuilt for every event.

**`@stone-js/queue` dropped every job.** Measured on the published 0.8.18, outside the monorepo: dispatch a job, then `size()` answers `1` from the instance that dispatched it and `0` from the next one, and the worker reserves nothing. Silently, with a green suite, because a test builds the connection once.

That reached further than the queue. `@stone-js/notifications` hands its deliveries to a queue **as soon as one is registered in the container**, so an application installing both modules had `notify()` return `{ queued: true }`, the job land in a `Map` that died with the event, and no notification ever delivered. No error, no log.

**`@stone-js/realtime` lost its subscriptions and its presence.** A listener is registered once, usually while an adapter starts, and has to be there for every broadcast afterwards. Held per instance it was not: a broadcast reached the listeners registered during that one event and nobody else, so an adapter that subscribed at boot received nothing from then on. Presence had the same shape, a socket joining a channel was gone by the next message.

So the state moved to where it belongs: **the driver**. `MemoryQueue`, `MemoryBroadcaster` and `MemoryConnectionStore` hold theirs, filed under the name they were configured with, so two named drivers stay apart exactly as two Redis prefixes would. Managers, providers and everything else are still rebuilt per event, unchanged.

All three now say plainly what they are: one process wide, right for a single server and for tests, and **not** a shared queue, a shared fan-out or shared presence anywhere else. Two instances behind a load balancer each hold their own; on a function-as-a-service platform a cold start loses whatever had not run. Configure Redis there, or register your own driver.

`MemoryBroadcaster` and `MemoryConnectionStore` gain `clear()`, because state that outlives an instance needs something able to end it, which `MemoryRateLimiter` already had.

Five behavioural tests pin it, and every one of them fails without the fix: a job dispatched is still there for the next connection, a job filed under another name is not, a listener registered by a previous instance receives a broadcast, a connection stays joined for the next instance to find, and two drivers of the same kind stay apart.

Closes #244.
