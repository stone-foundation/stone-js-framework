# Change Log

## 1.0.0

### Patch Changes

- 3308197: Gate-0 beta hardening.

  - **core**: keep the kernel platform-agnostic. A bare handler return is wrapped as `content` and the platform's `responseResolver` assigns the default status (HTTP defaults to 200, a CLI adapter to its own exit code), instead of the kernel hardcoding `statusCode: 200`.
  - **create**: depend on the workspace `@stone-js/cli` (was pinned to an old `^0.1.2`) so `npm create @stone-js` scaffolds against the current framework; brought into the workspace and the lockstep release group.

- Updated dependencies [ec1af7b]
  - @stone-js/cli@1.0.0

All notable changes to the "Stone.js Create" extension will be documented in this file.

## Unreleased

## [0.1.3](https://github.com/stone-foundation/stone-js/compare/v0.1.2...v0.1.3) (2025-06-14)

### Bug Fixes

- change npm package name to @stone-js/create ([#7](https://github.com/stone-foundation/stone-js/issues/7)) ([1771203](https://github.com/stone-foundation/stone-js/commit/1771203e0fcc7ac133b10b116a575228dff45736))

## [0.1.2](https://github.com/stone-foundation/stone-js/compare/v0.1.1...v0.1.2) (2025-06-14)

### Bug Fixes

- change the repo and npm package name ([#5](https://github.com/stone-foundation/stone-js/issues/5)) ([ec36dc8](https://github.com/stone-foundation/stone-js/commit/ec36dc82e9b3469cbf7da741de979ebe2a5841f8))

## [0.1.1](https://github.com/stone-foundation/stone-js/compare/v0.1.0...v0.1.1) (2025-06-14)

### Bug Fixes

- rename npm package to create-stone ([#3](https://github.com/stone-foundation/stone-js/issues/3)) ([607c42c](https://github.com/stone-foundation/stone-js/commit/607c42c12883c04198db8a40425551b4912ce5c8))

## 0.1.0 (2025-06-14)

### Features

- implement create stone app ([19a19e5](https://github.com/stone-foundation/stone-js/commit/19a19e5e7396a745f7077e01ec665f8c4fe7d3bf))
- major internal restructuring and cleanup ([#1](https://github.com/stone-foundation/stone-js/issues/1)) ([5a50346](https://github.com/stone-foundation/stone-js/commit/5a50346299b8d87db4f45f1cf310c330bd9c18ab))
