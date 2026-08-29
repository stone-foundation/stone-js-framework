# @stone-js/mcp

## 0.8.19

### Patch Changes

- 6b76c36: fix(mcp): read the option the ecosystem publishes, and derive the answer's shape

  **Two packages of the same version disagreed on a name.** `@stone-js/mcp` derived a tool's description from `route.getOption('openapi')`, while `@stone-js/openapi` publishes its contract under `contract` (its own `CONTRACT_OPTION`), renamed so a specification's name would not sit in the router's vocabulary. An application declaring `contract:` on two hundred routes therefore had every one of its tools exposed **without a description**, silently, because nothing here was looking at the right key. Reported by a pilot reading the code. Two tests encoded the old name, which is how it survived.

  **And the answer's shape is derived now, not only stated.** `outputSchema` used to come from `mcp.outputSchema` or nothing at all. It now falls back to the resource the route publishes, through `@Returns` or the route's own `resource`, read and converted by `@stone-js/openapi`: the same package that builds the document a human reads, so a tool and a contract describing the same answer cannot describe it differently. A resource named rather than pointed at is resolved through `stone.resources.registry`, the registry the runtime projects through, so a tool describes the shape a caller actually gets.

  Three limits, on purpose:

  - **Only an object schema is published.** MCP carries structured output as an object, and a resource answering a bare array is a real thing; wrapping it would invent a shape the application never declared. That route gets no `outputSchema`, which stays the honest answer.
  - **The declaration still wins.** `mcp.outputSchema` overrides the derivation, as it does for every other field.
  - **`@stone-js/openapi` remains optional.** Without it the derivation does not happen, a debug line says so, and the tool works.

- Updated dependencies [6b76c36]
- Updated dependencies [cb52a51]
- Updated dependencies [865579c]
  - @stone-js/core@0.8.19
  - @stone-js/http-core@0.8.19
  - @stone-js/openapi@0.8.19
  - @stone-js/config@0.8.19

## 0.8.18

### Patch Changes

- Updated dependencies [9ba6f7b]
  - @stone-js/http-core@0.8.18
  - @stone-js/core@0.8.18
  - @stone-js/config@0.8.18
  - @stone-js/openapi@0.8.18

## 0.8.17

### Patch Changes

- 07b3cc9: fix: the security audit follows the lockfiles, and a few smells go with it

  A vulnerable transitive `uuid` sat in the monorepo starter, seen by Dependabot and by nothing else. Two separate holes let it, and both are measured rather than assumed.

  **The audit only looked at the root.** A starter with its own lockfile resolves independently: the root's `pnpm.overrides` never reached it, so the `uuid@<11.1.1` pin that protects every other package did nothing there. The audit now follows the **lockfiles** rather than the workspace, through `scripts/audit-lockfiles.mjs`, and CI runs the same script as `pnpm run audit:ci` so the two cannot drift. Verified by pointing it at the vulnerable lockfile: it fails and names the path, `apps__mobile>expo>@expo/config-plugins>xcode>uuid`.

  **The threshold was above the advisory.** `pnpm audit` classifies this one `moderate`, so a gate at `high` would never have stopped it, wherever it ran. Measured before changing it: the repository is clean at `low`, so `moderate` costs nothing today and catches the class that got through.

  Nothing local ran the audit either, so there is now a `pre-push` hook for it alone, seconds against the registry, and a `pnpm run verify` that bundles the whole pre-push gauntlet for when you want all of it.

  Also, twelve reported smells, each a real one. Four object literals used as default parameters, rebuilt on every call and now named values. `String(value)` on an `unknown` in two places, where an object would have landed as `[object Object]` in a message somebody reads or in a URL that matches no route: both now leave the placeholder, visibly unfinished. A nested template literal, a nested ternary, two verbose character classes, and an import that existed only to be re-exported.

- 77ac39f: feat: your routes as tools an AI agent can call

  `@stone-js/mcp` exposes an application's existing routes over the Model Context Protocol. **A tool is a route that said so:**

  ```ts
  @Post('/notes', { mcp: 'create-note' })
  create (event: IncomingHttpEvent) { }
  ```

  Nothing is registered twice and nothing is described twice. `tools/list` is derived from the router, and a `tools/call` is dispatched **back into the router**, so the rate limit, the authentication, the authorization and the validation that guard the route are the ones that guard the tool. That is the whole permission model, and it is deliberately not a model: a module that called the handler directly would turn every annotated route into a way around its own guard, and nothing would report it. The caller's headers travel with the call, so the bearer an agent was given is the bearer the route authenticates. An agent acts for someone, and that someone is the principal.

  **It is one POST route.** No socket, no event stream, no session: the client posts JSON-RPC, the server answers JSON, the connection closes. A stream is only needed for what a server sends unprompted, and an API exposing its own routes sends none of it. So this runs unchanged on a long-lived Node server, on a Lambda, or at the edge.

  Everything a tool needs is derived from what the application already declared, and every source is optional. The name falls back to the route's name, the description to its `openapi` summary, the input schema to its validation schema converted through `@stone-js/openapi` (an optional peer), and failing that to the route's own path parameters. An application with the full stack writes almost nothing; one with none of it still gets working tools. A tool with no description is exposed **and logged**, because an agent reading a bare name will guess, and it guesses worst on the routes that write; `stone.mcp.requireDescription` leaves those out instead.

  Declared on the route, or on the handler with `@Tool`, the same shape as `@Validate` and `@Returns`. Activated by `@Mcp()` or by `mcpBlueprint`, never a third helper. The endpoint is a route, so it is protected like one, through `stone.mcp.route`.

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17
  - @stone-js/http-core@0.8.17
  - @stone-js/openapi@0.8.17
  - @stone-js/config@0.8.17
