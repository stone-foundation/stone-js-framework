# Change Log

## 0.8.16

## 0.8.15

## 0.8.14

## 0.8.13

## 0.8.12

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

All notable changes to the "Stone.js pipeline" extension will be documented in this file.

## Unreleased

## [0.1.3](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.1.2...v0.1.3) (2025-07-01)

### Bug Fixes

- fix type issues by updating type annotations and refactoring parts of the pipe handling logic ([#25](https://github.com/stone-foundation/stone-js-pipeline/issues/25)) ([97865f6](https://github.com/stone-foundation/stone-js-pipeline/commit/97865f667f34e282f4d3b7ab78156970907a2878))

## [0.1.2](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.1.1...v0.1.2) (2025-07-01)

### Bug Fixes

- Add the 'isAlias' flag to clarify pipe handling by marking alias types explicitly ([#23](https://github.com/stone-foundation/stone-js-pipeline/issues/23)) ([2c0f031](https://github.com/stone-foundation/stone-js-pipeline/commit/2c0f0311fa2ae7b27eb8050c51a19ace8559a4bf))

## [0.1.1](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.1.0...v0.1.1) (2025-06-12)

### Miscellaneous Chores

- migrate to stone-foundation, integrate sonar cloud and add security policy ([#17](https://github.com/stone-foundation/stone-js-pipeline/issues/17)) ([ec2f372](https://github.com/stone-foundation/stone-js-pipeline/commit/ec2f372a1ddb763d00bb1e6fb4ac77f2debf7b19))

## [0.1.0](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.0.46...v0.1.0) (2025-05-11)

### Features

- transform pipe to meta pipe and change the license to MIT ([14ede7d](https://github.com/stone-foundation/stone-js-pipeline/commit/14ede7d9eb488ff17b0c37637fda06e0296e7b4c))

## [0.0.46](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.0.45...v0.0.46) (2024-11-25)

### Miscellaneous Chores

- add custom pipeline error ([f7cff0e](https://github.com/stone-foundation/stone-js-pipeline/commit/f7cff0ea73c3c5bcb048516c676c2bed51eb4e9d))

## [0.0.45](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.0.44...v0.0.45) (2024-11-22)

### Miscellaneous Chores

- allow to return undefined ([5c1b6a7](https://github.com/stone-foundation/stone-js-pipeline/commit/5c1b6a7daaef488c81e5614b0853b63dc2e8a711))

## [0.0.44](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.0.43...v0.0.44) (2024-11-18)

### Features

- replace container by resolver in order to remove the coupling with the container ([a70b996](https://github.com/stone-foundation/stone-js-pipeline/commit/a70b9963317d0ff6de7a5a4f494d580fbcb4138f))

## [0.0.43](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.0.42...v0.0.43) (2024-11-16)

### Bug Fixes

- import real container from service container and refactor executePipe ([ad92185](https://github.com/stone-foundation/stone-js-pipeline/commit/ad92185fdaad6aa31050eec920120bbf8fd1ebfa))

## [0.0.42](https://github.com/stone-foundation/stone-js-pipeline/compare/v0.0.41...v0.0.42) (2024-11-15)

### Miscellaneous Chores

- replace jest by vitest and add rollup plugin to bundle types ([b0a246c](https://github.com/stone-foundation/stone-js-pipeline/commit/b0a246c11bdc5a5381bf0262978ad8f82d19d2b9))

## 0.0.41 (2024-11-11)

### Features

- implement Pipeline ([35622cc](https://github.com/stone-foundation/stone-js-pipeline/commit/35622cc67786f7e55da6b1f6694dfa52441eba4f))
