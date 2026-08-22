# Changelog

## 0.8.16

### Patch Changes

- Updated dependencies [2c11b54]
  - @stone-js/http-core@0.8.16
  - @stone-js/core@0.8.16
  - @stone-js/config@0.8.16
  - @stone-js/filesystem@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
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

## 0.8.13

### Patch Changes

- Updated dependencies [8c2b600]
  - @stone-js/http-core@0.8.13
  - @stone-js/core@0.8.13
  - @stone-js/config@0.8.13
  - @stone-js/filesystem@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [047d9b0]
- Updated dependencies [c971168]
  - @stone-js/http-core@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/filesystem@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/http-core@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/filesystem@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- 8760d1c: fix: a build that fails says so, and a shutdown that starts finishes

  Four silent failures, all of the same shape: something reported success, or reported nothing, while the process was in a state nobody asked for.

  - `stone build --ssg` wrote whatever a page answered, including an error body, and exited `0`. A pre-render is an HTTP request, so a page that throws answers 500, and that HTML was published as the page. The build now stops, names every page it could not render and what it answered, and writes nothing at all.
  - A failed CLI command resolved exit `1` and then hung forever: build tooling leaves handles behind, which is why a successful build already exits deliberately. The failing path now does the same, so CI sees the failure instead of a timeout.
  - SSG left its pre-render server behind when the app shut down gracefully, and the open pipes kept the CLI alive. It now waits for the child to go, and forces it when it does not.
  - `@stone-js/node-http-adapter` closed the server on `SIGINT`/`SIGTERM` and waited for every socket, so an idle keep-alive connection held the process open forever and an orchestrator had to hard-kill a container that promised to leave. Idle connections are closed at once, requests in flight get `shutdownGracePeriod` (10s by default), and the process exits either way.
  - `@stone-js/node-ws-adapter` could not stop while anyone was connected, which is a realtime server's normal state. Clients are now asked to leave with `1001 Going away` and dropped after the grace period.

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/filesystem@0.8.10
  - @stone-js/http-core@0.8.10
  - @stone-js/config@0.8.10

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
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/http-core@0.8.9
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/filesystem@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8
- @stone-js/filesystem@0.8.8
- @stone-js/http-core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7
- @stone-js/filesystem@0.8.7
- @stone-js/http-core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6
- @stone-js/filesystem@0.8.6
- @stone-js/http-core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5
- @stone-js/filesystem@0.8.5
- @stone-js/http-core@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/filesystem@0.8.4
- @stone-js/http-core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/filesystem@0.8.3
- @stone-js/http-core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/filesystem@0.8.2
  - @stone-js/http-core@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/filesystem@0.8.1
  - @stone-js/http-core@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Node HTTP Adapter" extension will be documented in this file.

## Unreleased

## [0.2.1](https://github.com/stone-foundation/stone-js-node-http-adapter/compare/v0.2.0...v0.2.1) (2026-06-15)

### Miscellaneous Chores

- update Stone.js core deps ([#41](https://github.com/stone-foundation/stone-js-node-http-adapter/issues/41)) ([b5d98af](https://github.com/stone-foundation/stone-js-node-http-adapter/commit/b5d98af18faf9d31192c4f4d5ed39006a9576fea))

## [0.2.0](https://github.com/stone-foundation/stone-js-node-http-adapter/compare/v0.1.0...v0.2.0) (2025-06-16)

### Features

- add browser-safe fallback entry with no-op modules for frontend compatibility ([#28](https://github.com/stone-foundation/stone-js-node-http-adapter/issues/28)) ([283561f](https://github.com/stone-foundation/stone-js-node-http-adapter/commit/283561f29362028730f78fd875a92d4ecb3bf885))

## [0.1.0](https://github.com/stone-foundation/stone-js-node-http-adapter/compare/v0.0.22...v0.1.0) (2025-06-14)

### Features

- major internal restructuring and cleanup ([#26](https://github.com/stone-foundation/stone-js-node-http-adapter/issues/26)) ([212d5cf](https://github.com/stone-foundation/stone-js-node-http-adapter/commit/212d5cf2d2a30d0b92bae3c6cbab5d343a9eec7e))

## [0.0.22](https://github.com/stone-foundation/stone-js-node-http-adapter/compare/v0.0.21...v0.0.22) (2025-01-06)

### Features

- implement error handler and update lifecycle hooks ([98d0ead](https://github.com/stone-foundation/stone-js-node-http-adapter/commit/98d0eadf76b2b9d63c37e48bbb51cdef92f3d34a))

## [0.0.21](https://github.com/stone-foundation/stone-js-node-http-adapter/compare/v0.0.2...v0.0.21) (2024-12-08)

### Bug Fixes

- change the way error handler is resolved and improve dependencies ([9d070e3](https://github.com/stone-foundation/stone-js-node-http-adapter/commit/9d070e3e3d9f25f224e17a2e0e7d20019f4bc062))

## 0.0.2 (2024-12-01)

### Miscellaneous Chores

- implement node http adapter ([9929d49](https://github.com/stone-foundation/stone-js-node-http-adapter/commit/9929d494d97af9b76f0eedfbba8a3119e7dc4922))
