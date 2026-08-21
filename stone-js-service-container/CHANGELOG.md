# Changelog

## 0.8.11

## 0.8.10

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

## 0.8.8

## 0.8.7

## 0.8.6

## 0.8.5

## 0.8.4

## 0.8.3

## 0.8.2

## 0.8.1

All notable changes to the "Stone.js Service container" extension will be documented in this file.

## Unreleased

## [0.1.3](https://github.com/stone-foundation/stone-js-service-container/compare/v0.1.2...v0.1.3) (2026-06-12)

### Bug Fixes

- replace Object.hasOwn syntax to ensure compatibility with older … ([#34](https://github.com/stone-foundation/stone-js-service-container/issues/34)) ([92b426a](https://github.com/stone-foundation/stone-js-service-container/commit/92b426a33a7eaa5f165d3259f4fe6ce28d239c9b))

## [0.1.2](https://github.com/stone-foundation/stone-js-service-container/compare/v0.1.1...v0.1.2) (2025-07-19)

### Bug Fixes

- extracts interfaces (IContainer, IBinding) to improve code abstraction and reduce circular dependencies ([#21](https://github.com/stone-foundation/stone-js-service-container/issues/21)) ([ab31931](https://github.com/stone-foundation/stone-js-service-container/commit/ab31931e2e54437b6c46e748ce76724552d05a36))

## [0.1.1](https://github.com/stone-foundation/stone-js-service-container/compare/v0.1.0...v0.1.1) (2025-06-12)

### Miscellaneous Chores

- migrate to stone-foundation, integrate sonar cloud and add security policy ([#16](https://github.com/stone-foundation/stone-js-service-container/issues/16)) ([b23c6dc](https://github.com/stone-foundation/stone-js-service-container/commit/b23c6dc962dcf30abb2b575b8424646c99ea2c9d))

## [0.1.0](https://github.com/stone-foundation/stone-js-service-container/compare/v0.0.44...v0.1.0) (2025-05-12)

### Features

- fix proxy issue and change the license to MIT ([0a34b2a](https://github.com/stone-foundation/stone-js-service-container/commit/0a34b2a7bbc717ca808ccc9b15f0b1794b6d1d46))

## [0.0.44](https://github.com/stone-foundation/stone-js-service-container/compare/v0.0.43...v0.0.44) (2025-01-04)

### Miscellaneous Chores

- update container's make method return type ([020e91c](https://github.com/stone-foundation/stone-js-service-container/commit/020e91c7b464b5fa785c869702b6bef84b206d51))

## [0.0.43](https://github.com/stone-foundation/stone-js-service-container/compare/v0.0.42...v0.0.43) (2024-11-19)

### Miscellaneous Chores

- remove register, asAlias API, add create factory method and make constructor private ([1cb7f6d](https://github.com/stone-foundation/stone-js-service-container/commit/1cb7f6dac6e15193d4bf42125eca5f5db5f771b5))

## [0.0.42](https://github.com/stone-foundation/stone-js-service-container/compare/v0.0.4...v0.0.42) (2024-11-16)

### Miscellaneous Chores

- add rollup plugin to bundle types ([0ff9b91](https://github.com/stone-foundation/stone-js-service-container/commit/0ff9b9142bca163f80869df46a66780942ea289c))

## [0.0.4](https://github.com/stone-foundation/stone-js-service-container/compare/v0.0.2...v0.0.4) (2024-11-14)

### Documentation

- improve documentation ([d107e53](https://github.com/stone-foundation/stone-js-service-container/commit/d107e53cee1123db0ac4e6e4969717095de089cd))

## 0.0.2 (2024-11-13)

### Features

- implement service container ([9c0969a](https://github.com/stone-foundation/stone-js-service-container/commit/9c0969a4246c13739f0f1d6c59c60d8e05f0518f))
