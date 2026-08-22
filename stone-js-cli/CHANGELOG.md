# Changelog

## 0.8.15

### Patch Changes

- @stone-js/core@0.8.15
- @stone-js/pipeline@0.8.15
- @stone-js/config@0.8.15
- @stone-js/filesystem@0.8.15
- @stone-js/router@0.8.15
- @stone-js/node-cli-adapter@0.8.15

## 0.8.14

### Patch Changes

- 311d395: fix(cli): the scaffolder offers what the framework ships, and puts a test runner where it belongs

  **Fifteen published packages were invisible to `npx @stone-js/create`.** A whole wave of modules
  shipped and the questionnaire never learned about them: validation, resources, openapi, auth, authz,
  i18n, store, cache, queue, event-bus, realtime, cloud-file, telemetry, and both mobile packages. A
  list that only grows by hand stops matching what exists, and the only sign was that nobody could pick
  them.

  They are grouped now, so the list reads by what a module is for rather than by when it was added:
  frontend, mobile, domain and API, infrastructure, then the runtimes. `@stone-js/testing` and
  `@stone-js/mcp-dev` are deliberately absent, being development tools rather than parts of an
  application.

  **And the test runner was being installed as a runtime dependency.** `npm install vitest
@vitest/coverage-v8`, with no `--save-dev`, so a deployed application shipped its test runner, and a
  starter that already declared Vitest in `devDependencies` had it moved into `dependencies` by the
  scaffold. Runtime modules and test tooling are installed separately now, the second with the flag
  each package manager spells its own way.

  One thing that did not change, and is now covered: a runner named in the configuration rather than
  chosen at the prompt is still installed, and only Vitest brings a coverage provider along.

- Updated dependencies [ed1bdb8]
- Updated dependencies [a67a77b]
  - @stone-js/router@0.8.14
  - @stone-js/node-cli-adapter@0.8.14
  - @stone-js/core@0.8.14
  - @stone-js/filesystem@0.8.14
  - @stone-js/pipeline@0.8.14
  - @stone-js/config@0.8.14

## 0.8.13

### Patch Changes

- @stone-js/core@0.8.13
- @stone-js/pipeline@0.8.13
- @stone-js/config@0.8.13
- @stone-js/filesystem@0.8.13
- @stone-js/router@0.8.13
- @stone-js/node-cli-adapter@0.8.13

## 0.8.12

### Patch Changes

- 03bf130: fix: a documented endpoint keeps its payload, and a translated app answers in the caller's language

  Found by reading a deployed contract and by building a bundle, not by reading code.

  - **The response of a documented endpoint was empty.** Writing `200: { description: '…' }` in a route's `contract` replaced the derived success response instead of describing it, so every endpoint whose author had documented it carefully lost its schema: 27 of 29 in a live API. Statuses merge per status and per field now; a _different_ success status still replaces the derived one, because an operation answering both `200` and `204` describes an endpoint that cannot exist.
  - **A request schema that normalises before it judges took the whole document down.** Requests are described as `input` and responses as `output`: a transform has no output shape, and asking for one threw out of the entire generation, so the contract endpoint answered 500 because one body trimmed a string. A schema that still cannot be described is now left out alone, and reported.
  - `$schema` no longer leaks into a document that declares OpenAPI 3.0, and an unnamed route no longer publishes `operationId: ""`.
  - **Translations discovered at build time now say which locales exist.** Content negotiation is skipped entirely when `stone.i18n.locales` is empty, so a caller asking for French got the fallback language, and under lazy loading (the default) that is how an application answers raw keys: only the resolved locale is fetched, and the resolved locale was never the caller's. The generated module declares the locales the scan found, so `Accept-Language` works with no configuration at all.
  - **`stone test` runs the framework inside the runner's module graph.** Discovery imports your modules at run time, and an installed package doing that sits outside the transform, so `import('app/Handler.ts')` reached Node directly and died on `Unknown file extension ".ts"`.
  - The three discovery middlewares are gone: `@ApiResource`, `@ValidationSchema` and `@Policy` carry their own registration, so nothing needs to read the metadata back out.
  - `ResourceContext<EventType, PrincipalType>` takes the event and the principal, `unknown` by default.

- 4c50bc6: fix(cli): `stone test` could not discover modules in an installed project

  `npm test` failed in every scaffolded project, on the first run, with an error about the
  application's own entry file:

  ```
  Unknown file extension ".tsx" for /path/to/app/Application.tsx
  ```

  `createTestApp()` discovers an application's modules by importing them at run time, which is what
  lets a test boot the same files the build builds instead of a list that drifts. Vitest externalises
  anything resolved from `node_modules`, and an externalised module's `import()` is Node's own, which
  cannot load a `.ts` or `.tsx` file. So the discovery could not import the very files it found.

  `stone test` now inlines `@stone-js/testing` in the runner config it generates, which puts those
  imports back through Vite's transform.

  **Why it shipped, which is the part worth keeping.** Inside this repository `@stone-js/testing` is a
  workspace link, and Vitest inlines linked packages by default. Every lab application and every
  framework suite therefore passed, on every CI run, while every project installing from the registry
  hit it on its first `npm test`. A monorepo cannot see this class of bug from the inside; it was found
  by installing a published starter from the registry and running its tests, which is now worth doing
  deliberately.

- Updated dependencies [c971168]
  - @stone-js/core@0.8.12
  - @stone-js/filesystem@0.8.12
  - @stone-js/node-cli-adapter@0.8.12
  - @stone-js/router@0.8.12
  - @stone-js/pipeline@0.8.12
  - @stone-js/config@0.8.12

## 0.8.11

### Patch Changes

- b2ff332: feat(use-react-native): a native application stops listing its modules

  A web application never lists its pages: the build collects them. A native one had to, and that
  was the last place the mobile story asked for something the other platforms do not. The reason was
  never conceptual, it was the bundler: collection is a bundler question, the web build asks Vite for
  `import.meta.glob`, and Metro has no such thing and would not understand one.

  So the question is answered before any bundler runs. `withStone` wraps a Metro configuration,
  collects everything under `app/` and writes `.stone/modules.ts`: real static imports, which is what
  Metro needs to see, extensionless so per-platform files (`HomePage.ios.tsx`) still win as they
  would for hand-written code, and sorted so the file is byte-identical between two runs on the same
  tree. Only rewritten when it changed, because Metro watches what it bundles and an identical
  rewrite would ask it to reload for nothing.

  ```js
  // metro.config.js
  const { getDefaultConfig } = require("expo/metro-config");
  const { withStone } = require("@stone-js/use-react-native/metro");

  module.exports = withStone(getDefaultConfig(__dirname), __dirname);
  ```

  ```ts
  import { modules } from "./.stone/modules";

  stoneApp({ modules }).run();
  ```

  **It hooks into `metro.config.js` on purpose.** Metro loads that file whatever brought it up, so
  `expo start`, `expo run:ios` and an EAS build all get the generation without anyone remembering to
  ask. A command could not make that claim. It runs at Metro start rather than continuously, so
  adding a page to a running dev server means restarting it; editing one needs nothing.

  **And the CLI gains a `native` target**, auto-discovered from this package, so there is one
  vocabulary across platforms: `stone dev native` and `stone build native` collect the modules and
  hand the rest to `expo start` and `expo export`. Deliberately thin: Expo and Metro own native
  bundling, and producing an installable application stays `expo run:ios` or an EAS build, which need
  a native toolchain and are better commands than a wrapper would be. It is also the first target
  registered by a module rather than by the CLI, which is what the registered-targets work was for.

  **One CLI change, and it removes the last hardcoded path from a command.** A `self-hosted` target
  now declares what `stone serve` should launch, through `devEntry`, exactly as it already declared
  where `stone preview` starts from. The React target names its generated Vite server; the native
  one names nothing, because Expo's own process is the dev server and there is nothing left to
  supervise. `stone serve` no longer knows any target's file layout.

- b568e53: refactor(use-react): the React renderer now carries its own build

  The CLI knew how to build a React application. It shipped Vite, `@vitejs/plugin-react`,
  `vite-plugin-babel` and `browserslist` to prove it, and a project that renders nothing on a screen
  installed all four. That was backwards: the tool that runs commands does not get to know what a
  view is, and the one qualified to answer how React views become an application is the React
  renderer.

  So the answer moved to where it belongs. `@stone-js/use-react` now owns the React build end to end
  (CSR, SSR, SSG, the dev server, the preview server, the console build and the SSG prerender) and
  declares it as a CLI plugin, auto-discovered from `stone.cliPlugin`. Installing the renderer is
  still all a React project does; the CLI simply no longer pretends to know why.

  **The CLI keeps one target, `server`, and its dependency on the renderer is gone.** It was a real
  dependency, in a package a backend-only project installs, and removing it also removed the last
  cycle in the workspace: `@stone-js/cli` and `@stone-js/use-react` used to depend on each other, so
  the order they built in was whatever pnpm decided that day. The renderer builds after the CLI now,
  which is the only order that ever made sense.

  **Nothing changes for an application.** `stone dev`, `stone build`, `stone preview`, `stone serve`
  and `stone build react` behave as before, because the target is registered the same way the native
  one is: a config-phase middleware, additive, so a project that declared its own targets keeps them.
  This was verified rather than assumed. The three rendering modes were built from the same sources
  before and after the move, in both the declarative and the imperative style, and produced the same
  set of output files, with the SSG prerender still carrying its rendered markup. The one difference
  in the bundles is that a blueprint an application does not reach is now tree-shaken out of it.

  **Only a project importing the CLI's React internals has anything to do**, and only if it reached
  past the public commands: `ReactBuilder`, the build middleware, `viteConfig`, the entry-point
  templates and the SSG helpers are now imported from `@stone-js/use-react/cli` instead of
  `@stone-js/cli`. The CLI's own helpers they build on (`isCSR`, `isSSR`, `isSSG`, `isTypescriptApp`,
  `generatePublicEnvironmentsFile`, `getStoneBuilderConfig` and the rest) stay where they are.

  **One behaviour did change, and for the better: the SSG prerender now runs its SSR server on the
  Node that is building.** It spawned `node`, a bare command name resolved through `PATH`, which
  decides neither that the interpreter is the one that just produced the bundle nor that the directory
  it came from is trustworthy. `process.execPath` answers both. The two SSG lab applications still
  pre-render their routes with their markup intact, which is how a wrong interpreter would have shown
  itself.

  This is the same move the native target already made, applied to the platform that came first. A
  module owns its build, the CLI owns none of them, and adding a renderer to the ecosystem no longer
  means editing the CLI.

- Updated dependencies [13cebd1]
  - @stone-js/core@0.8.11
  - @stone-js/filesystem@0.8.11
  - @stone-js/node-cli-adapter@0.8.11
  - @stone-js/router@0.8.11
  - @stone-js/pipeline@0.8.11
  - @stone-js/config@0.8.11

## 0.8.10

### Patch Changes

- f493bc1: refactor(cli)!: build targets are registered, not hard-coded

  The CLI knew its two targets by name. Six commands asked `isReactApp()` and then instantiated
  `ReactBuilder` or `ServerBuilder` themselves, which meant a module could not own its own build:
  adding a target required changing the CLI.

  A target is now a declaration under `stone.builder.builders.<name>`:

  ```ts
  {
    target: 'acme',
    priority: 20,
    match: (blueprint, event) => true,     // detection only
    resolver: (context) => new AcmeBuilder(context),
    devMode: 'self-hosted',
    previewEntry: (blueprint) => 'dist/acme.mjs'
  }
  ```

  The commands resolve whichever target answers and drive it. Every step (`build`, `dev`,
  `preview`, `console`, `export`, `watchFiles`) is optional, and a command says which step a
  target does not support instead of failing on an undefined call.

  **`react` and `server` are registered through that same key.** If the first-party targets kept a
  private path, the public one would not be worth much, and both are destined to move out: React
  into `@stone-js/use-react`, the backend build into whichever package owns service builds. When
  they do, nothing here is replaced, only removed.

  Two things the commands used to know about targets became things a target declares, so
  `stone serve` and `stone preview` no longer branch on a name:

  - `devMode`: `supervised` (the CLI watches, rebuilds and restarts) or `self-hosted` (the
    builder's own dev server reloads itself, and the CLI follows its exit code). Vite and Expo are
    self-hosted; a backend build is not.
  - `previewEntry`: where `stone preview` starts the built application from.

  **Behaviour is unchanged for existing projects.** Precedence is the one the CLI already used:
  `--target` wins, then `stone.builder.target`, then detection, with the backend target answering
  last. Two things are more forgiving than before: an empty target (an empty positional from
  yargs, an empty string in a config) now means "nothing was named" instead of naming a target
  that cannot exist, and `--target` accepts any registered name rather than a closed list of two,
  with an unknown one rejected by an error that lists the real ones.

  `BuilderConfig.target` widens from `'react' | 'service'` to `string` for the same reason: a
  closed union could not name a target the CLI does not ship.

- 8760d1c: fix: a build that fails says so, and a shutdown that starts finishes

  Four silent failures, all of the same shape: something reported success, or reported nothing, while the process was in a state nobody asked for.

  - `stone build --ssg` wrote whatever a page answered, including an error body, and exited `0`. A pre-render is an HTTP request, so a page that throws answers 500, and that HTML was published as the page. The build now stops, names every page it could not render and what it answered, and writes nothing at all.
  - A failed CLI command resolved exit `1` and then hung forever: build tooling leaves handles behind, which is why a successful build already exits deliberately. The failing path now does the same, so CI sees the failure instead of a timeout.
  - SSG left its pre-render server behind when the app shut down gracefully, and the open pipes kept the CLI alive. It now waits for the child to go, and forces it when it does not.
  - `@stone-js/node-http-adapter` closed the server on `SIGINT`/`SIGTERM` and waited for every socket, so an idle keep-alive connection held the process open forever and an orchestrator had to hard-kill a container that promised to leave. Idle connections are closed at once, requests in flight get `shutdownGracePeriod` (10s by default), and the process exits either way.
  - `@stone-js/node-ws-adapter` could not stop while anyone was connected, which is a realtime server's normal state. Clients are now asked to leave with `1001 Going away` and dropped after the grace period.

- Updated dependencies [18644c8]
- Updated dependencies [9f074f8]
- Updated dependencies [318cbf5]
  - @stone-js/router@0.8.10
  - @stone-js/use-react@0.8.10
  - @stone-js/core@0.8.10
  - @stone-js/filesystem@0.8.10
  - @stone-js/node-cli-adapter@0.8.10
  - @stone-js/pipeline@0.8.10
  - @stone-js/config@0.8.10

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
