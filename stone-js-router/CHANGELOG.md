# Changelog

All notable changes to the "Stone.js Router" extension will be documented in this file.

## Unreleased

### Features

* add the light key-router: `@KeyRouting()` / `@KeyHandler()` / `@OnKey()`, `keyRoutingBlueprint`, `defineKeyRouting` / `defineKeyRoute`. Routes events by a configurable key instead of a path, installs itself as the kernel event handler (mutually exclusive with `@Routing()`), and is tree-shaken away when unused.
* absorb the former `@stone-js/key-router` package (now deleted): `KeyRouter`, `createKeyDecorator`, `collectKeyHandlers`, `defineKeyHandler` and `KeyRouterError` ship here now. Consuming modules (`@stone-js/queue`, `@stone-js/event-bus`, `@stone-js/realtime`) import them from `@stone-js/router`.


## [0.2.1](https://github.com/stone-foundation/stone-js-router/compare/v0.2.0...v0.2.1) (2026-06-12)


### Bug Fixes

* removed Lookbehind regular expression syntax to ensure compatibility with older systems ([#18](https://github.com/stone-foundation/stone-js-router/issues/18)) ([d6dd196](https://github.com/stone-foundation/stone-js-router/commit/d6dd1960d269dfbfe56c225b6e77656247f5433c))

## [0.2.0](https://github.com/stone-foundation/stone-js-router/compare/v0.1.0...v0.2.0) (2026-03-29)


### Features

* add a protocol strategy to support global protocol forcing ([#15](https://github.com/stone-foundation/stone-js-router/issues/15)) ([4014499](https://github.com/stone-foundation/stone-js-router/commit/4014499c1383e4247d912d8538e077403ca458b1))

## [0.1.0](https://github.com/stone-foundation/stone-js-router/compare/v0.0.3...v0.1.0) (2025-06-12)


### Features

* major internal restructuring and cleanup ([#3](https://github.com/stone-foundation/stone-js-router/issues/3)) ([8fbaeca](https://github.com/stone-foundation/stone-js-router/commit/8fbaeca87265f49c925a5a96af252f17c80da8b5))

## [0.0.3](https://github.com/stone-foundation/stone-js-router/compare/v0.0.2...v0.0.3) (2025-01-21)


### Features

* add component route runner ([dcb1dec](https://github.com/stone-foundation/stone-js-router/commit/dcb1dec66c9e996e5c030f78d90c59b8a8a33287))


## 0.0.2 (2025-01-10)


### Features

* implement router ([f8abb83](https://github.com/stone-foundation/stone-js-router/commit/f8abb83c37fe480e42cabc3da7fe0734d13cab4c))
