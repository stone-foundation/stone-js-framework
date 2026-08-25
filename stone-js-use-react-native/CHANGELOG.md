# @stone-js/use-react-native

## 0.8.16

### Patch Changes

- Updated dependencies [7b78b7a]
- Updated dependencies [324b985]
- Updated dependencies [6d3a36e]
  - @stone-js/router@0.8.16
  - @stone-js/cli@0.8.16
  - @stone-js/react-native-adapter@0.8.16
  - @stone-js/use-react-core@0.8.16
  - @stone-js/use-view@0.8.16
  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16
  - @stone-js/browser-core@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/router@0.8.15
- @stone-js/browser-core@0.8.15
- @stone-js/use-view@0.8.15
- @stone-js/use-react-core@0.8.15
- @stone-js/cli@0.8.15
- @stone-js/react-native-adapter@0.8.15

## 0.8.14

### Patch Changes

- 627de9f: feat(use-react-native): the native navigator, wired

  `StoneNativeApp` shows the screen on top of the stack, which is what makes a first run work with
  nothing installed. It is the floor. The platform's own transitions, the swipe-back gesture, the
  hardware back button, and a screen keeping its own state while another covers it are things only a
  native navigator gives you, and none of them can be imitated in JavaScript. Until now the README
  explained how to wire one yourself; `StoneNativeStack` is that wiring, shipped.

  ```tsx
  import { registerRootComponent } from "expo";
  import { StoneNativeStack } from "@stone-js/use-react-native/navigation";

  registerRootComponent(() => (
    <StoneNativeStack screenOptions={{ headerShown: true }} />
  ));
  ```

  Nothing about a page changes. Each Stone screen becomes a native one, keyed by its own identity so
  the navigator keeps its state as the stack grows, and titled from the page's `head`.

  **The one thing worth understanding is a single comparison.** There are two stacks and one truth: the
  router owns navigation, so Stone's stack is the truth and the navigator displays it. A screen can then
  leave the navigator for two reasons, and only one needs answering. A swipe back removed it without
  telling Stone, so Stone still has it on top and it gets popped. A `useGoBack` or a `reset` popped it
  already, and the navigator is only catching up with a render it was given: popping again would eat the
  screen underneath. Comparing the departing screen's key with what Stone now has on top separates the
  two exactly, with no flag to keep and no window in which a fast double-back does the wrong thing. It
  is `shouldPopStone`, exported, and it is the part to read before writing your own navigator.

  **Behind `/navigation`, and depending on nothing.** React Navigation declares `react-native` as a
  peer, package managers install peers, `react-native` brings Metro, and Metro brings a version of
  `image-size` with two unpatched advisories: declaring these packages, even as optional peers, failed
  `pnpm audit --audit-level=high` for the whole workspace. So they are described by ambient
  declarations instead, the same conclusion the adapter reached about `react-native` itself, and the
  package's main entry imports nothing from them. An application that is happy with the floor installs
  nothing; one that wants the navigator runs `npx expo install`.

  **What is verified, and what is not.** The rule has nine cases against a real screen stack, and the
  component's wiring has seven with React Navigation stood in for: what a navigator _does_ with a screen
  is its business, and reproducing it under a test runner would test their library with ours. Resolution
  and bundling are verified for real: the starter bundles to Hermes bytecode for iOS and Android with
  the navigator in place, and to the web target too, so the whole chain can be seen in a browser tab
  before a device is involved. The transitions and the gesture themselves need a device, and nothing
  here pretends otherwise.

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
- Updated dependencies [13915d4]
- Updated dependencies [311d395]
  - @stone-js/router@0.8.14
  - @stone-js/core@0.8.14
  - @stone-js/browser-core@0.8.14
  - @stone-js/use-react-core@0.8.14
  - @stone-js/cli@0.8.14
  - @stone-js/react-native-adapter@0.8.14
  - @stone-js/use-view@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/use-react-core@0.8.13
- @stone-js/core@0.8.13
- @stone-js/config@0.8.13
- @stone-js/router@0.8.13
- @stone-js/browser-core@0.8.13
- @stone-js/use-view@0.8.13
- @stone-js/cli@0.8.13
- @stone-js/react-native-adapter@0.8.13

## 0.8.12

### Patch Changes

- 68a1acd: feat(starters): the mobile starters are Stone.js applications, in both paradigms

  The React Native starter was the proof of concept that unblocked the mobile work, and it still
  looked like one: a hand-written adapter in its own `adapter/` folder, a screen of green and red
  self-checks instead of an application, and Expo's default blue icon on the home screen. It also
  came alone, while every other starter comes as a declarative and an imperative pair.

  **Both paradigms now, and they are the same application twice.** `basic-react-native-declarative`
  enables the router, the adapter and the renderer with four decorators;
  `basic-react-native-imperative` does it with one `defineStoneReactNativeApp` call and two
  blueprints, and writes its page with `definePage` instead of `@Page`. Neither wraps the other.

  **The same identity as the web starters.** Same welcome screen, same words, same "Obsidienne &
  Braise" palette following the device's light or dark appearance, and the same Portal mark, drawn
  from the brand's own geometry. The icon, the splash, the Android adaptive layers and the favicon are
  the Portal too, so a phone's home screen shows Stone.js rather than Expo's placeholder. What differs
  from the web is only what a phone does differently: `View` for `div`, a `StyleSheet` for a
  stylesheet, `Linking` for an anchor.

  **The 300 lines of hand-written adapter are gone**, replaced by the packages that now exist:
  `@stone-js/react-native-adapter` and `@stone-js/use-react-native`, wired the documented way.
  `metro.config.js` is `withStone(getDefaultConfig(__dirname), __dirname)`, so the module manifest is
  collected before Metro bundles and nothing lists a screen.

  **And the tests are real.** They boot the kernel, the router, the adapter and the renderer under
  Node, send a deep link through the adapter's own navigation source, and assert what landed on the
  navigation stack: the route, the title `head` produced, and that an unknown route surfaces as a
  screen rather than a crash. Verified on both starters: 4 tests each, a clean `tsc --noEmit`, and an
  `expo export` producing Hermes bytecode for iOS and Android.

  **One addition to the renderer made that possible.** `@stone-js/use-react-native/metro` now exports
  `writeManifest` alongside `withStone`. `withStone` covers every way Metro can start, but Metro is
  not the only thing that needs `.stone/modules.ts` to exist: `tsc --noEmit` on a fresh clone reads
  the entry's `import { modules } from './.stone/modules'` before Metro has ever run, and so does a CI
  step that type-checks without bundling. The starters' `typecheck` script generates it first, which
  is why a fresh clone type-checks instead of failing on a missing import.

- c971168: fix: authentication reads the header, and a contract describes the API

  Six defects reported from a pilot application, each reproduced before it was touched.

  - `@stone-js/auth` read the bearer token with `event.get('Authorization')`, and that accessor deliberately refuses to read headers, because it also reads the query string and the body. So the real header was ignored, every request stayed anonymous, and `?Authorization=` would have been read in its place. It reads `getHeader` now.
  - `@stone-js/openapi` documented every endpoint under `/`: a route's `path` is the pathname of the event it is answering, and no event is bound while generating a document. It reads the declared template, translates `:id` into `{id}`, declares the parameters the template requires, and publishes both paths for an optional segment.
  - A Zod 4 schema converted to `{}`, an empty JSON Schema meaning "anything", so every documented body and response was silently unconstrained. A schema that can describe itself is now asked to.
  - An explicit `contract:` block replaced everything derived, so documenting one `404` deleted the derived success response. It merges instead, per status, and a declared success status replaces the derived one rather than joining it.
  - The derived success status was always `200`, even for a handler answering `201`. The response decorators now record the status they build, so the document cannot contradict the code it came from.
  - `@stone-js/resources`: every `@ApiResource` the container resolved crashed on `checker`, an optional dependency read straight off the container, which resolves any name it is asked for and throws when nothing is bound.
  - `@stone-js/core`: `@Middleware` could only ever declare kernel middleware, so a middleware that reads the matched route could be registered from a blueprint but not from the decorator. `layer: 'app' | 'kernel' | 'router'` closes that, `global` keeps working.

  Packaging: `@stone-js/i18n`, `@stone-js/mcp-dev`, `@stone-js/openapi` and `@stone-js/use-react-native` published types referencing `@stone-js/cli` while declaring it as a dev dependency only. It is an optional peer now, so an application is never asked to resolve a package nobody told it about.

- Updated dependencies [03bf130]
- Updated dependencies [c971168]
- Updated dependencies [c971168]
- Updated dependencies [4c50bc6]
  - @stone-js/cli@0.8.12
  - @stone-js/use-react-core@0.8.12
  - @stone-js/use-view@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/browser-core@0.8.12
  - @stone-js/react-native-adapter@0.8.12
  - @stone-js/router@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- 4f99eaa: docs(use-react-native): the fastest loop on a native application is a browser tab

  Expo serves a React Native application to a browser through `react-native-web`, with Fast Refresh,
  and the same code then runs on a device untouched. That is the loop most of a mobile application
  should be built in, and nothing said so.

  Verified rather than assumed: the official starter was bundled for the web target, and the whole
  chain goes through, adapter and renderer included. It is documented as opt-in, because the web
  target needs `react-dom` and `react-native-web`, which a native-only application has no reason to
  carry.

  Documented with its limits, which is the part that makes the loop trustworthy: `react-native-web`
  covers the core primitives, not every native module, so a screen built on the camera, on secure
  storage or on a native gesture handler still has to be tried on a device. Use the browser for the
  domain, the navigation and most of the interface; use a device before believing anything about the
  parts that are actually native.

- b2ff332: feat(use-react-native): a native application stops listing its modules

  A web application never lists its pages: the build collects them. A native one had to, and that
  was the last place the mobile story asked for something the other platforms do not. The reason was
  never conceptual, it was the bundler: collection is a bundler question, the web build asks Vite for
  `import.meta.glob`, and Metro has no such thing and would not understand one.

  So the question is answered before any bundler runs. `withStone` wraps a Metro configuration,
  collects everything under `app/` and writes `.stone/modules.ts`: real static imports, which is what
  Metro needs to see, extensionless so per-platform files (`HomePage.ios.tsx`) still win as they
  would for hand-written code, and sorted so the file is byte-identical between two runs on the same
  tree. Only rewritten when it changed, because Metro watches what it bundles and an identical
  rewrite would ask it to reload for nothing.

  ```js
  // metro.config.js
  const { getDefaultConfig } = require("expo/metro-config");
  const { withStone } = require("@stone-js/use-react-native/metro");

  module.exports = withStone(getDefaultConfig(__dirname), __dirname);
  ```

  ```ts
  import { modules } from "./.stone/modules";

  stoneApp({ modules }).run();
  ```

  **It hooks into `metro.config.js` on purpose.** Metro loads that file whatever brought it up, so
  `expo start`, `expo run:ios` and an EAS build all get the generation without anyone remembering to
  ask. A command could not make that claim. It runs at Metro start rather than continuously, so
  adding a page to a running dev server means restarting it; editing one needs nothing.

  **And the CLI gains a `native` target**, auto-discovered from this package, so there is one
  vocabulary across platforms: `stone dev native` and `stone build native` collect the modules and
  hand the rest to `expo start` and `expo export`. Deliberately thin: Expo and Metro own native
  bundling, and producing an installable application stays `expo run:ios` or an EAS build, which need
  a native toolchain and are better commands than a wrapper would be. It is also the first target
  registered by a module rather than by the CLI, which is what the registered-targets work was for.

  **One CLI change, and it removes the last hardcoded path from a command.** A `self-hosted` target
  now declares what `stone serve` should launch, through `devEntry`, exactly as it already declared
  where `stone preview` starts from. The React target names its generated Vite server; the native
  one names nothing, because Expo's own process is the dev server and there is nothing left to
  supervise. `stone serve` no longer knows any target's file layout.

- 13cebd1: fix: authentication reads the header, and a contract describes the API

  Six defects reported from a pilot application, each reproduced before it was touched.

  - `@stone-js/auth` read the bearer token with `event.get('Authorization')`, and that accessor deliberately refuses to read headers, because it also reads the query string and the body. So the real header was ignored, every request stayed anonymous, and `?Authorization=` would have been read in its place. It reads `getHeader` now.
  - `@stone-js/openapi` documented every endpoint under `/`: a route's `path` is the pathname of the event it is answering, and no event is bound while generating a document. It reads the declared template, translates `:id` into `{id}`, declares the parameters the template requires, and publishes both paths for an optional segment.
  - A Zod 4 schema converted to `{}`, an empty JSON Schema meaning "anything", so every documented body and response was silently unconstrained. A schema that can describe itself is now asked to.
  - An explicit `contract:` block replaced everything derived, so documenting one `404` deleted the derived success response. It merges instead, per status, and a declared success status replaces the derived one rather than joining it.
  - The derived success status was always `200`, even for a handler answering `201`. The response decorators now record the status they build, so the document cannot contradict the code it came from.
  - `@stone-js/resources`: every `@ApiResource` the container resolved crashed on `checker`, an optional dependency read straight off the container, which resolves any name it is asked for and throws when nothing is bound.
  - `@stone-js/core`: `@Middleware` could only ever declare kernel middleware, so a middleware that reads the matched route could be registered from a blueprint but not from the decorator. `layer: 'app' | 'kernel' | 'router'` closes that, `global` keeps working.

  Packaging: `@stone-js/i18n`, `@stone-js/mcp-dev`, `@stone-js/openapi` and `@stone-js/use-react-native` published types referencing `@stone-js/cli` while declaring it as a dev dependency only. It is an optional peer now, so an application is never asked to resolve a package nobody told it about.

- Updated dependencies [b2ff332]
- Updated dependencies [13cebd1]
- Updated dependencies [b568e53]
  - @stone-js/cli@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/use-react-core@0.8.11
  - @stone-js/browser-core@0.8.11
  - @stone-js/react-native-adapter@0.8.11
  - @stone-js/router@0.8.11
  - @stone-js/use-view@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- f90647b: feat: `@stone-js/use-react-native`, so your pages become native screens

  The renderer half of the mobile story. A page that answers `/tasks/:id` behind an HTTP adapter
  answers it on a phone too, with the same decorator, the same loader, the same layout, the same
  error pages and the same hooks. What changes is where the result goes: a browser replaces a
  document, a phone pushes a screen onto a stack.

  Everything before that last step comes from `@stone-js/use-react-core` unchanged, which is
  what the extraction was for. This package is small because of it.

  **A stack, as plain state.** `ScreenStack` holds the screens, with `push`, `replace` and
  `reset` semantics and nothing else: no React, no navigation library. That is deliberate. It
  means the navigation semantics are testable without a device, and it means the display is
  yours to choose. `StoneNativeApp` shows the top screen with nothing to install, so an
  application runs the moment the packages are installed; a native navigator
  (`@react-navigation/native-stack`) drives itself from the same object and brings what only it
  can bring: the platform's transitions, the swipe-back gesture, and a screen keeping its own
  state while another covers it. The README shows that wiring. This package imports nothing but
  React and Stone.js, so it adds no native module and no build step of its own.

  Navigating goes through the router (`useNavigate`), never straight to the stack, so a route's
  middleware and loader run exactly as they would for a deep link. `reset` empties the stack
  before navigating rather than travelling as an intent, because the router's navigation API
  carries whether to replace and nothing more, and inventing a third channel for it would be a
  fiction.

  Two smaller decisions worth knowing. `NativeViewEngine` implements the agnostic view contract
  with the screen stack as its host, which is exactly what that contract's host parameter was
  generalised for, and it refuses `renderToString` loudly rather than returning something
  meaningless, so an application misconfigured for SSR says so. And a page's head has nowhere to
  go on a device, so its title becomes the screen's title and the rest is dropped.

  Also included: `NativeRuntime` under the same `reactRuntime` alias the web runtime uses, so a
  component asking for the runtime gets the one for the platform it is on; `@UseReactNative()`
  and `useReactNativeBlueprint` as the two activation paths; and `defineStoneReactNativeApp`
  with the same signature as its web counterpart, so an application moving to a phone changes
  which function it calls and nothing else.

- Updated dependencies [18644c8]
- Updated dependencies [9f074f8]
- Updated dependencies [318cbf5]
  - @stone-js/router@0.8.10
  - @stone-js/use-view@0.8.10
  - @stone-js/react-native-adapter@0.8.10
  - @stone-js/core@0.8.10
  - @stone-js/use-react-core@0.8.10
  - @stone-js/browser-core@0.8.10
  - @stone-js/config@0.8.10
