# Changelog

## 0.8.17

### Patch Changes

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17
  - @stone-js/filesystem@0.8.17
  - @stone-js/config@0.8.17

## 0.8.16

### Patch Changes

- 2c11b54: fix: an agnostic error carrying a status is answered with it, not 500

  The HTTP error handler mapped errors by name with a 500 fallback, so any error from an agnostic module answered `500` however clearly it had declared otherwise. Authorization's `403` was already reaching callers as `500`; a rate limit's `429` would have followed.

  An error that declares a `statusCode` in the 4xx/5xx range is now answered with it, together with its `statusMessage` and its headers, which is how a `Retry-After` travels out of a module that knows nothing about HTTP. Anything outside that range, or no declared status at all, still answers `500`: a module cannot talk the platform into an invalid response by mistake.

  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16
  - @stone-js/filesystem@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/filesystem@0.8.15

## 0.8.14

### Patch Changes

- a67a77b: fix: an event's identity is one notion, computed one way

  `fingerprint()` is how anything that has to survive one event being handled twice finds its way back:
  a renderer stores its loader results under that key on the server and reads them under the same key
  in the browser. It was implemented twice, in two packages, and the two drifted.

  **A server-rendered page with a query string never found its own data.** An HTTP event keyed on the
  pathname alone, a browser event on the pathname _and_ the query, so a render of `/tasks?page=2` stored
  its data under `GET|/tasks` while the hydrating browser looked for `GET|/tasks?page=2`. Nothing
  failed and nothing was logged: the page simply refetched on every URL that carried a query. Measured
  on the SSR lab application, which wrote `GET|/` for `/?name=Ada`, and now writes `GET|/?name=Ada`.

  **And a non-latin URL threw.** The HTTP event used bare `btoa`, which only accepts latin1, so
  `/東京` failed with `InvalidCharacterError` from inside a render. The two implementations also
  disagreed on latin1 accents, `btoa` encoding `é` as one byte and the browser's UTF-8 path as two, so
  `/café` produced two different keys for the same page.

  `urlFingerprint` now lives in `@stone-js/core` and both events use it. The query is part of the
  identity, because `/tasks?page=2` and `/tasks?page=3` are two pages with two sets of data; the origin
  is not, because the same route served from two hosts is the same route. `IncomingHttpEvent`'s `full`
  form still narrows further with the user agent and the IP.

  **`IncomingEvent` gains a `fingerprint()` of its own**, so an event that carries a payload rather than
  a URL has an identity too: its type and a stable serialization of its metadata, with keys sorted at
  every depth and the timestamp excluded, because a server render and a browser render of the same
  event happen at different moments and must agree. Before this, dispatching such an event into a
  renderer failed with `event.fingerprint is not a function`, thrown from the kernel's error handler,
  which named nothing a reader could act on.

  The tests for both events were restating their implementation with `btoa`, which is why the drift
  survived: each one proved that the formula equalled itself. They now assert the properties that
  matter, and are pinned to the shared formula, so the two cannot disagree again without a failure.

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14
  - @stone-js/filesystem@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- 8c2b600: fix(http-core): compression no longer breaks a page bigger than 1 kB

  A React page whose rendered HTML passed 1 kB came back as an error page: empty `<title>`, no markup,
  and a snapshot carrying nothing but `{"error":{"name":"TypeError"}}`. The error, once it could be
  read, was `response.removeHeader is not a function`.

  `CompressionMiddleware` is global, and it is written for an HTTP response. In an application that
  renders rather than serves, what comes back is a browser or a native response: it extends the core
  `OutgoingResponse` and has no `setHeader`, no `removeHeader`, no `addVary`, because nothing is going
  over a wire. The middleware reached for all three.

  **The 1 kB threshold is what made it hide for so long.** Compression only engages above it, so a
  welcome screen worked, every starter's test passed, and the failure waited for a page with real
  content on it. It then presented as a `TypeError` with no message, on a rendering path that never
  mentions compression.

  The middleware now returns a response it cannot compress untouched. Compression is a transport
  concern, and a response that is not going over a transport has nothing to negotiate.

  **The suite for it was rewritten rather than adjusted.** It asserted that `setHeader` had been called
  on an object literal, which can pass while nothing is compressed and while the response is the wrong
  type entirely — it did pass, throughout. It now uses real responses and real zlib, and asserts that
  the bytes coming out decompress back to the bytes going in, that `Vary` names `Accept-Encoding`, and
  that `Content-Length` is gone. The regression has its own case: a rendered response above the
  threshold comes back untouched instead of throwing.

  - @stone-js/core@0.8.13
  - @stone-js/config@0.8.13
  - @stone-js/filesystem@0.8.13

## 0.8.12

### Patch Changes

- 047d9b0: feat: a route declares what it answers with, and an application names its own envelope

  Two declarations that remove two kinds of boilerplate.

  **`response` on a route.** A route already says what it is: its path, its verb, what it accepts, whether it is protected. Now it can say what it answers with, so the handler stays about the domain:

  ```ts
  @Post('/tasks', { response: { type: 'json', status: 201 } })
  create (event: IncomingHttpEvent): Task { return this.tasks.add(event.get('body')) }

  @Delete('/tasks/:id', { response: { type: 'no-content' } })
  remove (event: IncomingHttpEvent): void { this.tasks.remove(event.get('id')) }
  ```

  `json`, `jsonp`, `html`, `text`, `file`, `redirect` and `no-content`, with a status and headers, all optional and defaulting to JSON with `200`. A method decorator still wins: `@JsonHttpResponse(201)` produces the response itself, and when a handler has already answered, the route option steps aside. The published contract reads the same declaration, so a route answering `201` is documented as answering `201` without saying it twice.

  **`stone.resources.envelope`.** An endpoint answering a page returns something like `{ items, meta }`, and `items` and `meta` are not fields of a model: shaping that object published the wrapper as if it were the thing, which applications worked around with a middleware of their own. Naming the word once is enough, and everything around the payload is left as it was:

  ```ts
  blueprint.set("stone.resources.envelope", { payload: "items" });
  ```

  Undeclared by default, deliberately: guessing which key holds the payload would quietly mangle a model that happens to have a field by that name.

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

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/filesystem@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

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

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/filesystem@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/filesystem@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

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

- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/filesystem@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8
- @stone-js/filesystem@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7
- @stone-js/filesystem@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6
- @stone-js/filesystem@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5
- @stone-js/filesystem@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/filesystem@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/filesystem@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/filesystem@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/filesystem@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Http core" extension will be documented in this file.

## Unreleased

## [0.1.3](https://github.com/stone-foundation/stone-js-http-core/compare/v0.1.2...v0.1.3) (2025-06-12)

### Miscellaneous Chores

- fix dependabot and sonarcloud issues ([#69](https://github.com/stone-foundation/stone-js-http-core/issues/69)) ([966e820](https://github.com/stone-foundation/stone-js-http-core/commit/966e82062ff7370a270a27b427e788d72562fafb))

## [0.1.2](https://github.com/stone-foundation/stone-js-http-core/compare/v0.1.1...v0.1.2) (2025-06-11)

### Miscellaneous Chores

- set right value in sonar config ([#67](https://github.com/stone-foundation/stone-js-http-core/issues/67)) ([507fb10](https://github.com/stone-foundation/stone-js-http-core/commit/507fb10c180f8a76e1a93fdf0749d066083f525d))

## [0.1.1](https://github.com/stone-foundation/stone-js-http-core/compare/v0.1.0...v0.1.1) (2025-06-05)

### Bug Fixes

- fix Inefficient regular expression, add security file and configure sonar cloud ([#55](https://github.com/stone-foundation/stone-js-http-core/issues/55)) ([0d36986](https://github.com/stone-foundation/stone-js-http-core/commit/0d369869add0f1630e9b5b2cd1421e57ee8d3865))
- fix sonar issues ([#56](https://github.com/stone-foundation/stone-js-http-core/issues/56)) ([b831895](https://github.com/stone-foundation/stone-js-http-core/commit/b831895497ad78853c6297d03ab0449b614ea055))

## [0.1.0](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.4...v0.1.0) (2025-06-04)

### Features

- major internal restructuring and cleanup ([#52](https://github.com/stone-foundation/stone-js-http-core/issues/52)) ([5dc19e8](https://github.com/stone-foundation/stone-js-http-core/commit/5dc19e88b97a10a08254fe79d8071a9023d59ff6))

This update delivers a comprehensive internal refactoring of the `http-core` module to align with the latest Stone.js standards and improve consistency across the ecosystem.

#### Changes included:

- Refactored core logic for `IncomingHttpEvent` and `OutgoingHttpResponse` to improve maintainability and clarity
- Enhanced typings across all exported utilities for stronger TypeScript support
- Introduced new HTTP features and options for response control and cookie handling
- Improved test coverage with additional cases for edge scenarios
- Fixed various internal inconsistencies and cleaned up outdated code
- Minor typo fixes in documentation

This refactoring ensures a more stable, extensible foundation for HTTP event processing in all Stone.js runtime adapters.

## [0.0.4](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.34...v0.0.4) (2025-01-21)

### Features

- add response util methods and response decorator ([1848d2c](https://github.com/stone-foundation/stone-js-http-core/commit/1848d2cc8e9419d9e370ae707c528a45d3c2ac5a))

## [0.0.34](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.33...v0.0.34) (2025-01-06)

### Features

- add new error classes and implement default error handler ([01ff480](https://github.com/stone-foundation/stone-js-http-core/commit/01ff4806cd9165b6846329e5f909f61f5c067d6a))

## [0.0.33](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.32...v0.0.33) (2024-12-08)

### Build System

- update @stone-js/core dependency ([34374e6](https://github.com/stone-foundation/stone-js-http-core/commit/34374e6c4f2f644afedac48ffd94e75996e1eca3))

## [0.0.32](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.3...v0.0.32) (2024-12-01)

### Miscellaneous Chores

- update Stone core dependency ([33a82b7](https://github.com/stone-foundation/stone-js-http-core/commit/33a82b77e98ade423889148c13f25ccd40b75c8a))

## [0.0.3](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.2...v0.0.3) (2024-12-01)

### Miscellaneous Chores

- upgrade mime version ([ed7c218](https://github.com/stone-foundation/stone-js-http-core/commit/ed7c2187bd85b6877da7cd9f8c94448716446e07))

## 0.0.2 (2024-11-30)

### Features

- implement http-core ([24dd4b3](https://github.com/stone-foundation/stone-js-http-core/commit/24dd4b3f1e59fc19fb65fa5316121fe4b68e4f41))
