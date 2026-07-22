# Changelog

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/realtime@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Node WebSocket Adapter" will be documented in this file.

## Unreleased

### Refactor

- every socket event is now normalized into an `IncomingEvent` and routed through the kernel + the light key-router (`@stone-js/router`), one pattern everywhere. Drops direct `RealtimeRouter` dispatch and the `stone.adapter.dispatchToKernel` flag (dispatch is always on). The connection store stays in the adapter.
