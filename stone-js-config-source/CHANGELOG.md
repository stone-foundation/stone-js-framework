# Changelog

## 0.8.9

### Patch Changes

- e149263: fix: `.mcp.json` launches the CLI through `npx`, and vendor cycles stop flooding the build

  - **`@stone-js/mcp-dev`**: `stone mcp --init` wrote `{ "command": "stone", "args": ["mcp"] }`. Since `@stone-js/cli` is a project dev dependency, the bare `stone` only resolves with a global install, so the server an agent spawned failed with ENOENT on a normal project. The entry now goes through `npx`, which finds the project-local binary first and a global one otherwise.
  - **`@stone-js/cli`**: circular-dependency warnings coming from `node_modules` are now filtered on every build path, not just one. A React app bundles its dependencies into the SSR build (`ssr.noExternal`), so reaching the MCP SDK printed around twenty warnings from `zod` and `zod-to-json-schema` on an otherwise successful build, which reads as a failure. Cycles in your own code still warn, because those are actionable.
  - **`@stone-js/config-source`**: the optional `js-yaml` peer floor moves to `^4.3.1`, the patched line for the quadratic-CPU advisory.
  - @stone-js/core@0.8.9
  - @stone-js/config@0.8.9

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
