# Changelog

## 0.8.3

### Patch Changes

- @stone-js/pipeline@0.8.3
- @stone-js/config@0.8.3
- @stone-js/service-container@0.8.3

## 0.8.2

### Patch Changes

- d7f213c: Code-quality pass (SonarCloud) with one security fix.

  - Fix a broken JSONP callback sanitizer in `@stone-js/http-core`: a malformed character class
    (`[^\\[\\]\w$.]`) closed early, so the "sanitized" callback was left almost untouched and could
    carry `<`/`>`. It now strips characters outside `[\w$.[\]]`, closing a reflected-XSS vector.
  - Harden the website deploy workflow: GitHub Pages permissions moved from workflow level to the
    jobs that need them (least privilege).
  - Assorted maintainability cleanups: `RegExp.exec` over `String.match`, `Set` membership,
    `export…from` re-exports, extracted nested templates/ternaries, `.some()` over
    `filter().length`, default parameters, and more.

  No public runtime behavior change (other than the JSONP sanitizer now behaving as intended).

  - @stone-js/pipeline@0.8.2
  - @stone-js/config@0.8.2
  - @stone-js/service-container@0.8.2

## 0.8.1

### Patch Changes

- Maintenance release: monorepo hygiene and code-quality cleanup (no runtime behavior change).

  - Remove obsolete per-module `.github` directories and stale `package-lock.json` files; the
    monorepo builds from a single root pnpm workspace and root CI, which clears the Dependabot
    alert noise those legacy trees produced.
  - SonarCloud pass across the workspace: `node:` import protocol, `String.raw`/`codePointAt`
    modernizations, redundant union-type cleanups, unique test titles, extracted nested ternaries,
    and optional catch bindings.
  - Fix a quadratic (super-linear) slash-trim regex in the cloud-file S3/GCS/Azure drivers.
  - Replace MD5 with SHA-256 in the cache hash helpers.

  `replaceAll`/`Object.hasOwn` are intentionally avoided so the published packages stay ES2015-safe
  for the browser (preset-env runs without polyfills).

  - @stone-js/pipeline@0.8.1
  - @stone-js/config@0.8.1
  - @stone-js/service-container@0.8.1

All notable changes to the "Stone.js Core" extension will be documented in this file.

## Unreleased

## [0.2.1](https://github.com/stone-foundation/stone-js-core/compare/v0.2.0...v0.2.1) (2026-06-13)

### Bug Fixes

- updated Container dependencies to fix bugs ([#41](https://github.com/stone-foundation/stone-js-core/issues/41)) ([59a6e39](https://github.com/stone-foundation/stone-js-core/commit/59a6e394d7d4b96f8b1b296ebeba890c8813095e))

## [0.2.0](https://github.com/stone-foundation/stone-js-core/compare/v0.1.4...v0.2.0) (2026-04-05)

### Features

- Add onEvent hook to kernel for incoming event injection ([#38](https://github.com/stone-foundation/stone-js-core/issues/38)) ([0e50ee4](https://github.com/stone-foundation/stone-js-core/commit/0e50ee4552f6844287b38c6def62ad947ec7d204))

## [0.1.4](https://github.com/stone-foundation/stone-js-core/compare/v0.1.3...v0.1.4) (2026-03-29)

### Bug Fixes

- export IContainer directly ([#37](https://github.com/stone-foundation/stone-js-core/issues/37)) ([a1d2a92](https://github.com/stone-foundation/stone-js-core/commit/a1d2a92a59de5d2cce271cd03225f3341b4d3791))
- register event listener in boot stage instead of register stage ([#35](https://github.com/stone-foundation/stone-js-core/issues/35)) ([aa09e56](https://github.com/stone-foundation/stone-js-core/commit/aa09e568169f8c4e31af0a53be6a253620847aa0))

## [0.1.3](https://github.com/stone-foundation/stone-js-core/compare/v0.1.2...v0.1.3) (2025-07-19)

### Bug Fixes

- update deps and fix response guard in kernel ([#22](https://github.com/stone-foundation/stone-js-core/issues/22)) ([5cb2081](https://github.com/stone-foundation/stone-js-core/commit/5cb2081d4a0ee3eada4ac54584bb433293690913))

## [0.1.2](https://github.com/stone-foundation/stone-js-core/compare/v0.1.1...v0.1.2) (2025-07-01)

### Bug Fixes

- bind non-global middleware to the container ([#19](https://github.com/stone-foundation/stone-js-core/issues/19)) ([9942811](https://github.com/stone-foundation/stone-js-core/commit/99428119fe074bafa7fff19c351cf03515fadecf))

## [0.1.1](https://github.com/stone-foundation/stone-js-core/compare/v0.1.0...v0.1.1) (2025-06-12)

### Miscellaneous Chores

- migrate to stone-foundation, integrate sonar cloud and add security policy ([#14](https://github.com/stone-foundation/stone-js-core/issues/14)) ([fa3aa5e](https://github.com/stone-foundation/stone-js-core/commit/fa3aa5e08f8ebda739bd4fb0a7ba61d502b68790))

## [0.1.0](https://github.com/stone-foundation/stone-js-core/compare/v0.0.4...v0.1.0) (2025-06-04)

### Features

- major internal restructuring and cleanup ([#10](https://github.com/stone-foundation/stone-js-core/issues/10)) ([eb49057](https://github.com/stone-foundation/stone-js-core/commit/eb4905700b68d877c83920dea41d27fb1c7f6b98))
- This Version introduces a comprehensive internal refactoring of the Stone.js core module to improve maintainability, developer experience, and project readiness for future releases.

#### Highlights

- **Documentation Overhaul**

  - Updated `StoneFactory`, `Kernel`, and related modules to match the latest internal API.
  - Removed outdated references and improved clarity for new contributors.

- **License and Legal**

  - Switched project license from **Apache 2.0** to **MIT**.
  - Updated `README.md` to reflect the new licensing and project scope.

- **CI & DevOps Improvements**

  - Integrated **Codecov** for test coverage reporting.
  - Added **Dependabot** configuration for automated dependency updates.

- **Blueprint Utilities**

  - Introduced new utility functions to streamline blueprint definition and validation.

- **Testing Enhancements**

  - Achieved 100% unit test coverage on core adapters and blueprint modules.
  - Improved test organization and consistency across the project.

- **Imperative API Polishing**

  - Refined the imperative API for better developer ergonomics and internal coherence.

This restructuring lays the groundwork for the upcoming beta phase and prepares the core for long-term stability.

## [0.0.4](https://github.com/stone-foundation/stone-js-core/compare/v0.0.36...v0.0.4) (2025-01-21)

### Features

- implement response resolver for kernel ([7b609ec](https://github.com/stone-foundation/stone-js-core/commit/7b609ec8ba784ecdcf8353e8626cb5efb0b144ab))

## [0.0.36](https://github.com/stone-foundation/stone-js-core/compare/v0.0.35...v0.0.36) (2025-01-06)

### Features

- improve lifecycle hooks, implement error handler mechanism and legacy decorator compatibility ([8375902](https://github.com/stone-foundation/stone-js-core/commit/83759020101bdf94fc7c7a0d8609e63689d57c0f))

### Bug Fixes

- fix typing issues and update dependencies ([d28941a](https://github.com/stone-foundation/stone-js-core/commit/d28941aea6c8a2d26eb8cc9621f78faa8122d968))

## [0.0.35](https://github.com/stone-foundation/stone-js-core/compare/v0.0.34...v0.0.35) (2024-12-07)

### Miscellaneous Chores

- fix issues in errorHandler and allow onTerminate hook to finish gracefully ([bd81faa](https://github.com/stone-foundation/stone-js-core/commit/bd81faa568439cf30eb0c939171bd081c0b50861))

## [0.0.34](https://github.com/stone-foundation/stone-js-core/compare/v0.0.33...v0.0.34) (2024-12-05)

### Miscellaneous Chores

- move ErrorHandler config from global config to adapter config ([775bef5](https://github.com/stone-foundation/stone-js-core/commit/775bef589e4302e7bceb11d58608ca782f3078c7))

## [0.0.33](https://github.com/stone-foundation/stone-js-core/compare/v0.0.32...v0.0.33) (2024-12-01)

### Miscellaneous Chores

- rename AdapterBuilder to AdapterEventBuilder ([59c27bd](https://github.com/stone-foundation/stone-js-core/commit/59c27bdae04e7adc72d7c3e25cee704d5e04ce0c))

## [0.0.32](https://github.com/stone-foundation/stone-js-core/compare/v0.0.31...v0.0.32) (2024-11-28)

### Miscellaneous Chores

- change the way Adapter and Kernel handle and process incoming event ([c4dbb69](https://github.com/stone-foundation/stone-js-core/commit/c4dbb69a8c86aa6134b62f7d9cac7dabb444c749))
- make OutgoingResponse properties mutable ([9cce3ac](https://github.com/stone-foundation/stone-js-core/commit/9cce3accbbae4e07f941cf224818cba52006a712))

## [0.0.31](https://github.com/stone-foundation/stone-js-core/compare/v0.0.3...v0.0.31) (2024-11-25)

### Miscellaneous Chores

- throw SetupError for blueprint utilities ([a1d0e9f](https://github.com/stone-foundation/stone-js-core/commit/a1d0e9f001d3ced56e24beb77bf778d53bbcde5a))

## [0.0.3](https://github.com/stone-foundation/stone-js-core/compare/v0.0.2...v0.0.3) (2024-11-25)

### Miscellaneous Chores

- add custom errors ([dd7eaec](https://github.com/stone-foundation/stone-js-core/commit/dd7eaec566465ef84c36b87b824f8ea9ab76e8fa))

## 0.0.2 (2024-11-23)

### Features

- implement core ([be89f75](https://github.com/stone-foundation/stone-js-core/commit/be89f756f02a94c320588453a86b3e95bc4e060f))
