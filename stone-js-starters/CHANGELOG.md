# Changelog

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
