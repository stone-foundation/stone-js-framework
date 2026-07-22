# Changelog

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/router@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Realtime" module will be documented in this file.

## Unreleased

### Refactor

- gateways now route through the kernel via the light key-router (`@stone-js/router`). `@RealtimeGateway`/`@On*` are aliases of `@KeyHandler`/`@OnKey`; the internal `RealtimeRouter` is removed. Gateway methods now receive `(payload, event)`; read the connection with the new `connectionOf(event)` helper.

### Miscellaneous Chores

- the key-router primitive moved into `@stone-js/router`; import `KeyRouter` / `createKeyDecorator` / `collectKeyHandlers` from `@stone-js/router` (was `@stone-js/key-router`).
