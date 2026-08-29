# Changelog

## 0.8.19

### Patch Changes

- 6f4f908: fix: `@NotificationChannel` and `@JobHandler` compile again

  Both decorators failed with `TS2693: only refers to a type, but is being used as a value` for **every** TypeScript consumer, while working perfectly in JavaScript. The documentation teaches both, with the exact code.

  The cause is one line of the build. Each package's public entry point is a barrel of `export *` lines, and in these two a decorator shared its name with a type declared in another file: `NotificationChannel` was also the channel port, `JobHandler` was also the handler shape. Two star exports offering one name make the export **ambiguous** (`TS2308`), so TypeScript keeps neither, the name leaves the public types, and the JavaScript bundle keeps exporting the function. Green tests, green build, an API nobody could call.

  It cannot be repaired from the barrel. Re-exporting both halves explicitly resolves the value and loses the type, and merging them needs both declarations in one file, which a barrel of re-exports is not. So the name is freed at the source, and the decorators keep the name the documentation teaches:

  - `@stone-js/notifications`: the channel port is now **`Channel`** (was `NotificationChannel`). `NotificationChannelFactory` is unchanged and returns `Channel`.
  - `@stone-js/queue`: the handler shape is now **`JobHandlerType`** (was `JobHandler`). `JobHandlerMeta` and `JobHandlerOptions` are unchanged.

  **This renames two exported types.** An application that annotated against them changes the import; one that used the decorators gains a compiler that accepts them. Nothing changes at runtime, in either direction.

  Two guards so the class cannot come back. The build now **fails** when two declarations reaching a public entry point share a name, naming both files, because a name that silently leaves the public types is exactly what shipped here; the dual browser/server builds are unaffected, since those trees are already kept off the barrel. And both packages gain a type-level test compiled against their built declarations, using the decorator the way the documentation writes it. Verified against the published 0.8.18 types: the new tests reproduce `TS2693` there, and pass on this build.

- a33d072: fix: work and subscriptions that outlive the event that made them

  The last two modules holding inter-request state where the framework rebuilds it. Same defect already fixed in `@stone-js/rate-limit` and `@stone-js/cache`: the driver kept its state in the instance, and the container is an execution context, rebuilt for every event.

  **`@stone-js/queue` dropped every job.** Measured on the published 0.8.18, outside the monorepo: dispatch a job, then `size()` answers `1` from the instance that dispatched it and `0` from the next one, and the worker reserves nothing. Silently, with a green suite, because a test builds the connection once.

  That reached further than the queue. `@stone-js/notifications` hands its deliveries to a queue **as soon as one is registered in the container**, so an application installing both modules had `notify()` return `{ queued: true }`, the job land in a `Map` that died with the event, and no notification ever delivered. No error, no log.

  **`@stone-js/realtime` lost its subscriptions and its presence.** A listener is registered once, usually while an adapter starts, and has to be there for every broadcast afterwards. Held per instance it was not: a broadcast reached the listeners registered during that one event and nobody else, so an adapter that subscribed at boot received nothing from then on. Presence had the same shape, a socket joining a channel was gone by the next message.

  So the state moved to where it belongs: **the driver**. `MemoryQueue`, `MemoryBroadcaster` and `MemoryConnectionStore` hold theirs, filed under the name they were configured with, so two named drivers stay apart exactly as two Redis prefixes would. Managers, providers and everything else are still rebuilt per event, unchanged.

  All three now say plainly what they are: one process wide, right for a single server and for tests, and **not** a shared queue, a shared fan-out or shared presence anywhere else. Two instances behind a load balancer each hold their own; on a function-as-a-service platform a cold start loses whatever had not run. Configure Redis there, or register your own driver.

  `MemoryBroadcaster` and `MemoryConnectionStore` gain `clear()`, because state that outlives an instance needs something able to end it, which `MemoryRateLimiter` already had.

  Five behavioural tests pin it, and every one of them fails without the fix: a job dispatched is still there for the next connection, a job filed under another name is not, a listener registered by a previous instance receives a broadcast, a connection stays joined for the next instance to find, and two drivers of the same kind stay apart.

  Closes #244.

- Updated dependencies [6b76c36]
- Updated dependencies [cb52a51]
  - @stone-js/core@0.8.19
  - @stone-js/router@0.8.19
  - @stone-js/config@0.8.19

## 0.8.18

### Patch Changes

- @stone-js/core@0.8.18
- @stone-js/config@0.8.18
- @stone-js/router@0.8.18

## 0.8.17

### Patch Changes

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17
  - @stone-js/router@0.8.17
  - @stone-js/config@0.8.17

## 0.8.16

### Patch Changes

- Updated dependencies [7b78b7a]
- Updated dependencies [324b985]
- Updated dependencies [6d3a36e]
  - @stone-js/router@0.8.16
  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/router@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/router@0.8.14
  - @stone-js/core@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/config@0.8.13
- @stone-js/router@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/router@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/router@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [18644c8]
- Updated dependencies [9f074f8]
  - @stone-js/router@0.8.10
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
- Updated dependencies [5e01789]
- Updated dependencies [be13033]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [b3efe5f]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/router@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8
- @stone-js/router@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7
- @stone-js/router@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6
- @stone-js/router@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5
- @stone-js/router@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/router@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/router@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/router@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/router@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Queue" module will be documented in this file.

## Unreleased

### Miscellaneous Chores

- the key-router primitive moved into `@stone-js/router`; import `KeyRouter` / `createKeyDecorator` / `collectKeyHandlers` from `@stone-js/router` (was `@stone-js/key-router`).
