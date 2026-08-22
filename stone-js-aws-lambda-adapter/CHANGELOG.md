# Changelog

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/env@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14
  - @stone-js/config@0.8.14
  - @stone-js/env@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/config@0.8.13
- @stone-js/env@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/config@0.8.12
  - @stone-js/env@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/config@0.8.11
  - @stone-js/env@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/config@0.8.10
  - @stone-js/env@0.8.10

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
- Updated dependencies [a24b0c3]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/env@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8
- @stone-js/env@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7
- @stone-js/env@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6
- @stone-js/env@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5
- @stone-js/env@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/env@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/env@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/config@0.8.2
  - @stone-js/env@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/config@0.8.1
  - @stone-js/env@0.8.1

All notable changes to the "Stone.js AWS Lambda Adapter" extension will be documented in this file.

## Unreleased

## [0.1.1](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/compare/v0.1.0...v0.1.1) (2026-06-15)

### Miscellaneous Chores

- update Stone.js core deps ([#50](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/issues/50)) ([94c50d8](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/commit/94c50d836ad9f679aea270aed9ff76834c891b05))

## [0.1.0](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/compare/v0.0.22...v0.1.0) (2025-06-14)

### Features

- major internal restructuring and cleanup ([#40](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/issues/40)) ([d4d4c63](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/commit/d4d4c63dc28cce33136ceaeb9c16d23edbfab443))

## [0.0.22](https://github.com/stonemjs/aws-lambda-adapter/compare/v0.0.2...v0.0.22) (2025-01-06)

### Features

- implement error handler and update lifecycle hooks ([b2e29f5](https://github.com/stonemjs/aws-lambda-adapter/commit/b2e29f567ac56717023f9597000ee3f0d0278093))

## 0.0.2 (2024-12-08)

### Features

- implement aws adapters ([8695eb2](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/commit/8695eb2c7960769d56015943ac0839e787f176d2))
