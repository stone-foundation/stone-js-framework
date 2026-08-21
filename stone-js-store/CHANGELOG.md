# @stone-js/store

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

- c161c45: feat: `@stone-js/store`, a view-engine-agnostic universal store with SSR hydration

  Application state written once, read by any view engine. The core knows nothing of React, Vue, Svelte, the DOM or Node, so the same state layer runs during server rendering, in the browser and in React Native unchanged. That is the continuum applied to state rather than to requests.

  ```ts
  @Store({
    stores: [
      defineStore({ name: "tasks", state: { items: [], filter: "all" } }),
    ],
  })
  @StoneApp({ name: "my-app" })
  export class Application {}
  ```

  Every store is registered as `store.<name>`, so a component reaches it with `useContainer()` and a service takes it through its constructor. Enabled by its decorator or by `storeBlueprint` on the manifest, like every module here.

  **Hydration is not glue.** Stone.js already ships a keyed, XSS-safe snapshot channel (`@stone-js/use-view` owns the serializer, the view layer registers it in the container). A store reads its state out of it **at registration**, before the first render. Hydrating in an effect afterwards is what produces the flash of empty state every hand-rolled SSR integration suffers from, and it is the one thing no third-party store can do: it cannot write into a snapshot it does not know about. This module still imports no view layer, reading the snapshot duck-typed through the container, so a Vue or Svelte layer registering the same binding gets hydration for free.

  **Request isolation is the default.** `perRequest` defaults to `true`. A store held as a process-wide singleton leaks one visitor's state into the next visitor's page during server rendering, and nothing in development reveals it because there is only ever one request at a time. Pass `perRequest: false` for state that is genuinely process-wide.

  **Derived state compares before notifying.** `watch(selector, listener, equals?)` tells no one when the selected value did not change, and the default is reference equality with the trap documented rather than left as folklore: a selector building a fresh object is never equal to itself, so a naive subscription re-renders forever.

  The state is cloned in and out, so a caller cannot mutate the store through the object it passed in, and `reset` returns to the original rather than to whatever the state became. A snapshot is merged over the initial state, so one written before a key existed still hydrates into something usable.

  The service class is `StateStore`, leaving the bare `Store` name to the activation decorator, the same rule that gives `CacheManager`, `RealtimeManager` and `I18nManager` their suffixes.

- 97a6730: Clear the quality findings this cycle's work raised.

  Two are worth naming because they were real, not stylistic. An authorization failure built its message
  with `String(subject)`, so refusing a class or an instance said `Not allowed to read [object Object]`
  — an error that names nothing. And two regular expressions could be made super-linear by their own
  input: a trailing-slash strip in the test-module scan, and the declaration-rewriting pattern in the
  shared build, both rewritten so no input can force them to backtrack.

  The rest is shape: the SSG segment parser split into three named readers instead of one function
  holding every case, a nested ternary unfolded in the OpenAPI plugin, a duplicated directory walk
  shared in the build config, an escaped pattern read as `String.raw`, and a rejection path turned into
  a single exit so the error is raised where its message lives.

  `CORSHeadersMiddleware` and `MetaCORSHeadersMiddleware` are **removed**. They were deprecated with a
  documented replacement (`@Cors()` or `corsBlueprint`, the two ways a module is enabled), nothing in
  the framework used them, and a deprecated third activation path is worth deleting rather than keeping
  around to trip over.

- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
