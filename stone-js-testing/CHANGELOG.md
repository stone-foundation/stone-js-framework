# @stone-js/testing

## 1.0.0

### Minor Changes

- 0edcba4: Add `@stone-js/testing`: boot a real Stone.js app in-memory and dispatch synthetic events through the full kernel — no server, no port. `createTestApp({ modules })` runs the real bootstrap (blueprint, providers, hooks) via `StoneFactory` but swaps in an in-memory `TestAdapter`, returning a `TestClient` whose `send(event)` returns the actual `OutgoingResponse` your handlers produced (each send gets a fresh ephemeral container, mirroring per-request isolation). Ships `makeIncomingHttpEvent()` / `makeIncomingEvent()` factories. Works with any test runner.

### Patch Changes

- Updated dependencies [3308197]
  - @stone-js/core@1.0.0
  - @stone-js/http-core@1.0.0
