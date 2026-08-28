# @stone-js/react-native-adapter

## 0.8.18

### Patch Changes

- @stone-js/core@0.8.18
- @stone-js/config@0.8.18
- @stone-js/router@0.8.18
- @stone-js/browser-core@0.8.18

## 0.8.17

### Patch Changes

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17
  - @stone-js/browser-core@0.8.17
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
  - @stone-js/browser-core@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/router@0.8.15
- @stone-js/browser-core@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/router@0.8.14
  - @stone-js/core@0.8.14
  - @stone-js/browser-core@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/config@0.8.13
- @stone-js/router@0.8.13
- @stone-js/browser-core@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/browser-core@0.8.12
  - @stone-js/router@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/browser-core@0.8.11
  - @stone-js/router@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- 9f074f8: feat: `@stone-js/react-native-adapter`, so a domain runs on a phone

  The Integration dimension for a native mobile application. It captures what a phone can ask
  of an application (the URL it was launched with, deep links delivered while it runs,
  navigation from inside the app), turns each one into an `IncomingEvent`, and runs the render
  effect the view layer deferred. The domain is untouched: a handler answering `/tasks/:id`
  behind an HTTP adapter answers the same route when a notification opens `myapp://tasks/42`,
  and nothing in it knows the difference.

  It is the native counterpart of `BrowserAdapter`, with a `NavigationSource` where the browser
  has `window`, and it produces the same `IncomingBrowserEvent`, so pages and middleware move
  between web and native untouched.

  **Navigation closes a loop rather than hardcoding one.** The browser pushes a History entry
  and dispatches an event, which the adapter hears and answers. A phone has no History API, so
  the adapter owns a source that plays both parts: it wires `stone.router.navigator` during the
  build phase to push into the very source it listens to. `router.navigate('/tasks')` from a
  screen therefore re-enters the kernel exactly like a deep link, and pages calling `navigate`
  need no native-specific code. Both halves are the same object, which is why that wiring
  happens once, before any event, and not at runtime.

  **Deep links are the platform's, but the module is not imported.** `Linking` is resolved
  through a `LinkingResolver` that imports `react-native` lazily and returns nothing when it is
  absent. That is what makes the whole chain, adapter and kernel included, run under a plain
  Node test runner, and why a server-side suite that pulls this package in transitively still
  works.

  `react-native` is deliberately **not** a peer dependency either. Nothing here imports it
  statically, and any application that could satisfy such a peer is a React Native application,
  where it is already a direct dependency: the declaration would inform nobody, while pulling
  the entire Metro toolchain into the install of every workspace that merely builds against this
  package. Metro still needs a literal specifier to bundle the real module on a device, so the
  lookup keeps one and a local ambient declaration keeps the compiler satisfied when the package
  is absent, which in this repository is always.

  Enabled the two usual ways: `@ReactNative()` or `reactNativeAdapterBlueprint` on the
  manifest. Zero configuration by default: in-app paths resolve against `stone://app` (settable
  under `stone.reactNative.baseUrl`, so links and in-app navigation share an origin), and
  cookies are kept in memory since there is no document.

  **`AdapterConfig.variant` is no longer a closed union.** It was `'server' | 'browser' |
'console'`, so a platform outside that list could not name its own category without a core
  release: platform vocabulary held in the platform-agnostic core, which is the thing the
  architecture forbids. It is now `AdapterVariant`, which keeps the known values for completion
  (and adds `'native'`) while accepting any string. Nothing in the framework branches on it,
  which is what makes widening it safe; `platform` remains the value to match on.

- Updated dependencies [18644c8]
- Updated dependencies [9f074f8]
  - @stone-js/router@0.8.10
  - @stone-js/core@0.8.10
  - @stone-js/browser-core@0.8.10
  - @stone-js/config@0.8.10
