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

All notable changes to the "Stone.js Config" extension will be documented in this file.

## Unreleased

## [0.1.1](https://github.com/stone-foundation/stone-js-config/compare/v0.1.0...v0.1.1) (2025-06-12)

### Documentation

- fix typo ([#42](https://github.com/stone-foundation/stone-js-config/issues/42)) ([79ef468](https://github.com/stone-foundation/stone-js-config/commit/79ef4684e4e040ae06f519e0c0bfafd0c27c42e0))

## [0.1.0](https://github.com/stone-foundation/stone-js-config/compare/v0.0.35...v0.1.0) (2025-05-13)

### Features

- add setItems and setIf method to config and change the license to MIT ([4919740](https://github.com/stone-foundation/stone-js-config/commit/49197405b50a84a2323adc14016501cd90bfa402))

## [0.0.35](https://github.com/stone-foundation/stone-js-config/compare/v0.0.34...v0.0.35) (2025-01-06)

### Bug Fixes

- fix set method typing ([101ae9d](https://github.com/stone-foundation/stone-js-config/commit/101ae9d1f7f77917a43192098f91926284ad4a61))

## [0.0.34](https://github.com/stone-foundation/stone-js-config/compare/v0.0.33...v0.0.34) (2025-01-04)

### Miscellaneous Chores

- improve Config typings ([305ae64](https://github.com/stone-foundation/stone-js-config/commit/305ae64900ea613c92989a4d2c1c90d8544a4005))

## [0.0.33](https://github.com/stone-foundation/stone-js-config/compare/v0.0.32...v0.0.33) (2024-11-19)

### Miscellaneous Chores

- add dependabot pipeline and badge ([55f617f](https://github.com/stone-foundation/stone-js-config/commit/55f617fec15fbe1dbdd2cff0ce787d8253fd9324))

## [0.0.32](https://github.com/stone-foundation/stone-js-config/compare/v0.0.3...v0.0.32) (2024-11-19)

### Miscellaneous Chores

- change getters and setters API ([71aa8e7](https://github.com/stone-foundation/stone-js-config/commit/71aa8e7df3c3aad305e3c44d63b80a9db38e4e18))

## [0.0.3](https://github.com/stone-foundation/stone-js-config/compare/v0.0.2...v0.0.3) (2024-11-16)

### Miscellaneous Chores

- add rollup plugin to bundle types ([838b1fc](https://github.com/stone-foundation/stone-js-config/commit/838b1fc140872b9303c7766d699c55ec086b416d))

## 0.0.2 (2024-11-12)

### Features

- implement Config ([0549397](https://github.com/stone-foundation/stone-js-config/commit/0549397fcff39e3f657b63aceca5b2a4b34ccd89))
