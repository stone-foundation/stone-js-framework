# @stone-js/mcp-dev

## 0.8.9

### Patch Changes

- fe49d7e: Correct the MCP knowledge base so shipped queue, cache, i18n, realtime, and cloud-file modules are no longer reported as planned gaps, and guard the list against future workspace drift.
- e149263: fix: `.mcp.json` launches the CLI through `npx`, and vendor cycles stop flooding the build

  - **`@stone-js/mcp-dev`**: `stone mcp --init` wrote `{ "command": "stone", "args": ["mcp"] }`. Since `@stone-js/cli` is a project dev dependency, the bare `stone` only resolves with a global install, so the server an agent spawned failed with ENOENT on a normal project. The entry now goes through `npx`, which finds the project-local binary first and a global one otherwise.
  - **`@stone-js/cli`**: circular-dependency warnings coming from `node_modules` are now filtered on every build path, not just one. A React app bundles its dependencies into the SSR build (`ssr.noExternal`), so reaching the MCP SDK printed around twenty warnings from `zod` and `zod-to-json-schema` on an otherwise successful build, which reads as a failure. Cycles in your own code still warn, because those are actionable.
  - **`@stone-js/config-source`**: the optional `js-yaml` peer floor moves to `^4.3.1`, the patched line for the quadratic-CPU advisory.

- 298cff2: `stone mcp` describes the application you are actually running.

  It is a console command, so a blueprint it resolves for itself is the one a **console** boot produces:
  its adapters, its response type and every platform-conditional contribution belong to a different
  application than the one under `stone dev`. Everything platform-independent was right — routes,
  providers, the kernel handler — and everything else described an app that does not exist, without
  saying so.

  The running application now publishes its resolved configuration to `.stone/app-context.json`, and the
  MCP server reads it. A new `stone_describes` tool says which application the answers describe and how
  the server knows, so a fallback is visible rather than silently wrong.

  **Dev tooling only, with nothing to declare in your application.** `@McpDev()`, `mcpDevBlueprint` and
  `defineMcpDev` are **removed**: introspection is a development concern, and a development tool in an
  application's module graph makes a production build depend on a package the app does not need, for a
  feature nobody uses in production.

  `npm i -D @stone-js/mcp-dev` is now the whole setup. The CLI auto-discovers the plugin, which registers
  `stone mcp` and — on a development build only — injects the publishing hook. Options move to
  `stone.config.mjs` under `mcpDev` (server name, instructions, your own tools, `publishContext`), where
  the rest of the build is already configured. The browser build goes too: it existed to keep an app-side
  decorator inert in a SPA, and there is no longer anything app-side to neutralise.

  A file rather than a dev endpoint, deliberately: the Blueprint is assembled once before the first event
  and then read, so publishing it at boot _is_ the value. No port to discover, no route added to an
  application, no token to protect, and it works for a CLI or an edge context with no HTTP surface. What
  genuinely moves at run time is a different question, for a different tool.

  Two defects found on the way and fixed here. `@stone-js/cli` rewrote plugin-contributed relative
  specifiers against `.stone/tmp`, where a production entry lives but a development entry does not, so
  any plugin contributing a module was silently unresolvable under `stone dev` — `@stone-js/i18n`'s
  catalogue injection included. And `@stone-js/openapi`'s CLI plugin shipped with no default export
  (multi-entry re-exports named exports only), so first-party auto-discovery never loaded it at all.

- 298cff2: Publish the arguments every dev tool reads, so an agent can actually pass them.

  No tool declared an `inputSchema`, so each one was advertised as taking no arguments and the MCP
  client dropped them before sending. Five handlers read arguments and all five received `{}`:
  `stone_search` answered `[]` for every query, making a fully populated knowledge base look empty,
  while `stone_concept` and `stone_config` always fell into their "list everything" branch and the
  report tools opened issues titled `Bug report` with an empty body. The handlers were right; the
  advertised contract was not, and the documentation described the arguments the code never published.

  `zod` is now a declared dependency rather than a transitive one, `inputSchema` is typed as a Zod
  shape instead of a loose record, and a tool without one is registered with no schema at all rather
  than an empty one.

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
