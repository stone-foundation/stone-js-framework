# Changelog

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
- Updated dependencies [13915d4]
- Updated dependencies [311d395]
  - @stone-js/router@0.8.14
  - @stone-js/node-cli-adapter@0.8.14
  - @stone-js/core@0.8.14
  - @stone-js/http-core@0.8.14
  - @stone-js/browser-core@0.8.14
  - @stone-js/use-react-core@0.8.14
  - @stone-js/cli@0.8.14
  - @stone-js/use-view@0.8.14
  - @stone-js/browser-adapter@0.8.14
  - @stone-js/filesystem@0.8.14
  - @stone-js/pipeline@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- Updated dependencies [8c2b600]
  - @stone-js/http-core@0.8.13
  - @stone-js/use-react-core@0.8.13
  - @stone-js/core@0.8.13
  - @stone-js/pipeline@0.8.13
  - @stone-js/config@0.8.13
  - @stone-js/filesystem@0.8.13
  - @stone-js/router@0.8.13
  - @stone-js/browser-core@0.8.13
  - @stone-js/browser-adapter@0.8.13
  - @stone-js/node-cli-adapter@0.8.13
  - @stone-js/use-view@0.8.13
  - @stone-js/cli@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [03bf130]
- Updated dependencies [047d9b0]
- Updated dependencies [c971168]
- Updated dependencies [c971168]
- Updated dependencies [4c50bc6]
  - @stone-js/cli@0.8.12
  - @stone-js/http-core@0.8.12
  - @stone-js/use-react-core@0.8.12
  - @stone-js/use-view@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/browser-adapter@0.8.12
  - @stone-js/browser-core@0.8.12
  - @stone-js/filesystem@0.8.12
  - @stone-js/node-cli-adapter@0.8.12
  - @stone-js/router@0.8.12
  - @stone-js/pipeline@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- b568e53: refactor(use-react): the React renderer now carries its own build

  The CLI knew how to build a React application. It shipped Vite, `@vitejs/plugin-react`,
  `vite-plugin-babel` and `browserslist` to prove it, and a project that renders nothing on a screen
  installed all four. That was backwards: the tool that runs commands does not get to know what a
  view is, and the one qualified to answer how React views become an application is the React
  renderer.

  So the answer moved to where it belongs. `@stone-js/use-react` now owns the React build end to end
  (CSR, SSR, SSG, the dev server, the preview server, the console build and the SSG prerender) and
  declares it as a CLI plugin, auto-discovered from `stone.cliPlugin`. Installing the renderer is
  still all a React project does; the CLI simply no longer pretends to know why.

  **The CLI keeps one target, `server`, and its dependency on the renderer is gone.** It was a real
  dependency, in a package a backend-only project installs, and removing it also removed the last
  cycle in the workspace: `@stone-js/cli` and `@stone-js/use-react` used to depend on each other, so
  the order they built in was whatever pnpm decided that day. The renderer builds after the CLI now,
  which is the only order that ever made sense.

  **Nothing changes for an application.** `stone dev`, `stone build`, `stone preview`, `stone serve`
  and `stone build react` behave as before, because the target is registered the same way the native
  one is: a config-phase middleware, additive, so a project that declared its own targets keeps them.
  This was verified rather than assumed. The three rendering modes were built from the same sources
  before and after the move, in both the declarative and the imperative style, and produced the same
  set of output files, with the SSG prerender still carrying its rendered markup. The one difference
  in the bundles is that a blueprint an application does not reach is now tree-shaken out of it.

  **Only a project importing the CLI's React internals has anything to do**, and only if it reached
  past the public commands: `ReactBuilder`, the build middleware, `viteConfig`, the entry-point
  templates and the SSG helpers are now imported from `@stone-js/use-react/cli` instead of
  `@stone-js/cli`. The CLI's own helpers they build on (`isCSR`, `isSSR`, `isSSG`, `isTypescriptApp`,
  `generatePublicEnvironmentsFile`, `getStoneBuilderConfig` and the rest) stay where they are.

  **One behaviour did change, and for the better: the SSG prerender now runs its SSR server on the
  Node that is building.** It spawned `node`, a bare command name resolved through `PATH`, which
  decides neither that the interpreter is the one that just produced the bundle nor that the directory
  it came from is trustworthy. `process.execPath` answers both. The two SSG lab applications still
  pre-render their routes with their markup intact, which is how a wrong interpreter would have shown
  itself.

  This is the same move the native target already made, applied to the platform that came first. A
  module owns its build, the CLI owns none of them, and adding a renderer to the ecosystem no longer
  means editing the CLI.

- Updated dependencies [b2ff332]
- Updated dependencies [13cebd1]
- Updated dependencies [b568e53]
  - @stone-js/cli@0.8.11
  - @stone-js/http-core@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/use-react-core@0.8.11
  - @stone-js/browser-adapter@0.8.11
  - @stone-js/browser-core@0.8.11
  - @stone-js/filesystem@0.8.11
  - @stone-js/node-cli-adapter@0.8.11
  - @stone-js/router@0.8.11
  - @stone-js/use-view@0.8.11
  - @stone-js/pipeline@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- 18644c8: feat(router): navigation becomes an effect the platform provides, not an assumption

  `Router.navigate()` was the one place the universal router stopped being universal: it reached
  straight for `window.history` and `window.dispatchEvent`, and threw outside a browser. Everything
  around it, matching and generating a path from a route name, is platform-independent already.

  Only that last step is now delegated, to a `RouterNavigator` under `stone.router.navigator`:

  ```ts
  export type RouterNavigator = (context: NavigationContext) => void;
  // NavigationContext: { path, replace, options }
  ```

  The router still does the platform-independent work before calling it, so a navigator receives a
  resolved path and performs one effect. `browserNavigator` is the fallback when none is configured,
  and it is the exact behaviour that was inlined before (push or replace a History entry, then
  announce it so the adapter re-enters the kernel), which means **nothing changes for a web
  application**: a `navigate()` outside a browser still throws the same `RouterError`.

  The fallback lives in `Router.navigate()` and deliberately **not** in the router's blueprint. Pinning
  it there would make "not configured" indistinguishable from "configured to be the browser", and an
  adapter for another platform could never tell whether it was free to install its own: it could not,
  and `navigate()` on a phone threw "browser environment" instead of navigating.

  One ordering nuance for the curious: with a route name and no browser, the missing-route error now
  surfaces before the missing-browser one, because resolving the path no longer waits behind a
  platform check.

  **`ViewEngine` no longer requires a DOM element to mount into.** `mount` and `hydrate` were typed
  `(node, container: Element)`, a DOM type in the middle of the engine-agnostic contract. The host is
  now a third type parameter defaulting to `Element`, so every existing engine and call site is
  unchanged, and an engine on a platform with no element tree (React Native registers a root
  component) can name its own host.

  **`ReactViewEngine` no longer instantiates a `TextEncoder` at import time.** It moved inside the
  streaming helper that uses it. Importing a module should not require a global that only server
  streaming needs, and some client engines do not have it.

  Together these are what a platform outside the browser needs from the shared layers, and they are
  the reason the React Native work needs no fork of the router or of the view contract.

- 318cbf5: refactor(use-react): the platform-independent half becomes `@stone-js/use-react-core`

  Both React renderers, the web one and the native one, do the same work before they differ.
  Resolving which component answers a route, loading a lazy page, running its loader, wrapping
  it in its layout, merging the head, running the view hooks: none of that is web or native.
  It now lives in `@stone-js/use-react-core`, and `@stone-js/use-react` depends on it and
  re-exports it.

  **Nothing changes for you.** Every symbol you imported from `@stone-js/use-react` still
  comes from `@stone-js/use-react`: its public surface was measured before and after the split
  and is identical, 176 exports either way. No import in an application, a starter or the CLI
  moves.

  **Why a package and not a folder.** A React Native bundler resolves every import it sees,
  including dynamic ones, so a module that reaches for `react-dom` cannot be loaded on a phone
  at all, whatever its code paths do at runtime. `@stone-js/use-react`'s published entry also
  pulls the SSR bundle, and with it `node:http`. The split is what makes one domain reachable
  from both platforms; the emitted `dist/index.js` of the new package is checked to import
  nothing but `@stone-js/core`, `@stone-js/router`, `@stone-js/use-view` and `react`.

  What stayed in `@stone-js/use-react`: mounting a root and hydrating server markup, the HTML
  shell, the snapshot script tag, the `ReactViewEngine`, `StoneLink`, `StoneOutlet`,
  `StoneError`, the DOM helpers, the server and browser sub-trees, and the two hooks that need
  the web runtime (`useRuntime`, `useHead`). What moved: the page, layout and error-page
  contracts and their decorators, the React context, the eleven platform-independent hooks,
  view providers, the blueprint middleware that reads decorator metadata, and the render
  orchestration.

  One behaviour change, and it is the seam that made the split possible:
  `buildAdapterErrorComponent` no longer imports the `StoneError` component. It takes an
  optional `fallback` component instead, and `@stone-js/use-react` passes `StoneError` as it
  always did. Called without a fallback it now returns `undefined` rather than rendering an
  `<h1>`, because a package that may be rendering native views cannot reach for HTML.

  `ReactViewEngine` gained the tests it was missing (mount update, hydration, stream
  cancellation, a failing shell), which took `@stone-js/use-react` from 96.55% to 100% function
  coverage on the way through.

- Updated dependencies [18644c8]
- Updated dependencies [9f074f8]
- Updated dependencies [318cbf5]
  - @stone-js/router@0.8.10
  - @stone-js/use-view@0.8.10
  - @stone-js/core@0.8.10
  - @stone-js/use-react-core@0.8.10
  - @stone-js/browser-adapter@0.8.10
  - @stone-js/browser-core@0.8.10
  - @stone-js/http-core@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

- 0629318: Point every README link at somewhere that exists.

  The per-module repositories were retired when the framework moved to a single one, so 36 links
  across 18 READMEs answered with a 404: the exact links a newcomer clicks first, "Contributing"
  and "API". The contributing guide now points at the monorepo, and the API reference at the
  published one.

  `docs/` was never a durable target either, retired repository or not: it is TypeDoc output, and
  every build begins by deleting it.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

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
- Updated dependencies [5e01789]
- Updated dependencies [be13033]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [b3efe5f]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/http-core@0.8.9
  - @stone-js/browser-adapter@0.8.9
  - @stone-js/browser-core@0.8.9
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/router@0.8.9
  - @stone-js/use-view@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8
- @stone-js/http-core@0.8.8
- @stone-js/router@0.8.8
- @stone-js/browser-core@0.8.8
- @stone-js/browser-adapter@0.8.8
- @stone-js/use-view@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7
- @stone-js/http-core@0.8.7
- @stone-js/router@0.8.7
- @stone-js/browser-core@0.8.7
- @stone-js/browser-adapter@0.8.7
- @stone-js/use-view@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6
- @stone-js/http-core@0.8.6
- @stone-js/router@0.8.6
- @stone-js/browser-core@0.8.6
- @stone-js/browser-adapter@0.8.6
- @stone-js/use-view@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5
- @stone-js/http-core@0.8.5
- @stone-js/router@0.8.5
- @stone-js/browser-core@0.8.5
- @stone-js/browser-adapter@0.8.5
- @stone-js/use-view@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/http-core@0.8.4
- @stone-js/router@0.8.4
- @stone-js/browser-core@0.8.4
- @stone-js/browser-adapter@0.8.4
- @stone-js/use-view@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/http-core@0.8.3
- @stone-js/router@0.8.3
- @stone-js/browser-core@0.8.3
- @stone-js/browser-adapter@0.8.3
- @stone-js/use-view@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/browser-adapter@0.8.2
  - @stone-js/browser-core@0.8.2
  - @stone-js/http-core@0.8.2
  - @stone-js/router@0.8.2
  - @stone-js/use-view@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/browser-adapter@0.8.1
  - @stone-js/browser-core@0.8.1
  - @stone-js/http-core@0.8.1
  - @stone-js/router@0.8.1
  - @stone-js/use-view@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Use React" extension will be documented in this file.

## Unreleased

## [0.3.1](https://github.com/stone-foundation/stone-js-use-react/compare/v0.3.0...v0.3.1) (2026-06-13)

### Miscellaneous Chores

- update Stone core dep ([#20](https://github.com/stone-foundation/stone-js-use-react/issues/20)) ([3191345](https://github.com/stone-foundation/stone-js-use-react/commit/319134518a471690f95933069a79f8952618b6e3))

## [0.3.0](https://github.com/stone-foundation/stone-js-use-react/compare/v0.2.0...v0.3.0) (2026-03-29)

### Features

- improve StoneLink, StoneOutlet and Page ([#17](https://github.com/stone-foundation/stone-js-use-react/issues/17)) ([738ee77](https://github.com/stone-foundation/stone-js-use-react/commit/738ee7736347a79ab88cc9161d7660849d659203))

## [0.2.0](https://github.com/stone-foundation/stone-js-use-react/compare/v0.1.0...v0.2.0) (2025-06-16)

### Features

- split backend and frontend modules for frontend compatibility ([#6](https://github.com/stone-foundation/stone-js-use-react/issues/6)) ([cea717d](https://github.com/stone-foundation/stone-js-use-react/commit/cea717df59d931171c9b983d21c54ed07570bf46))

## 0.1.0 (2025-06-13)

### Features

- initial release with full SSR/SPA React integration ([#1](https://github.com/stone-foundation/stone-js-use-react/issues/1)) ([24ac478](https://github.com/stone-foundation/stone-js-use-react/commit/24ac47827834abe5b56b9c1fd2db34239644d86b))
