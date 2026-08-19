# Changelog

## 0.8.9

### Patch Changes

- d47b2ee: Report a cancelled scaffold as the decision it is, not as a crash.

  Answering `no` to the final confirmation of `npm create @stone-js` ended the run with `✖`, an
  `npm error` wall and a debug-log path, for doing exactly what the prompt offered. Cancellation now
  travels as its own `CancellationError`, which the console error handler prints as one neutral line
  and turns into exit `0`. Genuine failures keep exiting non-zero, which is the defect the previous
  change fixed and this one had to preserve.

  Interrupting a prompt with Ctrl-C is covered by the same path. It was worse than a noisy exit:
  `prompts` resolves with nothing rather than ending the process, so the questionnaire carried on
  asking and would scaffold from answers nobody gave. An abandoned prompt now stops the run, while an
  empty answer stays a real answer.

- 995f2c7: The build manifest is configured with `defineBuilderConfig`.

  `@stone-js/cli` exported `defineConfig`, and so does `@stone-js/core` — one shapes the build, the
  other configures the application. The clash read fine in a document and badly in an editor: both
  packages sit in the same project, so an auto-import could pick the build one inside `app/`, where the
  application would simply never read what it returned. A silent misconfiguration is a poor price for a
  shared word.

  The name now matches what it writes: `stone.builder.*`, typed `BuilderConfig`. Rename the import in
  `stone.config.mjs` and nothing else changes.

  ```js
  import { defineBuilderConfig } from "@stone-js/cli";

  export default defineBuilderConfig({ rendering: "ssg" });
  ```

- e149263: fix: `.mcp.json` launches the CLI through `npx`, and vendor cycles stop flooding the build

  - **`@stone-js/mcp-dev`**: `stone mcp --init` wrote `{ "command": "stone", "args": ["mcp"] }`. Since `@stone-js/cli` is a project dev dependency, the bare `stone` only resolves with a global install, so the server an agent spawned failed with ENOENT on a normal project. The entry now goes through `npx`, which finds the project-local binary first and a global one otherwise.
  - **`@stone-js/cli`**: circular-dependency warnings coming from `node_modules` are now filtered on every build path, not just one. A React app bundles its dependencies into the SSR build (`ssr.noExternal`), so reaching the MCP SDK printed around twenty warnings from `zod` and `zod-to-json-schema` on an otherwise successful build, which reads as a failure. Cycles in your own code still warn, because those are actionable.
  - **`@stone-js/config-source`**: the optional `js-yaml` peer floor moves to `^4.3.1`, the patched line for the quadratic-CPU advisory.

- 5e01789: fix(i18n): the zero-config path actually works, and `@I18n()` enables it in one line

  Verified end to end on a real app (`@I18n()` + `app/i18n/<locale>/translation.json`, nothing else): the catalogs are discovered, the locale is resolved from the request, and translations render. Three defects stood between the module and that promise, each of which alone made every translation return its key, which reads exactly like a missing catalogue.

  - **The CLI plugin was never discovered.** Auto-discovery reads the default export of the bundle named by `stone.cliPlugin`, and `multi-entry` re-exports named exports only, so the plugin's `export default` silently vanished from `dist/cli.js`. The shared build gained a `multiEntry` opt-out, which the CLI-plugin build now uses.
  - **The generated module configured nothing.** It emitted `defineConfig(defineI18n({...}))`, but `defineI18n` returns an unwrapped `{ i18n }` fragment while `defineConfig` expects a function or an object carrying `configure`, so `configure` resolved to a no-op. It now emits a plain `stone`-wrapped blueprint, which the module scan applies directly. The README and docs page taught the same broken pattern and are corrected.
  - **Lazy catalogs broke the server build.** Lazy loaders are dynamic imports, and a server artefact is a single file, so Rollup failed with "when building multiple chunks, the output.dir option must be used". Server outputs now set `inlineDynamicImports`, which fixes any dynamic import in an app, not only i18n.

  **New `@I18n()` decorator**, matching every other module (`@Cache`, `@Realtime`, `@Queue`). The service class is renamed `I18nManager` to free the bare name, exactly as `CacheManager` and `RealtimeManager` do: update `I18n` to `I18nManager` where you import the service (the container aliases `i18n` / `I18n` are unchanged, so `constructor ({ i18n })` keeps working).

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

- 5e01789: fix(deps): clear the nanoid advisory reached through vite and postcss

  `pnpm audit --audit-level=high` failed on `nanoid <3.3.18` (custom generators can loop indefinitely when size is zero), reached through `vite > postcss > nanoid`. Pinned with a caret inside its major line, as every override in this repository must be: an open-ended `>=` lets pnpm jump major and has twice installed something worse than what it was fixing.

- 97a6730: Clear the quality findings this cycle's work raised.

  Two are worth naming because they were real, not stylistic. An authorization failure built its message
  with `String(subject)`, so refusing a class or an instance said `Not allowed to read [object Object]`
  — an error that names nothing. And two regular expressions could be made super-linear by their own
  input: a trailing-slash strip in the test-module scan, and the declaration-rewriting pattern in the
  shared build, both rewritten so no input can force them to backtrack.

  The rest is shape: the SSG segment parser split into three named readers instead of one function
  holding every case, a nested ternary unfolded in the OpenAPI plugin, a duplicated directory walk
  shared in the build config, an escaped pattern read as `String.raw`, and a rejection path turned into
  a single exit so the error is raised where its message lives.

  `CORSHeadersMiddleware` and `MetaCORSHeadersMiddleware` are **removed**. They were deprecated with a
  documented replacement (`@Cors()` or `corsBlueprint`, the two ways a module is enabled), nothing in
  the framework used them, and a deprecated third activation path is worth deleting rather than keeping
  around to trip over.

- 0629318: Point every README link at somewhere that exists.

  The per-module repositories were retired when the framework moved to a single one, so 36 links
  across 18 READMEs answered with a 404: the exact links a newcomer clicks first, "Contributing"
  and "API". The contributing guide now points at the monorepo, and the API reference at the
  published one.

  `docs/` was never a durable target either, retired repository or not: it is TypeDoc output, and
  every build begins by deleting it.

- d458bc8: fix(cli): stop warning about optional peers the project did not install

  Every consumer build printed `"js-yaml" is imported by "@stone-js/config-source" but could not be resolved - treating it as an external dependency`, even with no YAML source in sight. The import is already lazy; Rollup simply sees a specifier it cannot resolve.

  Nine packages ship optional peers (`js-yaml`, `ioredis`, `ws`, the AWS/GCP/Azure SDKs...), each imported behind the branch that needs it so an app pays only for what it uses, so the same noise appeared for cache, queue, realtime, cloud-file, event-bus and the WebSocket adapters. The builder now treats an optional peer as external exactly when the project has not installed it, which is what the warning suggested anyway. An installed optional peer keeps its normal resolution.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- e22c9d5: Expand dynamic segments at SSG time from declared values (`ssg.params`).

  SSG discovery skipped any parameterized path, which one common pattern turned into a total loss: a
  parameterized router prefix. A localized site setting `stone.router.prefix` to `/:lang?` puts a
  dynamic segment on _every_ route, so every route was skipped and auto-discovery went from all pages
  to none, leaving the developer to hand-write the whole `pages × locales` grid the framework already
  knew.

  `ssg.params` gives a segment its values and the path expands instead:

  ```js
  ssg: {
    params: {
      lang: ["en", "fr"];
    }
  } // /:lang?/about -> /about, /en/about, /fr/about
  ```

  An optional segment also yields the path without it, canonical form first, which reproduces the
  bare-path-plus-prefixed-twins grid from a single declaration. Several segments expand as a cartesian
  product, a repeated segment stays consistent with itself, and a declared value that contradicts its
  own segment constraint fails the build rather than pre-rendering a path the router can never match.

  Paths that still cannot be expanded behave exactly as before, but are now reported once with the
  segments they would need, so a site can no longer pre-render a fraction of itself in silence.
  `ssg.routes` is unchanged and still additive.

- 2ed390b: `stone test`: run the suite from the same config file as everything else.

  Tests are a context like any other, so they are configured where every other context is. A project
  declares its test run in `stone.config.mjs` under `test` — `include`, `envFile`, `pattern`, and a raw
  `vitest` escape hatch merged over the defaults, exactly as `vite` and `rollup` are — instead of
  keeping a second config file in sync with the first.

  Two things this does that a bare runner cannot. It loads `.env.test` **before** the runner starts, so
  a value read at module load (a `@Configuration` calling `getString`) actually sees it; loading the
  same file from inside a test is too late, the imports have already run. And it hands the test process
  the file set the build uses, so `createTestApp()` discovers exactly what ships.

  Vitest is imported lazily from the project rather than bundled: an application pins its own runner
  version, and one that does not test carries none. A project without it gets a line telling it what to
  install, not a module-resolution error.

  `stone test` answers to `-t`, the letter going to the command a developer types all day.
  **`stone typings` moves from `-t` to `-ty`**; its full name is unchanged, and nothing in the starters
  or the docs used the short form.

- 2ed390b: `stone test` spawns the runner, and pins the decorator semantics the framework runs on.

  Verified against a real application rather than a mock, which surfaced two defects in the first
  design. Importing Vitest's Node API joined two module graphs: this package is bundled, so a runner it
  does not depend on was bundled with it and broke with `esbuildVersion is not defined` — nothing to do
  with the project's tests, and reported as "Vitest is not installed", which was false. The runner is
  now a child process, resolved from the project: it owns its exit code and its watch loop, and a
  missing binary is diagnosed by looking for it rather than by catching an import.

  The generated config lands in `.stone/vitest.config.mjs`, readable when a run surprises you, and it
  pins TC39 stage-3 decorators for the transform. A project's `tsconfig.json` keeps
  `experimentalDecorators: true`, which is what TypeScript's checker wants and what the build overrides
  with Babel `version: '2023-11'` afterwards. A test runner transpiles instead of building, so without
  this it emitted the legacy form and every decorated class failed to boot. Class fields are pinned to
  the same spec semantics the build uses.

  `@stone-js/testing` also stops crashing when an application produces no response: attaching the body
  readers to a non-object threw inside the harness and buried the real reason.

- 46572b2: Fail the build when a .tsx file carries app-level decorators (@StoneApp, @Browser, @UseReact, @Configuration, @Provider) and lazy views are on. The check runs in GenerateClientFileMiddleware and throws a CliError that names the file and explains the fix.
- Updated dependencies [617bfc6]
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
- Updated dependencies [2ed390b]
  - @stone-js/node-cli-adapter@0.8.9
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9
  - @stone-js/filesystem@0.8.9
  - @stone-js/pipeline@0.8.9
  - @stone-js/router@0.8.9
  - @stone-js/use-react@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8
- @stone-js/pipeline@0.8.8
- @stone-js/config@0.8.8
- @stone-js/filesystem@0.8.8
- @stone-js/router@0.8.8
- @stone-js/node-cli-adapter@0.8.8
- @stone-js/use-react@0.8.8

## 0.8.7

### Patch Changes

- 1ffedac: fix(cli): scaffold an exact starter with `--starter <id>`

  Every published starter command was broken: `--starters` takes provider _links_, so passing a starter id (`--starters basic-react-declarative`) asked npm for a package that does not exist and failed with a 404.

  - New `--starter <id>` flag: scaffolds that starter and skips the starter question. `--starters <links>` keeps its meaning (packages that declare starters).
  - The questionnaire answers are now merged into the blueprint instead of replacing it, so `--starters` links are no longer erased mid-run. Combining a link with an id (`--starters @stone-js/blog-starters --starter realtime-chat`) previously scaffolded an unrelated starter without warning.
  - An explicitly requested starter that matches nothing now fails and lists the available ids, instead of silently scaffolding the first one available.
  - A link that cannot be installed explains that `--starters` expects a package or git link, and points to `--starter` when the value looks like an id.
  - `stone init` no longer swallows failures: it exits non-zero, so scripts and CI can detect a broken scaffold.
  - The banner now shows the framework version on every command (it fell back to an empty slot, since nothing sets `stone.builder.version` and `init` has no project to read one from).
  - @stone-js/core@0.8.7
  - @stone-js/pipeline@0.8.7
  - @stone-js/config@0.8.7
  - @stone-js/filesystem@0.8.7
  - @stone-js/router@0.8.7
  - @stone-js/node-cli-adapter@0.8.7
  - @stone-js/use-react@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/pipeline@0.8.6
- @stone-js/config@0.8.6
- @stone-js/filesystem@0.8.6
- @stone-js/router@0.8.6
- @stone-js/node-cli-adapter@0.8.6
- @stone-js/use-react@0.8.6

## 0.8.5

### Patch Changes

- 64518fa: Remove deprecated build-tooling dependencies from scaffolded apps. `@rollup/plugin-multi-entry`
  (which pulled `matched` → `glob@7` → `inflight`, the memory-leaking, deprecated chain) is replaced
  at runtime by a tiny built-in virtual-entry plugin and kept only as a dev dependency for building
  the CLI itself; and the CLI's `glob` dependency is bumped to v11. A fresh `stone` app therefore
  installs with no `inflight` / `glob@7` / deprecated `glob@10` warnings. Since glob v11 requires it,
  the CLI now needs Node >= 20.11 (Node 18 is end-of-life).

  The built-in bundler also fixes Rollup's "Conflicting namespaces … will be ignored" warning: it
  re-exports each app file's members under a unique per-file alias, so two files exporting the same
  name (e.g. every i18n bundle exporting `common`, or two handlers exporting `routes`) no longer
  collide, and none is silently dropped from the module graph. Glob negation in the build input
  (e.g. `!app/i18n/**`) is supported too.

  - @stone-js/core@0.8.5
  - @stone-js/pipeline@0.8.5
  - @stone-js/config@0.8.5
  - @stone-js/filesystem@0.8.5
  - @stone-js/router@0.8.5
  - @stone-js/node-cli-adapter@0.8.5
  - @stone-js/use-react@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/pipeline@0.8.4
- @stone-js/config@0.8.4
- @stone-js/filesystem@0.8.4
- @stone-js/router@0.8.4
- @stone-js/node-cli-adapter@0.8.4
- @stone-js/use-react@0.8.4

## 0.8.3

### Patch Changes

- 2e561e8: Improve the `stone init` create-app experience.

  - Signature everywhere: the « Le Portail » banner (logo + wordmark + version) now prints on every
    command, not just `build`/`serve`, via a single lifecycle hook (the duplicated per-command
    banners are gone, so it shows exactly once).
  - Starters from the collection: `stone init` lists the individual starters declared in the fetched
    package's `stone.starters` manifest (title, description, tags), instead of treating the whole
    repository as one template. The default source is now the lightweight `@stone-js/starters` npm
    package (published alongside the framework and version-locked to it), so `stone init` no longer
    clones the whole monorepo. The selector stays fully agnostic: `--starters` still accepts any
    local path, npm package or git/github link.
  - Fix module integration: selected Stone modules were installed by the package manager and then
    silently dropped, because the finalize step rewrote the pre-install copy of `package.json`. The
    freshly-installed manifest is now re-read, so the chosen modules land correctly in the new app.
  - A wider module picker: the full adapter range (Node HTTP/CLI/WS, AWS, Azure, GCP, Tencent,
    Alibaba, edge, fetch, browser) plus React and the view engine.
  - @stone-js/core@0.8.3
  - @stone-js/pipeline@0.8.3
  - @stone-js/config@0.8.3
  - @stone-js/filesystem@0.8.3
  - @stone-js/router@0.8.3
  - @stone-js/node-cli-adapter@0.8.3
  - @stone-js/use-react@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/filesystem@0.8.2
  - @stone-js/node-cli-adapter@0.8.2
  - @stone-js/router@0.8.2
  - @stone-js/use-react@0.8.2
  - @stone-js/pipeline@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/filesystem@0.8.1
  - @stone-js/node-cli-adapter@0.8.1
  - @stone-js/router@0.8.1
  - @stone-js/use-react@0.8.1
  - @stone-js/pipeline@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js CLI" extension will be documented in this file.

## Unreleased

## [0.1.3](https://github.com/stone-foundation/stone-js-cli/compare/v0.1.2...v0.1.3) (2026-06-13)

### Miscellaneous Chores

- update Stone core dep ([d19c1f4](https://github.com/stone-foundation/stone-js-cli/commit/d19c1f42a26148dc0bf8fe3b17c8569609f4bbd2))
- update Stone core dep ([#28](https://github.com/stone-foundation/stone-js-cli/issues/28)) ([8a58296](https://github.com/stone-foundation/stone-js-cli/commit/8a5829609e8e686014bc905f99674e7c04274ce7))

## [0.1.2](https://github.com/stone-foundation/stone-js-cli/compare/v0.1.1...v0.1.2) (2025-06-28)

### Bug Fixes

- change domain name to stonejs.dev ([#11](https://github.com/stone-foundation/stone-js-cli/issues/11)) ([dce0000](https://github.com/stone-foundation/stone-js-cli/commit/dce0000152d9346b004b0468edd8a21311cdd813))

## [0.1.1](https://github.com/stone-foundation/stone-js-cli/compare/v0.1.0...v0.1.1) (2025-06-16)

### Bug Fixes

- skip vite virtual module on removing unused modules ([#8](https://github.com/stone-foundation/stone-js-cli/issues/8)) ([bb2fb9a](https://github.com/stone-foundation/stone-js-cli/commit/bb2fb9aa1087ec500c9fde28ff57110c8ed48467))

## 0.1.0 (2025-06-14)

### Features

- initial commit with CLI integration to build any Stone.js app ([d883217](https://github.com/stone-foundation/stone-js-cli/commit/d883217a34566f4a9acb464aed221a159a6d7dc1))
