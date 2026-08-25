---
"@stone-js/core": patch
"@stone-js/testing": patch
"@stone-js/rate-limit": patch
"@stone-js/cache": patch
---

feat(core): `perProcess`, for the state a provider must not rebuild

The container is an execution context: created for one event, thrown away with it, and every service provider registers again with the next one. That is the design. Its consequence catches everyone once, and it caught two shipped modules: a provider that builds something holding state rebuilds it on every event, so a rate limiter refused nothing and a cache never returned a hit, silently, with green test suites, because a test builds the thing once.

Both were fixed by hand. The fix by hand is the problem: every manager-based module rewrites that lifecycle, so the next one forgets it again. There is now one way to say it, and it lives where a module author will find it:

```ts
import { perProcess } from '@stone-js/core'

register (): void {
  const manager = perProcess(CacheManager, () => CacheManager.create('memory'))
  this.container.instanceIf(CacheManager, manager)
}
```

The factory runs at most once per process; the container still hands the value out, so nothing changes for whoever injects it. `setPerProcess`, `hasPerProcess` and `clearProcessScope` complete it, the last one for tests.

`createTestApp` now clears the process scope on every boot, because a test application is a new process. Without that, a module's state would travel from one test's application into the next one's, and a suite would pass or fail on the order its files happened to run in.

`@stone-js/rate-limit` and `@stone-js/cache` use it. `@stone-js/queue` and `@stone-js/realtime` have the same shape and are tracked separately, to be fixed each with its own measurement. The rule is documented on the service providers page, along with the test that catches it: register the provider **twice** and assert the state survived. A test that registers it once passes either way, which is exactly why the failure shipped.
