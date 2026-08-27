# Changelog

## 0.8.17

## 0.8.16

## 0.8.15

### Patch Changes

- e48aca0: test(starters): the monorepo starter's applications are tested the same way everywhere

  Two pull requests crossed, and the monorepo starter came out of it inconsistent with the rest.

  **Its web test was broken on `main`.** When `makeIncomingHttpEvent` moved to `@stone-js/testing/http`,
  twenty-one files were updated; this one was on another branch at the time and so was missed. It now
  imports from the subpath, and the application declares `@stone-js/http-core` explicitly rather than
  relying on a peer resolution to provide it.

  **Its mobile application now has the two suites the standalone starters have.**
  `TaskListScreen.spec.ts` asks what a route resolves to, which every platform answers the same way, so
  it reads exactly like the web application's test next to it: same domain, same assertions, same
  counts, through two different contexts. `navigation.spec.ts` keeps the native question, with the real
  adapter and the real screen stack. Its Vitest configuration inlines `@stone-js/testing`, which is what
  lets module discovery import TypeScript at run time.

  **And a debug file I left behind is deleted.** `lab/apps/spa/tests/probe.spec.ts` was committed by
  accident with the monorepo starter, and it was already failing: it used the import that had just
  moved. Nothing caught it because the lab applications are excluded from `test:ci`, which is worth
  knowing on its own.

## 0.8.14

### Patch Changes

- d47ddd7: feat(starters): one domain, two applications

  A monorepo where the interesting file is the one that runs everywhere. `@acme/domain` holds the
  entities and the behaviour and imports `@stone-js/core` and nothing else about a platform: no
  `Request`, no `Response`, no `window`, no `View`. `@acme/web` and `@acme/mobile` both depend on it,
  and neither has a copy of it.

  Their `Application.ts` files differ by two decorators, `@Browser()`/`@ReactNative()` and
  `@UseReact()`/`@UseReactNative()`, and by nothing else. Their pages' `handle` and `head` are
  identical line for line, because answering a route is not a platform question; only `render` differs,
  and only in what it draws with.

  The three suites sit at three levels, and the cheapest one carries the most: the domain boots nothing
  and tests plain objects in milliseconds, the web application boots the real kernel and reads the HTML
  that came back, and the mobile one boots the kernel, adapter and renderer under Node, sends a deep
  link and asserts the navigation stack. The web and mobile suites make the same assertions about the
  same domain through two different contexts, which is the claim the starter exists to demonstrate.

  **Two things a web-and-mobile workspace genuinely needs, both documented in its README.** React is
  pinned at the root, because Expo pins it exactly and a workspace holding one React with a different
  React DOM fails at run time with "Incompatible React versions". And the domain's relative imports
  carry their `.js`, because it is published as ESM under `moduleResolution: NodeNext`.

  Verified: the domain builds and passes 8 tests, the web application builds (CSR) and passes 2, the
  mobile one passes 3 with a clean `tsc --noEmit` and an `expo export` producing Hermes bytecode, with
  Metro resolving the shared package across the workspace.

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

- 2f7d043: test(starters): a native screen is tested the way a web page is

  The React Native starters tested their domain through the real adapter, supplying a navigation source
  and a screen stack, because nothing else could reach a native application. That was fifty lines to
  answer a question every platform answers the same way: what does this route resolve to.

  Each starter now has two suites, and the split says which question is which.

  `tests/HomeScreen.spec.ts` is the web starters' test, unchanged in shape: `createTestApp()` discovers
  `app/**`, one event goes through the kernel, and the head proves the loader read the deep link's
  parameter. Six lines of setup became one.

  ```ts
  const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM });
  const response = await app.send(
    makeIncomingBrowserEvent({ url: "stone://app/?name=Ada" })
  );
  ```

  `tests/navigation.spec.ts` keeps what only a device does: the real React Native adapter, the real
  screen stack, a deep link pushing a screen, and the stack replacing rather than duplicating a route
  already on top. Nothing is substituted there, on purpose.

  **Their Vitest configuration now inlines `@stone-js/testing`**, which is what lets `createTestApp()`
  import an application's TypeScript at run time. `stone test` does this for a project it drives; an
  Expo project runs Vitest directly, so it states it itself. Without it, discovery fails with
  `Unknown file extension ".ts"`, naming the application's own entry file.

- 6df78d4: feat(testing): platform-agnostic, and able to test what an application actually receives

  Three things, one theme: a test should reach for the platform it is testing, and nothing else.

  **`@stone-js/http-core` is no longer a dependency.** It was a required peer, so every project
  installed an HTTP package to run its tests: a React Native application did, a CLI one did, a worker
  did. `makeIncomingHttpEvent` now lives behind `@stone-js/testing/http` and the peer is optional. The
  main entry imports no platform package at all, verified in the emitted bundle. Measured the other way
  too: a React Native project with no HTTP package installed anywhere boots through `createTestApp` and
  resolves its route.

  **A browser or native application can be tested at all.** Dispatching `makeIncomingEvent()` into one
  failed with `event.fingerprint is not a function`, thrown from the kernel's error handler.
  `makeIncomingBrowserEvent`, behind `@stone-js/testing/browser`, builds the event those applications
  receive, and keeps schemes rather than resolving them away, so a deep link like `myapp://tasks/42`
  reaches in a test the route it reaches on a phone.

  **`blueprint` is now an override.** It was merged before the application's own modules, and
  `@StoneApp` carries the default blueprint, which sets nearly every key: anything passed through the
  option was overwritten, so it could only ever affect keys no application touched. It is merged after
  them now, which is the only ordering a test can use. This is the configuration counterpart of
  `bindings`: one replaces a service, the other replaces a value.

  ```ts
  const app = await createTestApp({ blueprint: { stone: { debug: true } } });
  ```

  **Migration is one import line**, and every starter and lab application in the repository has been
  moved: `makeIncomingHttpEvent` comes from `@stone-js/testing/http`. The two SPA starters moved further
  and now use `makeIncomingBrowserEvent`, because a browser application receives a browser event; the
  SSR and SSG ones keep the HTTP event, because they are genuinely served over HTTP.

## 0.8.13

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

- c971168: docs: the framework's examples stop citing a private package

  The view provider documentation taught its two registration paths with `@noowow/design-system`,
  a package nobody reading the docs can install, listed among MUI and Chakra as though it were one of
  them. It shipped in the published declarations and in TypeDoc. The examples now use MUI's real
  `createTheme` / `ThemeProvider`, which is the archetypal case the mechanism exists for, and which
  a reader can actually run.

  It also fixes the examples: both snippets passed a `theme` that was never defined in them.

  **And the full React starters stop scaffolding someone else's copyright.** Their footers read
  `2025 Stone.js © Noowow Labs` and `Stone.js © 2025 Stone Foundation`, so an application generated
  from a starter shipped a client's or the framework's name in its own footer, with a year that was
  already stale. They now read `© <current year> Your Company · Built with Stone.js`: a placeholder
  that says what to replace.

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

## 0.8.10

### Patch Changes

- b4bcea0: feat(starters): a React Native starter, so the continuum reaches the phone

  `basic-react-native-declarative` is the first official starter that runs a Stone.js domain as a
  **native mobile application**, with React Native and Expo. The domain is the same one any other
  starter ships: `@StoneApp`, `@Routing`, `@Controller`, `@Match('/hello/:name')`. It does not know
  it is running on a phone, which is the whole point.

  It is also the proof that nothing in the framework's core is tied to a browser or a server. The
  starter carries a small local adapter (`adapter/`) that captures navigation intents, normalizes
  them into `IncomingBrowserEvent` and executes the render effect: the exact native counterpart of
  `BrowserAdapter`, with an in-memory event source where the browser has `window`. It is activated
  the canonical way, through `@StoneApp(options, [nativeAdapterBlueprint])`, and it prefigures
  `@stone-js/react-native-adapter`, which will replace it with real deep links (`Linking`) and
  app-state handling on the same skeleton.

  Two platform facts the starter settles, because they are not obvious and they cost a day to
  discover:

  - **Decorators.** `babel-preset-expo` applies `@babel/plugin-proposal-decorators` itself, in legacy
    mode by default, so the 2023-11 semantics must be requested through the preset's own option
    (`['babel-preset-expo', { decorators: { version: '2023-11' } }]`). Adding the plugin separately
    fails the build outright ("Cannot use the decorators and decorators-legacy plugin together"), and
    ordering it by hand against the preset's class-field transforms is exactly what the preset
    already gets right.
  - **Polyfills.** React Native's built-in `URL` is a stub with no usable `pathname` or
    `searchParams`, which the router needs on every event, so `react-native-url-polyfill` is loaded
    before anything from Stone.js; `TextEncoder` is installed only when the engine lacks it.

  The start screen is a live self-check: decorators and `Symbol.metadata`, the URL API, `TextEncoder`,
  the kernel boot and the router dispatch each report green or red on device. The same chain is also
  covered by behavioural tests under Node, booting the real modules through the real adapter, because
  all of it is plain JavaScript.

  What is shared across platforms is stated plainly in the README: domain, routing, services and data
  loading, never the UI components.

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

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- cfb1482: fix(adapters): parse the request body by default

  Every HTTP adapter required adding **its own** `MetaBodyEventMiddleware`, two exports with the same name from two packages, both needed in a multi-platform app. Forget the Lambda one and the app worked locally, then received an empty body in production, with no error anywhere. Parsing the body of a POST is the default expectation, not an option.

  Both HTTP adapters now include it in their default middleware, and the starters drop the line they no longer need (multipart handling stays opt-in through `MetaFilesEventMiddleware`, which has real costs).

  **Safe for apps that already pass it**: the pipeline dedupes pipes by module identity, so a duplicate collapses to one execution rather than reading the request stream twice, which is asserted by a test.

  Also, on Lambda, `hasBody()` needs `content-length` or `transfer-encoding`. API Gateway sends one in practice, but a synthetic event or a hand-rolled invoker may not, and the payload would then vanish without a trace: it is now logged at debug level.

- 0a90944: Every starter tests its application instead of mocking the framework.

  The test each starter shipped began by stubbing out the framework's own decorators "to lighten the
  test environment". It was the first test a new user read, it taught them to mock `@StoneApp`, and it
  could pass while nothing worked. Each starter now boots its real application with `createTestApp()`
  and asks it a real question, through `stone test`.

  One config file, too: `vitest.config.ts` is gone from all thirteen, since the CLI supplies the
  runner's defaults and `stone.config.mjs` is where a project overrides them. The coverage threshold
  those configs carried is gone with them — a scaffolded project failing `npm test` because the user's
  own new code is not fully covered is hostile; the framework holds itself to that gauge, not its users.

  The Node console adapter is removed where it declared nothing: both `basic-react` starters, both
  `full-react` ones and `basic-service-declarative` registered a CLI adapter with no command to expose,
  which put backend code in a frontend project's dependencies for no benefit. The `full-service`
  starters keep it, because they declare real commands. `continuum-showcase` remains the place where one
  domain over several contexts is demonstrated.

  `drizzle-orm` moves to `^0.45.2` in both `full-service` starters, for the identifier-escaping advisory
  (GHSA: quoted identifiers were not escaped before being wrapped, so untrusted input reaching
  `sql.identifier()` or `.as()` could break out of the quotes).

- d47b2ee: Ship the favicon every scaffolded React app was already asking for.

  The generated HTML entry point links `/favicon.svg`, which no starter shipped, so the first thing a
  new user saw was the browser's default globe in the tab, and a 404 in dev, in SSR and in the built
  output. All seven React starters now ship `public/favicon.svg`: the Stone.js mark, with the
  `prefers-color-scheme` rule that keeps it legible on a light or a dark tab strip.

## 0.8.8

## 0.8.7

## 0.8.6

## 0.8.5

### Patch Changes

- 64518fa: Premium, brand-aligned, bug-free starters. React starters greet the user with a polished welcome
  hero (the Portal logo, ember-gradient title, tagline and links) on a theme-aware ground; service
  starters return a branded welcome payload. Also fixes a 500 ContainerError when scaffolding the
  `continuum-showcase` starter (object `@Page` path + a layout missing `<StoneOutlet>`). Every starter
  is verified end to end: build, real SSR render for HTTP apps, and tests.

## 0.8.4

### Patch Changes

- 01db442: Make every starter production-ready. All 13 starters now build (`stone build`), pass real
  behavioral tests (`npm test`), and the React/showcase starters render the real Stone.js logo
  ("Le Portail"). Notable fixes: rebuilt the `continuum-showcase` starter (missing app entry, config
  and asset), fixed `vitest/config` imports in the service starters, added real tests where they were
  missing, and replaced an SSR-unsafe dependency in `full-react-imperative` with an in-app component.

## 0.8.3

All notable changes to the "Stone.js Starters" extension will be documented in this file.

## Unreleased
