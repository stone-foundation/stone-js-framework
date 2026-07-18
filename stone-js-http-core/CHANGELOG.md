# Changelog

All notable changes to the "Stone.js Http core" extension will be documented in this file.

## Unreleased


## [0.1.3](https://github.com/stone-foundation/stone-js-http-core/compare/v0.1.2...v0.1.3) (2025-06-12)


### Miscellaneous Chores

* fix dependabot and sonarcloud issues ([#69](https://github.com/stone-foundation/stone-js-http-core/issues/69)) ([966e820](https://github.com/stone-foundation/stone-js-http-core/commit/966e82062ff7370a270a27b427e788d72562fafb))

## [0.1.2](https://github.com/stone-foundation/stone-js-http-core/compare/v0.1.1...v0.1.2) (2025-06-11)


### Miscellaneous Chores

* set right value in sonar config ([#67](https://github.com/stone-foundation/stone-js-http-core/issues/67)) ([507fb10](https://github.com/stone-foundation/stone-js-http-core/commit/507fb10c180f8a76e1a93fdf0749d066083f525d))

## [0.1.1](https://github.com/stone-foundation/stone-js-http-core/compare/v0.1.0...v0.1.1) (2025-06-05)


### Bug Fixes

* fix Inefficient regular expression, add security file and configure sonar cloud ([#55](https://github.com/stone-foundation/stone-js-http-core/issues/55)) ([0d36986](https://github.com/stone-foundation/stone-js-http-core/commit/0d369869add0f1630e9b5b2cd1421e57ee8d3865))
* fix sonar issues ([#56](https://github.com/stone-foundation/stone-js-http-core/issues/56)) ([b831895](https://github.com/stone-foundation/stone-js-http-core/commit/b831895497ad78853c6297d03ab0449b614ea055))

## [0.1.0](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.4...v0.1.0) (2025-06-04)


### Features

* major internal restructuring and cleanup ([#52](https://github.com/stone-foundation/stone-js-http-core/issues/52)) ([5dc19e8](https://github.com/stone-foundation/stone-js-http-core/commit/5dc19e88b97a10a08254fe79d8071a9023d59ff6))

This update delivers a comprehensive internal refactoring of the `http-core` module to align with the latest Stone.js standards and improve consistency across the ecosystem.

#### Changes included:

* Refactored core logic for `IncomingHttpEvent` and `OutgoingHttpResponse` to improve maintainability and clarity
* Enhanced typings across all exported utilities for stronger TypeScript support
* Introduced new HTTP features and options for response control and cookie handling
* Improved test coverage with additional cases for edge scenarios
* Fixed various internal inconsistencies and cleaned up outdated code
* Minor typo fixes in documentation

This refactoring ensures a more stable, extensible foundation for HTTP event processing in all Stone.js runtime adapters.

## [0.0.4](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.34...v0.0.4) (2025-01-21)


### Features

* add response util methods and response decorator ([1848d2c](https://github.com/stone-foundation/stone-js-http-core/commit/1848d2cc8e9419d9e370ae707c528a45d3c2ac5a))

## [0.0.34](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.33...v0.0.34) (2025-01-06)


### Features

* add new error classes and implement default error handler ([01ff480](https://github.com/stone-foundation/stone-js-http-core/commit/01ff4806cd9165b6846329e5f909f61f5c067d6a))

## [0.0.33](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.32...v0.0.33) (2024-12-08)


### Build System

* update @stone-js/core dependency ([34374e6](https://github.com/stone-foundation/stone-js-http-core/commit/34374e6c4f2f644afedac48ffd94e75996e1eca3))

## [0.0.32](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.3...v0.0.32) (2024-12-01)


### Miscellaneous Chores

* update Stone core dependency ([33a82b7](https://github.com/stone-foundation/stone-js-http-core/commit/33a82b77e98ade423889148c13f25ccd40b75c8a))

## [0.0.3](https://github.com/stone-foundation/stone-js-http-core/compare/v0.0.2...v0.0.3) (2024-12-01)


### Miscellaneous Chores

* upgrade mime version ([ed7c218](https://github.com/stone-foundation/stone-js-http-core/commit/ed7c2187bd85b6877da7cd9f8c94448716446e07))

## 0.0.2 (2024-11-30)


### Features

* implement http-core ([24dd4b3](https://github.com/stone-foundation/stone-js-http-core/commit/24dd4b3f1e59fc19fb65fa5316121fe4b68e4f41))
