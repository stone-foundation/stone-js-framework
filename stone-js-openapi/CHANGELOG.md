# @stone-js/openapi

## 0.8.9

### Patch Changes

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

- 7c2d459: feat(openapi): the contract derives itself from the router

  `OpenApiGenerator.addRouter(router)` reads the routing table and produces the document from it. A route already says what it is, so nothing has to be restated and nothing can drift:

  ```ts
  @Post('/users', { validation: CreateUserSchema, auth: true, openapi: { summary: 'Create a user' } })
  ```

  becomes a documented `POST /users` with its request body schema, its `security` requirement and its summary, without a second description of the endpoint anywhere.

  What each route contributes:

  | Route declares    | The document gets                                                                                                              |
  | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
  | `path`, `method`  | the path item and its operation                                                                                                |
  | `name`            | `operationId`                                                                                                                  |
  | `validation`      | `request.body` / `request.query` / `request.params`, resolved through `stone.validation.schemas` when the route named a schema |
  | `auth` or `authz` | a `security` requirement, `bearerAuth` by default, configurable with `stone.openapi.securityScheme`                            |
  | `openapi`         | anything declared explicitly, which wins, because an author who wrote it meant it                                              |
  | `openapi: false`  | nothing: an opt-out for endpoints that must not be published                                                                   |

  A named schema class is **built through the container**, so a class whose `rules()` needs i18n or any other service contributes its real schema. That holds both at request time, where the container is already up, and in the new console command below, where the whole application is booted first. Only when nothing can build a class is it skipped, and then deliberately: a wrong contract is worse than a missing one, since inventing a shape makes a client be written against something that does not exist.

  **No router means no contract.** `stone.openapi` now fails with a `TypeError` naming the fix rather than publishing an empty document, because an empty contract is a lie about the application. Set `stone.openapi.deriveFromRouter` to `false` (or `stone.openapi.document`) to publish a hand-written one instead.

  The generator stays free of any dependency on `@stone-js/router`: it duck-types the two methods it needs, exactly as the router carries module props without depending on the modules.

  ## And from the console, where the application is fully booted

  ```bash
  stone openapi                       # print the contract
  stone openapi export -o api.json    # write it, to commit or to feed a type generator
  ```

  The console adapter boots the whole application before a command runs, which makes this the most
  complete way to produce the document: every schema class is built with the services it asked for, and
  what you get is exactly what the running application serves. Registered the same way the router
  registers its own `router list` command, and only on the console platform.

- f363bef: feat(openapi): CLI plugin that generates TypeScript types from OpenAPI contracts

  - Adds a `StoneCliPlugin` at `@stone-js/openapi/cli` that reads an OpenAPI 3.x or Swagger 2.x document at build time and emits TypeScript type definitions into `.stone/tmp/`. The runtime entry stays free of Node-only code.
  - Accepts `source` (path or URL to an external document). When omitted, reads `.stone/tmp/openapi.json` — the convention for a document produced by an earlier build step.
  - Uses `openapi-typescript` v7 as the engine, following the pattern established by `@stone-js/i18n/cli`.
  - The generated module contributes to the built app via `addModule`, so the frontend can import types that never drift from the API contract.

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

- 89af646: feat(openapi): serve the contract and its explorer from one opt-in line

  Every application rewrote the same handler with the same two routes, although the library already shipped `swaggerUiHtml()` and `OpenApiGenerator.build()`. Only the wiring was missing.

  `@OpenApi()` or `openApiBlueprint`, the two ways any Stone.js module is enabled, now serve `/openapi.json` and `/docs`, both configurable under `stone.openapi` (paths, `info`, routes, a pre-built document, Swagger UI options), with `docsPath: false` to serve the machine-readable contract alone.

  ```ts
  @OpenApi({ info: { title: "Tasks", version: "1.0.0" } })
  @StoneApp({ name: "my-app" })
  export class Application {}

  // or, imperatively
  export const Application = defineStoneApp(handler, { name: "my-app" }, [
    openApiBlueprint,
  ]);
  ```

  **The advertised server URL comes from the request**, not from configuration: the same artefact runs behind a local port, a load balancer and an API Gateway stage, so a URL frozen at build time is wrong for at least two of them. Declaring `servers` overrides it.

  The package now declares `@stone-js/core` as a peer dependency, which it imports and previously did not declare.

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

## 0.8.7

## 0.8.6

## 0.8.5

## 0.8.4

## 0.8.3

## 0.8.2

## 0.8.1
