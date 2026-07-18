# Changelog

All notable changes to the "Stone.js Browser core" extension will be documented in this file.

## Unreleased


## [0.1.1](https://github.com/stone-foundation/stone-js-browser-core/compare/v0.1.0...v0.1.1) (2025-06-12)


### Miscellaneous Chores

* migrate to stone-foundation, integrate sonar cloud and add security policy ([#53](https://github.com/stone-foundation/stone-js-browser-core/issues/53)) ([d969e21](https://github.com/stone-foundation/stone-js-browser-core/commit/d969e213200093ce407bb73c4509a4759b2be345))

## [0.1.0](https://github.com/stone-foundation/stone-js-browser-core/compare/v0.0.3...v0.1.0) (2025-06-05)


### Features

* major internal restructuring and cleanup ([#43](https://github.com/stone-foundation/stone-js-browser-core/issues/43)) ([cb27be0](https://github.com/stone-foundation/stone-js-browser-core/commit/cb27be08d105f8175759c59f313cfe1000c4a6a1))

This release introduces a comprehensive internal refactoring of the `browser-core` module to align with the evolving architecture of Stone.js and ensure smooth runtime continuity between server and browser environments.

#### Changes included:

* Restructured the module around `IncomingBrowserEvent`, `OutgoingBrowserResponse`, and `RedirectBrowserResponse` to better reflect navigation-based runtime behavior
* Refined the `CookieCollection` API for consistent cookie handling across browser and HTTP contexts
* Improved typings for stronger type safety and better developer experience
* Added new runtime features to enhance browser response capabilities
* Fixed minor issues and streamlined internal logic
* Expanded unit test coverage for increased reliability

This cleanup prepares the module for SPA and SSR integration within the Continuum Architecture and brings it in line with the internal standards applied across all Stone.js core packages.

## [0.0.3](https://github.com/stone-foundation/stone-js-browser-core/compare/v0.0.2...v0.0.3) (2025-01-21)


### Features

* add new util methods to event and response ([58b3a03](https://github.com/stone-foundation/stone-js-browser-core/commit/58b3a039142f6865ef6912ef058985d46f08d508))

## 0.0.2 (2025-01-18)


### Features

* implement browser core ([2c2c45d](https://github.com/stone-foundation/stone-js-browser-core/commit/2c2c45da7146109ea5ae39ff81ac0b60630dfeee))
