# Changelog

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/env@0.8.4
- @stone-js/realtime@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/env@0.8.3
- @stone-js/realtime@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/realtime@0.8.2
  - @stone-js/config@0.8.2
  - @stone-js/env@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/realtime@0.8.1
  - @stone-js/config@0.8.1
  - @stone-js/env@0.8.1

All notable changes to the "Stone.js AWS API Gateway WebSocket Adapter" will be documented in this file.

## Unreleased

### Refactor

- every socket event is now normalized into an `IncomingEvent` and routed through the kernel + the light key-router (`@stone-js/router`), one pattern everywhere. Drops direct `RealtimeRouter` dispatch and the `stone.adapter.dispatchToKernel` flag. Presence still lives in DynamoDB; replies still go through the Management API.
