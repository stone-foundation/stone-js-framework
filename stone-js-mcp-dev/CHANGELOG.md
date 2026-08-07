# @stone-js/mcp-dev

## 0.8.9

### Patch Changes

- e149263: fix: `.mcp.json` launches the CLI through `npx`, and vendor cycles stop flooding the build

  - **`@stone-js/mcp-dev`**: `stone mcp --init` wrote `{ "command": "stone", "args": ["mcp"] }`. Since `@stone-js/cli` is a project dev dependency, the bare `stone` only resolves with a global install, so the server an agent spawned failed with ENOENT on a normal project. The entry now goes through `npx`, which finds the project-local binary first and a global one otherwise.
  - **`@stone-js/cli`**: circular-dependency warnings coming from `node_modules` are now filtered on every build path, not just one. A React app bundles its dependencies into the SSR build (`ssr.noExternal`), so reaching the MCP SDK printed around twenty warnings from `zod` and `zod-to-json-schema` on an otherwise successful build, which reads as a failure. Cycles in your own code still warn, because those are actionable.
  - **`@stone-js/config-source`**: the optional `js-yaml` peer floor moves to `^4.3.1`, the patched line for the quadratic-CPU advisory.
  - @stone-js/core@0.8.9

## 0.8.8

### Patch Changes

- d5bee74: docs(mcp-dev): centre the setup on `npx stone mcp --init`

  The README told you to start the server yourself, which does nothing useful for a stdio transport: the agent spawns its own child process and talks to it over that process's stdin/stdout, so a server launched in a terminal has no channel to the agent. Setup is now the single `--init` command, with the manual run documented only as a way to read the stderr logs while debugging.

  Commands are shown as `npx stone …` since `@stone-js/cli` is a project dev dependency, and the alternative (a global install) is stated.

  Also removes `stone_docs` from the documented tool list and from the Agent Skills: that tool does not exist, so an agent following the skills was calling a name the server never advertised.

  - @stone-js/core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6

## 0.8.5

### Patch Changes

- @stone-js/core@0.8.5

## 0.8.4

### Patch Changes

- 01db442: Refine the Continuum wording in the framework knowledge base: "an application is not an artefact
  but an act" (aligning with the manifesto and the docs).
  - @stone-js/core@0.8.4

## 0.8.3

### Patch Changes

- @stone-js/core@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
