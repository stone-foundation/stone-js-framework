# Changelog

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

  - @stone-js/pipeline@0.8.10
  - @stone-js/config@0.8.10
  - @stone-js/service-container@0.8.10

## 0.8.9

### Patch Changes

- 0629318: Point every README link at somewhere that exists.

  The per-module repositories were retired when the framework moved to a single one, so 36 links
  across 18 READMEs answered with a 404: the exact links a newcomer clicks first, "Contributing"
  and "API". The contributing guide now points at the monorepo, and the API reference at the
  published one.

  `docs/` was never a durable target either, retired repository or not: it is TypeDoc output, and
  every build begins by deleting it.

- 8b2bd5d: fix: CORS gets its two activation paths, and stops discarding the response it was meant to decorate

  `@Cors()` and `corsBlueprint` are the new, and only, ways to enable CORS. Both install it on the two dimensions it actually needs, because a cross-origin failure can happen on either side of the kernel:

  - **Kernel** (`HandleCorsMiddleware`): the normal path. Every response the kernel produces leaves with its CORS headers, and a preflight is answered outright with `preflightStop`.
  - **Adapter** (`EnsureCorsHeadersHook`, on `onBuildingRawResponse`): the last resort. When a request dies before or around the kernel, no kernel middleware ever ran, and a response without `Access-Control-Allow-Origin` is not a status the browser can read: it is an opaque network error. This is the same reason the framework carries an error handler at both levels.

  ```ts
  @Cors({ origin: ["https://app.example.com"] })
  @StoneApp({ name: "my-app" })
  export class Application {}

  // or, imperatively
  export const Application = defineStoneApp(handler, { name: "my-app" }, [
    corsBlueprint,
  ]);
  ```

  Nothing is allowed until you name an origin: with none configured, no `Access-Control-Allow-Origin` header is emitted at all, so enabling CORS never opens an application by itself.

  **`EnsureCorsHeadersHook` was replacing successful responses.** It handed its CORS middleware a `next` that unconditionally built a fresh `OutgoingHttpResponse.create({ statusCode: 500 })`, so `context.outgoingResponse` became an empty 500 (`content: undefined`, `prepared: false`) on **every** request, including the ones that succeeded. The wire response survived only by luck: every adapter's `ServerResponseMiddleware` copies the real response into the raw builder before this hook runs, and the hook's `addIf` will not overwrite a status that is already there. Anything reading `context.outgoingResponse` afterwards, a later hook, `onTerminate`, or an adapter that builds its response at that point, saw the empty 500 instead of the answer. It now decorates the response that exists and synthesizes one only when there is none, which is the case it was written for.

  **Both starters activate CORS again**, through the decorator and the blueprint respectively. They previously reached it through `defineBlueprintMiddleware(CORSHeadersMiddleware)`; `CORSHeadersMiddleware` is deprecated in favour of the two paths above, and is now the only thing that helper was used for in first-party code.

  **`BlueprintBuilder` asserts the pipeline still produced a blueprint** and otherwise throws a `SetupError` naming the broken contract. A build-phase middleware runs once, before any event, and must return `await next(context)`; registering a per-event middleware as one is the usual way to break that, since both shapes are `handle(context, next)` and neither the types nor the runtime object to it. The assertion is a private method on the builder it protects.

- 6584764: feat(core): order configurations with `priority`

  A real application has several configurations (static settings, a remote overlay, one per vendable module) and some depend on values another one loads. Nothing ordered them, so two configurations writing the same key had an undefined winner, and a configuration reading a remotely-loaded value could not guarantee it ran after the loader. Consumers merged unrelated concerns into one class to force the order by hand.

  `@Configuration({ priority })` and `defineConfig(fn, { priority })` now order them, ascending, with named steps: `ConfigurationPriority.Sources` (0), `.App` (10, the default) and `.Module` (20). Equal priorities keep their declaration order, so a configuration that declares nothing behaves exactly as before.

  Configurations also run **after** the module scan rather than interleaved with it, which is what makes explicit configuration reliably win over the implicit configuration of decorators, whatever order modules were discovered in.

- caf14e3: fix(core): decorator SetupErrors name their likely cause

  `SetupError: This decorator can only be applied to class methods` gave no lead, and the toolchain rule behind it was written nowhere. The three decorator guards now state it: Stone.js needs TC39 2023-11 decorators, the usual cause is a transformer emitting the legacy form, `experimentalDecorators` makes esbuild (so Vite and Vitest) do exactly that, and every transformer in the project must emit 2023-11. Each message links the troubleshooting page.

  The Troubleshooting page was also **wrong** on this, and is corrected: it told readers not to enable `experimentalDecorators`, which is impossible today. Verified with `tsc`: without the flag a method decorator fails to typecheck (`TS1241`, `TS1270`), because the published signatures are legacy-shaped while the bodies require a 2023-11 context. The page now explains why the flag is a compiler appeasement, ships the Vitest + Babel config that lets a real application boot in tests, records that esbuild 0.25 implements 2023-11 correctly on its own (so the flag is what forces Babel back in), and documents the symbol-key pitfall where `JSON.stringify(Class[Symbol.metadata])` prints `{}` even when everything is correct.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- e507985: fix(core): the error-handler contract accepts what the kernel consumes

  `IErrorHandler.handle` required a fully built response type, while the intended usage (and the framework's own `RouterErrorHandler`) returns plain response options that the kernel hands to its `responseResolver`. The framework cast itself and every consumer had to reproduce that cast.

  `FunctionalErrorHandler` now returns `UResponse | ResponseResolverOptions`, a pure widening, so existing handlers keep compiling. `RouterErrorHandler` drops its internal cast accordingly.

- 2ed390b: Boot the real application in a test without listing it, and read its response.

  `createTestApp()` now discovers the app from `app/**` instead of requiring a hand-written module
  list. A list drifts, and it drifts silently: a forgotten handler answers 404 and reads as a routing
  bug, a forgotten `@Configuration` makes a whole suite validate behaviour production does not have.
  Which files count is decided by `@stone-js/filesystem`, the same definition the CLI uses, so a suite
  cannot boot a different application than the one that ships. Listing modules stays possible, for a
  test that deliberately runs a slice of the app.

  Also new: `bindings` substitutes container registrations (a fake repository, a fixed clock) through a
  real provider, so the code under test resolves the fake exactly as it resolves the real one;
  `envFile` loads `.env.test` before booting; and the response exposes `json()`, `text()` and `html()`,
  because `content` is the wire payload and every project was writing the same parsing helper. A
  rendered page is asserted with `html()` like any other response, with no assertion library bundled
  here on purpose.

  `@stone-js/filesystem` gains `appModuleFiles()` and `DEFAULT_APP_MODULES_PATTERN`, the one definition
  of an application's source files. `@stone-js/core` now re-exports `BindingValue` alongside
  `IContainer`, so a module registering something on the container can name what it may bind.

- Updated dependencies [0629318]
- Updated dependencies [f6d9fe4]
  - @stone-js/config@0.8.9
  - @stone-js/pipeline@0.8.9
  - @stone-js/service-container@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/pipeline@0.8.8
- @stone-js/config@0.8.8
- @stone-js/service-container@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/pipeline@0.8.7
- @stone-js/config@0.8.7
- @stone-js/service-container@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/pipeline@0.8.6
- @stone-js/config@0.8.6
- @stone-js/service-container@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/pipeline@0.8.5
- @stone-js/config@0.8.5
- @stone-js/service-container@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/pipeline@0.8.4
- @stone-js/config@0.8.4
- @stone-js/service-container@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/pipeline@0.8.3
- @stone-js/config@0.8.3
- @stone-js/service-container@0.8.3

## 0.8.2

### Patch Changes

- d7f213c: Code-quality pass (SonarCloud) with one security fix.

  - Fix a broken JSONP callback sanitizer in `@stone-js/http-core`: a malformed character class
    (`[^\\[\\]\w$.]`) closed early, so the "sanitized" callback was left almost untouched and could
    carry `<`/`>`. It now strips characters outside `[\w$.[\]]`, closing a reflected-XSS vector.
  - Harden the website deploy workflow: GitHub Pages permissions moved from workflow level to the
    jobs that need them (least privilege).
  - Assorted maintainability cleanups: `RegExp.exec` over `String.match`, `Set` membership,
    `export…from` re-exports, extracted nested templates/ternaries, `.some()` over
    `filter().length`, default parameters, and more.

  No public runtime behavior change (other than the JSONP sanitizer now behaving as intended).

  - @stone-js/pipeline@0.8.2
  - @stone-js/config@0.8.2
  - @stone-js/service-container@0.8.2

## 0.8.1

### Patch Changes

- Maintenance release: monorepo hygiene and code-quality cleanup (no runtime behavior change).

  - Remove obsolete per-module `.github` directories and stale `package-lock.json` files; the
    monorepo builds from a single root pnpm workspace and root CI, which clears the Dependabot
    alert noise those legacy trees produced.
  - SonarCloud pass across the workspace: `node:` import protocol, `String.raw`/`codePointAt`
    modernizations, redundant union-type cleanups, unique test titles, extracted nested ternaries,
    and optional catch bindings.
  - Fix a quadratic (super-linear) slash-trim regex in the cloud-file S3/GCS/Azure drivers.
  - Replace MD5 with SHA-256 in the cache hash helpers.

  `replaceAll`/`Object.hasOwn` are intentionally avoided so the published packages stay ES2015-safe
  for the browser (preset-env runs without polyfills).

  - @stone-js/pipeline@0.8.1
  - @stone-js/config@0.8.1
  - @stone-js/service-container@0.8.1

All notable changes to the "Stone.js Core" extension will be documented in this file.

## Unreleased

## [0.2.1](https://github.com/stone-foundation/stone-js-core/compare/v0.2.0...v0.2.1) (2026-06-13)

### Bug Fixes

- updated Container dependencies to fix bugs ([#41](https://github.com/stone-foundation/stone-js-core/issues/41)) ([59a6e39](https://github.com/stone-foundation/stone-js-core/commit/59a6e394d7d4b96f8b1b296ebeba890c8813095e))

## [0.2.0](https://github.com/stone-foundation/stone-js-core/compare/v0.1.4...v0.2.0) (2026-04-05)

### Features

- Add onEvent hook to kernel for incoming event injection ([#38](https://github.com/stone-foundation/stone-js-core/issues/38)) ([0e50ee4](https://github.com/stone-foundation/stone-js-core/commit/0e50ee4552f6844287b38c6def62ad947ec7d204))

## [0.1.4](https://github.com/stone-foundation/stone-js-core/compare/v0.1.3...v0.1.4) (2026-03-29)

### Bug Fixes

- export IContainer directly ([#37](https://github.com/stone-foundation/stone-js-core/issues/37)) ([a1d2a92](https://github.com/stone-foundation/stone-js-core/commit/a1d2a92a59de5d2cce271cd03225f3341b4d3791))
- register event listener in boot stage instead of register stage ([#35](https://github.com/stone-foundation/stone-js-core/issues/35)) ([aa09e56](https://github.com/stone-foundation/stone-js-core/commit/aa09e568169f8c4e31af0a53be6a253620847aa0))

## [0.1.3](https://github.com/stone-foundation/stone-js-core/compare/v0.1.2...v0.1.3) (2025-07-19)

### Bug Fixes

- update deps and fix response guard in kernel ([#22](https://github.com/stone-foundation/stone-js-core/issues/22)) ([5cb2081](https://github.com/stone-foundation/stone-js-core/commit/5cb2081d4a0ee3eada4ac54584bb433293690913))

## [0.1.2](https://github.com/stone-foundation/stone-js-core/compare/v0.1.1...v0.1.2) (2025-07-01)

### Bug Fixes

- bind non-global middleware to the container ([#19](https://github.com/stone-foundation/stone-js-core/issues/19)) ([9942811](https://github.com/stone-foundation/stone-js-core/commit/99428119fe074bafa7fff19c351cf03515fadecf))

## [0.1.1](https://github.com/stone-foundation/stone-js-core/compare/v0.1.0...v0.1.1) (2025-06-12)

### Miscellaneous Chores

- migrate to stone-foundation, integrate sonar cloud and add security policy ([#14](https://github.com/stone-foundation/stone-js-core/issues/14)) ([fa3aa5e](https://github.com/stone-foundation/stone-js-core/commit/fa3aa5e08f8ebda739bd4fb0a7ba61d502b68790))

## [0.1.0](https://github.com/stone-foundation/stone-js-core/compare/v0.0.4...v0.1.0) (2025-06-04)

### Features

- major internal restructuring and cleanup ([#10](https://github.com/stone-foundation/stone-js-core/issues/10)) ([eb49057](https://github.com/stone-foundation/stone-js-core/commit/eb4905700b68d877c83920dea41d27fb1c7f6b98))
- This Version introduces a comprehensive internal refactoring of the Stone.js core module to improve maintainability, developer experience, and project readiness for future releases.

#### Highlights

- **Documentation Overhaul**

  - Updated `StoneFactory`, `Kernel`, and related modules to match the latest internal API.
  - Removed outdated references and improved clarity for new contributors.

- **License and Legal**

  - Switched project license from **Apache 2.0** to **MIT**.
  - Updated `README.md` to reflect the new licensing and project scope.

- **CI & DevOps Improvements**

  - Integrated **Codecov** for test coverage reporting.
  - Added **Dependabot** configuration for automated dependency updates.

- **Blueprint Utilities**

  - Introduced new utility functions to streamline blueprint definition and validation.

- **Testing Enhancements**

  - Achieved 100% unit test coverage on core adapters and blueprint modules.
  - Improved test organization and consistency across the project.

- **Imperative API Polishing**

  - Refined the imperative API for better developer ergonomics and internal coherence.

This restructuring lays the groundwork for the upcoming beta phase and prepares the core for long-term stability.

## [0.0.4](https://github.com/stone-foundation/stone-js-core/compare/v0.0.36...v0.0.4) (2025-01-21)

### Features

- implement response resolver for kernel ([7b609ec](https://github.com/stone-foundation/stone-js-core/commit/7b609ec8ba784ecdcf8353e8626cb5efb0b144ab))

## [0.0.36](https://github.com/stone-foundation/stone-js-core/compare/v0.0.35...v0.0.36) (2025-01-06)

### Features

- improve lifecycle hooks, implement error handler mechanism and legacy decorator compatibility ([8375902](https://github.com/stone-foundation/stone-js-core/commit/83759020101bdf94fc7c7a0d8609e63689d57c0f))

### Bug Fixes

- fix typing issues and update dependencies ([d28941a](https://github.com/stone-foundation/stone-js-core/commit/d28941aea6c8a2d26eb8cc9621f78faa8122d968))

## [0.0.35](https://github.com/stone-foundation/stone-js-core/compare/v0.0.34...v0.0.35) (2024-12-07)

### Miscellaneous Chores

- fix issues in errorHandler and allow onTerminate hook to finish gracefully ([bd81faa](https://github.com/stone-foundation/stone-js-core/commit/bd81faa568439cf30eb0c939171bd081c0b50861))

## [0.0.34](https://github.com/stone-foundation/stone-js-core/compare/v0.0.33...v0.0.34) (2024-12-05)

### Miscellaneous Chores

- move ErrorHandler config from global config to adapter config ([775bef5](https://github.com/stone-foundation/stone-js-core/commit/775bef589e4302e7bceb11d58608ca782f3078c7))

## [0.0.33](https://github.com/stone-foundation/stone-js-core/compare/v0.0.32...v0.0.33) (2024-12-01)

### Miscellaneous Chores

- rename AdapterBuilder to AdapterEventBuilder ([59c27bd](https://github.com/stone-foundation/stone-js-core/commit/59c27bdae04e7adc72d7c3e25cee704d5e04ce0c))

## [0.0.32](https://github.com/stone-foundation/stone-js-core/compare/v0.0.31...v0.0.32) (2024-11-28)

### Miscellaneous Chores

- change the way Adapter and Kernel handle and process incoming event ([c4dbb69](https://github.com/stone-foundation/stone-js-core/commit/c4dbb69a8c86aa6134b62f7d9cac7dabb444c749))
- make OutgoingResponse properties mutable ([9cce3ac](https://github.com/stone-foundation/stone-js-core/commit/9cce3accbbae4e07f941cf224818cba52006a712))

## [0.0.31](https://github.com/stone-foundation/stone-js-core/compare/v0.0.3...v0.0.31) (2024-11-25)

### Miscellaneous Chores

- throw SetupError for blueprint utilities ([a1d0e9f](https://github.com/stone-foundation/stone-js-core/commit/a1d0e9f001d3ced56e24beb77bf778d53bbcde5a))

## [0.0.3](https://github.com/stone-foundation/stone-js-core/compare/v0.0.2...v0.0.3) (2024-11-25)

### Miscellaneous Chores

- add custom errors ([dd7eaec](https://github.com/stone-foundation/stone-js-core/commit/dd7eaec566465ef84c36b87b824f8ea9ab76e8fa))

## 0.0.2 (2024-11-23)

### Features

- implement core ([be89f75](https://github.com/stone-foundation/stone-js-core/commit/be89f756f02a94c320588453a86b3e95bc4e060f))
