# Changelog

## 0.8.18

### Patch Changes

- @stone-js/core@0.8.18
- @stone-js/config@0.8.18

## 0.8.17

### Patch Changes

- d7ddd44: fix: a limiter that never limited, and a cache that never cached

  Both modules built their manager in a service provider, and a provider registers with the container. The container is an execution context: it is rebuilt for every event. So the manager was rebuilt for every event too, taking its state along.

  Measured on a real Node HTTP server before the fix. A route declaring `{ max: 2, window: 60 }`: five requests, five `200`s, with `RateLimit-Remaining: 1` on every one of them, because the memory limiter arrived empty each time. A route setting then reading a cache key: the read never saw the write, so `remember` recomputed on every request. Both silent, both with a green test suite, because a test builds the manager once.

  Counters and cached values have to outlive the event that produced them, by definition, so both managers are now process-scoped: the provider reuses the published instance instead of replacing it, and the container merely gets a handle on it. After the fix, on the same server: `200, 200, 429`, and a cache read that sees the previous request's write.

  The same shape exists in `@stone-js/queue` (a memory connection holds the queued jobs) and `@stone-js/realtime` (a memory broadcaster holds the subscriptions). Both are tracked separately, to be fixed with their own measurement rather than by analogy.

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

- @stone-js/core@0.8.16
- @stone-js/config@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/config@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

- 5e01789: **Breaking (pre-1.0)**: removed `defineI18n`, `defineCache`, `defineQueue`, `defineRealtime`, `defineEventBus` and `defineKeyRouting`

  A module is enabled in exactly two ways, and that is a universal rule of the framework: its **decorator** for the declarative API (`@I18n()`, `@Cache()`, `@Queue()`, `@Realtime()`, `@EventBus()`, `@KeyRouting()`), or its **blueprint** handed to the app manifest for the imperative one, `defineStoneApp(handler, options, [i18nBlueprint])`, which is the exact counterpart of `@StoneApp(options, [i18nBlueprint])`. These six helpers were a third path that enabled nothing: each returned an unwrapped configuration fragment (`{ i18n: … }`), and the pattern every README and docs page showed for them, `defineConfig(defineX({...}))`, **configured nothing at all**. `defineConfig` expects a function or an object carrying `configure`; handed a fragment it falls back to an empty `configure`, silently. That is what made the i18n catalogs never load.

  **Migration**: enable with the decorator or the blueprint, and configure with `blueprint.set`:

  ```ts
  // before (compiled, ran, configured nothing)
  export const AppConfig = defineConfig(defineCache({ default: 'redis', stores: [...] }))

  // after: enable on the manifest, configure with blueprint.set
  export const Application = defineStoneApp(handler, { name: 'my-app' }, [cacheBlueprint])

  export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.cache', {
    default: 'redis',
    stores: [...]
  }))
  ```

  READMEs and documentation pages are updated accordingly. `defineJobHandler` and `defineKeyRoute` are untouched: they declare a module, not a configuration bucket, and keep their imperative role next to `@JobHandler` and `@KeyRoute`.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Cache" module will be documented in this file.

## Unreleased
