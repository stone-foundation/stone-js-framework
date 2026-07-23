# Changelog

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/router@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/router@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/router@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Event Bus" module will be documented in this file.

## Unreleased

### Refactor

- the listener side is now the light key-router from `@stone-js/router`. `@BusListener` / `@BusHandler` / `@OnBusEvent` are thin aliases of `@KeyRouting` / `@KeyHandler` / `@OnKey`; the module's own `BusEventHandler`, blueprint middleware and `defineBusHandler` are removed. The emit side (`@EventBus`, drivers, `eventBus`) is unchanged.

### Miscellaneous Chores

- the key-router primitive moved into `@stone-js/router`; import `KeyRouter` / `createKeyDecorator` / `collectKeyHandlers` from `@stone-js/router` (was `@stone-js/key-router`).
