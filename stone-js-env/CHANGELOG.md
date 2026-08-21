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

- a24b0c3: docs(env): explain the value cache and when to clear it

  A pilot project concluded that no purge function existed and that the cache defeated live configuration. Neither is true: `clearCache()` has always been exported, and `@stone-js/config-source`'s `envSource` reads `process.env` directly, so live reloads are unaffected. What was missing is the _why_: the README documented the function without ever stating that values read through `custom()` are memoized for the process lifetime, so nobody could tell when they needed it.

  A new Caching section states the semantics, shows the test-suite pattern (`clearCache()` after mutating `process.env`), and records that config sources bypass the cache.

## 0.8.8

## 0.8.7

## 0.8.6

## 0.8.5

## 0.8.4

## 0.8.3

## 0.8.2

## 0.8.1

All notable changes to the "Stone.js Env" extension will be documented in this file.

## Unreleased

## [0.1.2](https://github.com/stone-foundation/stone-js-env/compare/v0.1.1...v0.1.2) (2025-07-19)

### Bug Fixes

- enhance the API design of environment variable getter functions by allowing union default values ([#17](https://github.com/stone-foundation/stone-js-env/issues/17)) ([9486199](https://github.com/stone-foundation/stone-js-env/commit/9486199501b0be9c05bb2dec0206a375e897d705))

## [0.1.1](https://github.com/stone-foundation/stone-js-env/compare/v0.1.0...v0.1.1) (2025-06-12)

### Miscellaneous Chores

- migrate to stone-foundation, integrate sonar cloud and add security policy ([#12](https://github.com/stone-foundation/stone-js-env/issues/12)) ([0283565](https://github.com/stone-foundation/stone-js-env/commit/02835657738696736f726954b15653abb91b1109))

## [0.1.0](https://github.com/stone-foundation/stone-js-env/compare/v0.0.22...v0.1.0) (2025-05-17)

### Features

- replace validator by valibot and change the license to MIT ([3dd8789](https://github.com/stone-foundation/stone-js-env/commit/3dd8789a11a1ef26c64d9df7b509fe4a8a8b1e51))

## [0.0.22](https://github.com/stone-foundation/stone-js-env/compare/v0.0.21...v0.0.22) (2024-11-25)

### Miscellaneous Chores

- add custom env error ([acb3220](https://github.com/stone-foundation/stone-js-env/commit/acb3220b793d6c76b61b684191557738fd0bd7ab))

## [0.0.21](https://github.com/stone-foundation/stone-js-env/compare/v0.0.3...v0.0.21) (2024-11-16)

### Miscellaneous Chores

- fix package.json ([b9384c9](https://github.com/stone-foundation/stone-js-env/commit/b9384c9f2eaa1e1c01fd002559fef84ab6a88948))

## [0.0.3](https://github.com/stone-foundation/stone-js-env/compare/v0.0.2...v0.0.3) (2024-11-16)

### Miscellaneous Chores

- add rollup plugin to bundle types ([96dee2f](https://github.com/stone-foundation/stone-js-env/commit/96dee2f278491cb2869d6ae837fc4b816fbc34ce))

## [0.0.2](https://github.com/stone-foundation/stone-js-env/compare/v0.0.1...v0.0.2) (2024-11-12)

### Bug Fixes

- change license to Apache-2.0 ([37a77da](https://github.com/stone-foundation/stone-js-env/commit/37a77dabcf9e60aa15131ddccb5c50fcb98edf38))

## 0.0.1 (2024-11-12)

### Features

- implement Env ([68d3e4a](https://github.com/stone-foundation/stone-js-env/commit/68d3e4ab2ec2831173384d76775c5354ae7a0e70))
