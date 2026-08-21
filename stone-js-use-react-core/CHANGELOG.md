# @stone-js/use-react-core

## 0.8.13

### Patch Changes

- Updated dependencies [8c2b600]
  - @stone-js/http-core@0.8.13
  - @stone-js/core@0.8.13
  - @stone-js/config@0.8.13
  - @stone-js/router@0.8.13
  - @stone-js/browser-core@0.8.13
  - @stone-js/use-view@0.8.13

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

- Updated dependencies [047d9b0]
- Updated dependencies [c971168]
- Updated dependencies [c971168]
  - @stone-js/http-core@0.8.12
  - @stone-js/use-view@0.8.12
  - @stone-js/core@0.8.12
  - @stone-js/browser-core@0.8.12
  - @stone-js/router@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- Updated dependencies [13cebd1]
  - @stone-js/http-core@0.8.11
  - @stone-js/core@0.8.11
  - @stone-js/browser-core@0.8.11
  - @stone-js/router@0.8.11
  - @stone-js/use-view@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- 318cbf5: refactor(use-react): the platform-independent half becomes `@stone-js/use-react-core`

  Both React renderers, the web one and the native one, do the same work before they differ.
  Resolving which component answers a route, loading a lazy page, running its loader, wrapping
  it in its layout, merging the head, running the view hooks: none of that is web or native.
  It now lives in `@stone-js/use-react-core`, and `@stone-js/use-react` depends on it and
  re-exports it.

  **Nothing changes for you.** Every symbol you imported from `@stone-js/use-react` still
  comes from `@stone-js/use-react`: its public surface was measured before and after the split
  and is identical, 176 exports either way. No import in an application, a starter or the CLI
  moves.

  **Why a package and not a folder.** A React Native bundler resolves every import it sees,
  including dynamic ones, so a module that reaches for `react-dom` cannot be loaded on a phone
  at all, whatever its code paths do at runtime. `@stone-js/use-react`'s published entry also
  pulls the SSR bundle, and with it `node:http`. The split is what makes one domain reachable
  from both platforms; the emitted `dist/index.js` of the new package is checked to import
  nothing but `@stone-js/core`, `@stone-js/router`, `@stone-js/use-view` and `react`.

  What stayed in `@stone-js/use-react`: mounting a root and hydrating server markup, the HTML
  shell, the snapshot script tag, the `ReactViewEngine`, `StoneLink`, `StoneOutlet`,
  `StoneError`, the DOM helpers, the server and browser sub-trees, and the two hooks that need
  the web runtime (`useRuntime`, `useHead`). What moved: the page, layout and error-page
  contracts and their decorators, the React context, the eleven platform-independent hooks,
  view providers, the blueprint middleware that reads decorator metadata, and the render
  orchestration.

  One behaviour change, and it is the seam that made the split possible:
  `buildAdapterErrorComponent` no longer imports the `StoneError` component. It takes an
  optional `fallback` component instead, and `@stone-js/use-react` passes `StoneError` as it
  always did. Called without a fallback it now returns `undefined` rather than rendering an
  `<h1>`, because a package that may be rendering native views cannot reach for HTML.

  `ReactViewEngine` gained the tests it was missing (mount update, hydration, stream
  cancellation, a failing shell), which took `@stone-js/use-react` from 96.55% to 100% function
  coverage on the way through.

- Updated dependencies [18644c8]
- Updated dependencies [9f074f8]
  - @stone-js/router@0.8.10
  - @stone-js/use-view@0.8.10
  - @stone-js/core@0.8.10
  - @stone-js/browser-core@0.8.10
  - @stone-js/http-core@0.8.10
  - @stone-js/config@0.8.10
