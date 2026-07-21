# Changelog

All notable changes to the "Stone.js Event Bus" module will be documented in this file.

## Unreleased

### Refactor

* the listener side is now the light key-router from `@stone-js/router`. `@BusListener` / `@BusHandler` / `@OnBusEvent` are thin aliases of `@KeyRouting` / `@KeyHandler` / `@OnKey`; the module's own `BusEventHandler`, blueprint middleware and `defineBusHandler` are removed. The emit side (`@EventBus`, drivers, `eventBus`) is unchanged.

### Miscellaneous Chores

* the key-router primitive moved into `@stone-js/router`; import `KeyRouter` / `createKeyDecorator` / `collectKeyHandlers` from `@stone-js/router` (was `@stone-js/key-router`).
