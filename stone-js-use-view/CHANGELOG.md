# @stone-js/use-view

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/router@0.8.15

## 0.8.14

### Patch Changes

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/router@0.8.14
  - @stone-js/core@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/router@0.8.13

## 0.8.12

### Patch Changes

- c971168: docs: the framework's examples stop citing a private package

  The view provider documentation taught its two registration paths with `@noowow/design-system`,
  a package nobody reading the docs can install, listed among MUI and Chakra as though it were one of
  them. It shipped in the published declarations and in TypeDoc. The examples now use MUI's real
  `createTheme` / `ThemeProvider`, which is the archetypal case the mechanism exists for, and which
  a reader can actually run.

  It also fixes the examples: both snippets passed a `theme` that was never defined in them.

  **And the full React starters stop scaffolding someone else's copyright.** Their footers read
  `2025 Stone.js © Noowow Labs` and `Stone.js © 2025 Stone Foundation`, so an application generated
  from a starter shipped a client's or the framework's name in its own footer, with a year that was
  already stale. They now read `© <current year> Your Company · Built with Stone.js`: a placeholder
  that says what to replace.

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/router@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/router@0.8.11

## 0.8.10

### Patch Changes

- 18644c8: feat(router): navigation becomes an effect the platform provides, not an assumption

  `Router.navigate()` was the one place the universal router stopped being universal: it reached
  straight for `window.history` and `window.dispatchEvent`, and threw outside a browser. Everything
  around it, matching and generating a path from a route name, is platform-independent already.

  Only that last step is now delegated, to a `RouterNavigator` under `stone.router.navigator`:

  ```ts
  export type RouterNavigator = (context: NavigationContext) => void;
  // NavigationContext: { path, replace, options }
  ```

  The router still does the platform-independent work before calling it, so a navigator receives a
  resolved path and performs one effect. `browserNavigator` is the fallback when none is configured,
  and it is the exact behaviour that was inlined before (push or replace a History entry, then
  announce it so the adapter re-enters the kernel), which means **nothing changes for a web
  application**: a `navigate()` outside a browser still throws the same `RouterError`.

  The fallback lives in `Router.navigate()` and deliberately **not** in the router's blueprint. Pinning
  it there would make "not configured" indistinguishable from "configured to be the browser", and an
  adapter for another platform could never tell whether it was free to install its own: it could not,
  and `navigate()` on a phone threw "browser environment" instead of navigating.

  One ordering nuance for the curious: with a route name and no browser, the missing-route error now
  surfaces before the missing-browser one, because resolving the path no longer waits behind a
  platform check.

  **`ViewEngine` no longer requires a DOM element to mount into.** `mount` and `hydrate` were typed
  `(node, container: Element)`, a DOM type in the middle of the engine-agnostic contract. The host is
  now a third type parameter defaulting to `Element`, so every existing engine and call site is
  unchanged, and an engine on a platform with no element tree (React Native registers a root
  component) can name its own host.

  **`ReactViewEngine` no longer instantiates a `TextEncoder` at import time.** It moved inside the
  streaming helper that uses it. Importing a module should not require a global that only server
  streaming needs, and some client engines do not have it.

  Together these are what a platform outside the browser needs from the shared layers, and they are
  the reason the React Native work needs no fork of the router or of the view contract.

- Updated dependencies [18644c8]
- Updated dependencies [9f074f8]
  - @stone-js/router@0.8.10
  - @stone-js/core@0.8.10

## 0.8.9

### Patch Changes

- 0629318: Point every README link at somewhere that exists.

  The per-module repositories were retired when the framework moved to a single one, so 36 links
  across 18 READMEs answered with a 404: the exact links a newcomer clicks first, "Contributing"
  and "API". The contributing guide now points at the monorepo, and the API reference at the
  published one.

  `docs/` was never a durable target either, retired repository or not: it is TypeDoc output, and
  every build begins by deleting it.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [0629318]
- Updated dependencies [5e01789]
- Updated dependencies [be13033]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [b3efe5f]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/core@0.8.9
  - @stone-js/router@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/router@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/router@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/router@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/router@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/router@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/router@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/router@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/router@0.8.1
