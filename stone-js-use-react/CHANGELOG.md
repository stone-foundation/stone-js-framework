# Changelog

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
