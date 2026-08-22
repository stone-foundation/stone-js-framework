# Changelog

## 0.8.16

### Patch Changes

- Updated dependencies [2c11b54]
  - @stone-js/http-core@0.8.16
  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16
  - @stone-js/env@0.8.16
  - @stone-js/filesystem@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/env@0.8.15
- @stone-js/filesystem@0.8.15
- @stone-js/http-core@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14
  - @stone-js/http-core@0.8.14
  - @stone-js/filesystem@0.8.14
  - @stone-js/config@0.8.14
  - @stone-js/env@0.8.14

## 0.8.13

### Patch Changes

- Updated dependencies [8c2b600]
  - @stone-js/http-core@0.8.13
  - @stone-js/core@0.8.13
  - @stone-js/config@0.8.13
  - @stone-js/env@0.8.13
  - @stone-js/filesystem@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [047d9b0]
- Updated dependencies [c971168]
  - @stone-js/http-core@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/filesystem@0.8.12
  - @stone-js/config@0.8.12
  - @stone-js/env@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/http-core@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/filesystem@0.8.11
  - @stone-js/config@0.8.11
  - @stone-js/env@0.8.11

## 0.8.10

### Patch Changes

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/filesystem@0.8.10
  - @stone-js/http-core@0.8.10
  - @stone-js/config@0.8.10
  - @stone-js/env@0.8.10

## 0.8.9

### Patch Changes

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [97a6730]
- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [a24b0c3]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/http-core@0.8.9
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/env@0.8.9
  - @stone-js/filesystem@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8
- @stone-js/env@0.8.8
- @stone-js/filesystem@0.8.8
- @stone-js/http-core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7
- @stone-js/env@0.8.7
- @stone-js/filesystem@0.8.7
- @stone-js/http-core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6
- @stone-js/env@0.8.6
- @stone-js/filesystem@0.8.6
- @stone-js/http-core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5
- @stone-js/env@0.8.5
- @stone-js/filesystem@0.8.5
- @stone-js/http-core@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/env@0.8.4
- @stone-js/filesystem@0.8.4
- @stone-js/http-core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/env@0.8.3
- @stone-js/filesystem@0.8.3
- @stone-js/http-core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/filesystem@0.8.2
  - @stone-js/http-core@0.8.2
  - @stone-js/config@0.8.2
  - @stone-js/env@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/filesystem@0.8.1
  - @stone-js/http-core@0.8.1
  - @stone-js/config@0.8.1
  - @stone-js/env@0.8.1

All notable changes to the "Stone.js Tencent SCF HTTP Adapter" will be documented in this file.

## Unreleased
