# Changelog

## 0.8.16

### Patch Changes

- @stone-js/realtime@0.8.16
- @stone-js/core@0.8.16
- @stone-js/config@0.8.16

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/config@0.8.15
- @stone-js/realtime@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/core@0.8.14
  - @stone-js/realtime@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/config@0.8.13
- @stone-js/realtime@0.8.13

## 0.8.12

### Patch Changes

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/realtime@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/realtime@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- 8760d1c: fix: a build that fails says so, and a shutdown that starts finishes

  Four silent failures, all of the same shape: something reported success, or reported nothing, while the process was in a state nobody asked for.

  - `stone build --ssg` wrote whatever a page answered, including an error body, and exited `0`. A pre-render is an HTTP request, so a page that throws answers 500, and that HTML was published as the page. The build now stops, names every page it could not render and what it answered, and writes nothing at all.
  - A failed CLI command resolved exit `1` and then hung forever: build tooling leaves handles behind, which is why a successful build already exits deliberately. The failing path now does the same, so CI sees the failure instead of a timeout.
  - SSG left its pre-render server behind when the app shut down gracefully, and the open pipes kept the CLI alive. It now waits for the child to go, and forces it when it does not.
  - `@stone-js/node-http-adapter` closed the server on `SIGINT`/`SIGTERM` and waited for every socket, so an idle keep-alive connection held the process open forever and an orchestrator had to hard-kill a container that promised to leave. Idle connections are closed at once, requests in flight get `shutdownGracePeriod` (10s by default), and the process exits either way.
  - `@stone-js/node-ws-adapter` could not stop while anyone was connected, which is a realtime server's normal state. Clients are now asked to leave with `1001 Going away` and dropped after the grace period.

- Updated dependencies [9f074f8]
  - @stone-js/core@0.8.10
  - @stone-js/realtime@0.8.10
  - @stone-js/config@0.8.10

## 0.8.9

### Patch Changes

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [0629318]
- Updated dependencies [5e01789]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/realtime@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8
- @stone-js/realtime@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7
- @stone-js/realtime@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6
- @stone-js/realtime@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5
- @stone-js/realtime@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4
- @stone-js/realtime@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3
- @stone-js/realtime@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/realtime@0.8.2
  - @stone-js/config@0.8.2

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
