# Changelog

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10

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

- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/core@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1

All notable changes to the "Stone.js Browser core" extension will be documented in this file.

## Unreleased

## [0.1.1](https://github.com/stone-foundation/stone-js-browser-core/compare/v0.1.0...v0.1.1) (2025-06-12)

### Miscellaneous Chores

- migrate to stone-foundation, integrate sonar cloud and add security policy ([#53](https://github.com/stone-foundation/stone-js-browser-core/issues/53)) ([d969e21](https://github.com/stone-foundation/stone-js-browser-core/commit/d969e213200093ce407bb73c4509a4759b2be345))

## [0.1.0](https://github.com/stone-foundation/stone-js-browser-core/compare/v0.0.3...v0.1.0) (2025-06-05)

### Features

- major internal restructuring and cleanup ([#43](https://github.com/stone-foundation/stone-js-browser-core/issues/43)) ([cb27be0](https://github.com/stone-foundation/stone-js-browser-core/commit/cb27be08d105f8175759c59f313cfe1000c4a6a1))

This release introduces a comprehensive internal refactoring of the `browser-core` module to align with the evolving architecture of Stone.js and ensure smooth runtime continuity between server and browser environments.

#### Changes included:

- Restructured the module around `IncomingBrowserEvent`, `OutgoingBrowserResponse`, and `RedirectBrowserResponse` to better reflect navigation-based runtime behavior
- Refined the `CookieCollection` API for consistent cookie handling across browser and HTTP contexts
- Improved typings for stronger type safety and better developer experience
- Added new runtime features to enhance browser response capabilities
- Fixed minor issues and streamlined internal logic
- Expanded unit test coverage for increased reliability

This cleanup prepares the module for SPA and SSR integration within the Continuum Architecture and brings it in line with the internal standards applied across all Stone.js core packages.

## [0.0.3](https://github.com/stone-foundation/stone-js-browser-core/compare/v0.0.2...v0.0.3) (2025-01-21)

### Features

- add new util methods to event and response ([58b3a03](https://github.com/stone-foundation/stone-js-browser-core/commit/58b3a039142f6865ef6912ef058985d46f08d508))

## 0.0.2 (2025-01-18)

### Features

- implement browser core ([2c2c45d](https://github.com/stone-foundation/stone-js-browser-core/commit/2c2c45da7146109ea5ae39ff81ac0b60630dfeee))
