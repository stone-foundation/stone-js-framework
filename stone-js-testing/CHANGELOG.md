# @stone-js/testing

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/http-core@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/filesystem@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/filesystem@0.8.10
  - @stone-js/http-core@0.8.10

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

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- 2ed390b: `stone test` spawns the runner, and pins the decorator semantics the framework runs on.

  Verified against a real application rather than a mock, which surfaced two defects in the first
  design. Importing Vitest's Node API joined two module graphs: this package is bundled, so a runner it
  does not depend on was bundled with it and broke with `esbuildVersion is not defined` — nothing to do
  with the project's tests, and reported as "Vitest is not installed", which was false. The runner is
  now a child process, resolved from the project: it owns its exit code and its watch loop, and a
  missing binary is diagnosed by looking for it rather than by catching an import.

  The generated config lands in `.stone/vitest.config.mjs`, readable when a run surprises you, and it
  pins TC39 stage-3 decorators for the transform. A project's `tsconfig.json` keeps
  `experimentalDecorators: true`, which is what TypeScript's checker wants and what the build overrides
  with Babel `version: '2023-11'` afterwards. A test runner transpiles instead of building, so without
  this it emitted the legacy form and every decorated class failed to boot. Class fields are pinned to
  the same spec semantics the build uses.

  `@stone-js/testing` also stops crashing when an application produces no response: attaching the body
  readers to a non-object threw inside the harness and buried the real reason.

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

- 2ed390b: A test keeps the application's platform, so every context is testable in memory.

  The harness introduced a `test` platform of its own, and that quietly broke fidelity: adapters
  contribute much of what an application is through **platform-conditional** blueprint middleware
  (`if (blueprint.get('stone.adapter.platform') === NODE_HTTP_PLATFORM) …` sets the HTTP response
  type). Under a platform nobody declared, every one of those conditions was false and the kernel built
  a bare `OutgoingResponse`. A JSON API survived, because passing content through is all it needs; a
  rendered page did not, because the view layer calls `response.isError()`.

  A test is now the same context minus the network: the platform, the response type and the error
  handlers are the application's own, and only the integration is replaced. Adapter middleware is
  dropped, since it exists to normalise a raw platform event and a test supplies a ready
  `IncomingEvent`.

  `createTestApp({ platform })` names the context when an application stacks several — the HTTP context
  of an app that is also a CLI, or the browser context of a pure SPA, where neither adapter claims the
  default and nothing was selected at all. It uses the core's own selection rule rather than a
  mechanism of its own.

  `@stone-js/use-react` renders into a minimal HTML shell when no template is configured, warning once,
  instead of refusing to render. A build always generates one; reaching the fallback means either a test
  (where it is the point) or a build that did not run, and an unstyled page with a warning beats a page
  that cannot render. The shell carries what the renderer splices into, `<title>` included, because a
  page's title is replaced in place rather than inserted.

  Verified through `stone test` on four real applications: a REST API, SSR, SSG and a SPA.

- Updated dependencies [97a6730]
- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/http-core@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/filesystem@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/http-core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/http-core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/http-core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/http-core@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/http-core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/http-core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/http-core@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/http-core@0.8.1
