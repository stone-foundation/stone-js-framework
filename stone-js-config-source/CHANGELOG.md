# Changelog

## 0.8.9

### Patch Changes

- e149263: fix: `.mcp.json` launches the CLI through `npx`, and vendor cycles stop flooding the build

  - **`@stone-js/mcp-dev`**: `stone mcp --init` wrote `{ "command": "stone", "args": ["mcp"] }`. Since `@stone-js/cli` is a project dev dependency, the bare `stone` only resolves with a global install, so the server an agent spawned failed with ENOENT on a normal project. The entry now goes through `npx`, which finds the project-local binary first and a global one otherwise.
  - **`@stone-js/cli`**: circular-dependency warnings coming from `node_modules` are now filtered on every build path, not just one. A React app bundles its dependencies into the SSR build (`ssr.noExternal`), so reaching the MCP SDK printed around twenty warnings from `zod` and `zod-to-json-schema` on an otherwise successful build, which reads as a failure. Cycles in your own code still warn, because those are actionable.
  - **`@stone-js/config-source`**: the optional `js-yaml` peer floor moves to `^4.3.1`, the patched line for the quadratic-CPU advisory.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/config@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7
- @stone-js/config@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/config@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5
- @stone-js/config@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/config@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3
- @stone-js/config@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js Config Source" module will be documented in this file.

## Unreleased
