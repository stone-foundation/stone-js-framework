# Changelog

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

- cfb1482: fix(adapters): parse the request body by default

  Every HTTP adapter required adding **its own** `MetaBodyEventMiddleware`, two exports with the same name from two packages, both needed in a multi-platform app. Forget the Lambda one and the app worked locally, then received an empty body in production, with no error anywhere. Parsing the body of a POST is the default expectation, not an option.

  Both HTTP adapters now include it in their default middleware, and the starters drop the line they no longer need (multipart handling stays opt-in through `MetaFilesEventMiddleware`, which has real costs).

  **Safe for apps that already pass it**: the pipeline dedupes pipes by module identity, so a duplicate collapses to one execution rather than reading the request stream twice, which is asserted by a test.

  Also, on Lambda, `hasBody()` needs `content-length` or `transfer-encoding`. API Gateway sends one in practice, but a synthetic event or a hand-rolled invoker may not, and the payload would then vanish without a trace: it is now logged at debug level.

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

All notable changes to the "Stone.js AWS Lambda Adapter" extension will be documented in this file.

## Unreleased

## [0.3.0](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/compare/v0.2.0...v0.3.0) (2026-03-18)

### Features

- **http:** support base64 decoding, urlencoded parsing, binary payloads and safe body parsing ([#45](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/issues/45)) ([cc09bf0](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/commit/cc09bf04ebff951411131f481b6c65acd4a9f948))

## [0.2.0](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/compare/v0.1.0...v0.2.0) (2025-06-16)

### Features

- add browser-safe fallback entry with no-op modules for frontend compatibility ([#35](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/issues/35)) ([19e7c12](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/commit/19e7c12c286ca56839ee3c8db6a2bcb02ad29f32))

## 0.1.0 (2025-06-14)

### Features

- implement aws adapters ([8695eb2](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/commit/8695eb2c7960769d56015943ac0839e787f176d2))
- implement error handler and update lifecycle hooks ([b2e29f5](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/commit/b2e29f567ac56717023f9597000ee3f0d0278093))
- major internal restructuring and cleanup ([#33](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/issues/33)) ([3591ac0](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/commit/3591ac066e792bdd85878726d760597834445d68))

## 0.0.2 (2024-12-08)

### Features

- implement aws adapters ([8695eb2](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/commit/8695eb2c7960769d56015943ac0839e787f176d2))
