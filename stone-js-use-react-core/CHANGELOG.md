# @stone-js/use-react-core

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
