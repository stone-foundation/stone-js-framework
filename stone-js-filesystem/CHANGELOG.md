# Changelog

## 0.8.18

### Patch Changes

- @stone-js/core@0.8.18

## 0.8.17

### Patch Changes

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17

## 0.8.16

### Patch Changes

- @stone-js/core@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14

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

All notable changes to the "Stone.js Filesystem" extension will be documented in this file.

## Unreleased

## [0.1.1](https://github.com/stone-foundation/stone-js-filesystem/compare/v0.1.0...v0.1.1) (2025-06-12)

### Miscellaneous Chores

- migrate to stone-foundation, integrate sonar cloud and add security policy ([#11](https://github.com/stone-foundation/stone-js-filesystem/issues/11)) ([d9fba47](https://github.com/stone-foundation/stone-js-filesystem/commit/d9fba47afc23924107bee18cba844d18dcf77a0e))

## 0.1.0 (2025-06-04)

### Features

- initial implementation of filesystem module ([#1](https://github.com/stone-foundation/stone-js-filesystem/issues/1)) ([2597a7c](https://github.com/stone-foundation/stone-js-filesystem/commit/2597a7c743f8663979108758523e59426774e034))

Introduces the @stone-js/filesystem package with the following core features:

- File and UploadedFile classes for safe, contextual file operations
- Utilities for resolving project paths (basePath, tmpPath, appPath, etc.)
- Helpers for MIME detection, file hashing, and dynamic import
- Full ESM support with type safety
- Integrated with Stone.js error system via FilesystemError

This module is designed to abstract common filesystem logic across CLI tools, runtimes, and adapters in Stone.js applications.

### Documentation

- fix typo in package.json ([#3](https://github.com/stone-foundation/stone-js-filesystem/issues/3)) ([76ccb55](https://github.com/stone-foundation/stone-js-filesystem/commit/76ccb555f2a899950af2c8199f807b65b22613fc))
