# Stone.js - MCP

[![npm license](https://img.shields.io/npm/l/@stone-js/mcp)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/mcp)](https://www.npmjs.com/package/@stone-js/mcp)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/mcp)](https://www.npmjs.com/package/@stone-js/mcp)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**MCP for Stone.js.** Your routes become tools an AI agent can call, through the chain that already
protects them.

**A tool is a route that said so.** Nothing is registered twice, nothing is described twice, and a
tool call is a real request: the rate limit, the authentication, the authorization and the
validation that guard the route are the ones that guard the tool.

---

## Installation

```bash
npm install @stone-js/mcp

# optional, to derive tool arguments from your validation schemas:
npm install @stone-js/openapi
```

> Peer dependencies: `@stone-js/core` and `@stone-js/http-core`. `@stone-js/openapi` is optional.

## Enable it

Declarative:

```ts
import { Mcp } from '@stone-js/mcp'
import { StoneApp } from '@stone-js/core'

@Mcp()
@Routing()
@StoneApp({ name: 'app' })
export class Application {}
```

Imperative, through `stone.mcp`:

```ts
import { defineConfig, defineStoneApp } from '@stone-js/core'
import { mcpBlueprint } from '@stone-js/mcp'

export const App = defineStoneApp({ name: 'app' }, [mcpBlueprint])

export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.mcp', {
  instructions: 'Tools for managing notes. Read before you write.',
  route: { auth: true }
}))
```

Enabling the module adds one route, `/mcp`, and changes nothing else. No route becomes a tool until
it says so.

## Declare a tool

The short form names it:

```ts
@Post('/notes', { mcp: 'create-note' })
create (event: IncomingHttpEvent) { … }
```

The long form states what the short form would have to derive:

```ts
@Post('/notes', {
  mcp: {
    name: 'create-note',
    description: 'Create a note for the signed-in user.',
    annotations: { destructiveHint: false }
  }
})
```

On the handler instead, the same shape as `@Validate` and `@Returns`:

```ts
class NotesController {
  @Tool({ name: 'create-note', description: 'Create a note for the signed-in user.' })
  @Post('/notes')
  create (event: IncomingHttpEvent) { … }
}
```

Both are read. The route wins when both are present, because with a router in play a route is the
single description of itself.

## What is derived, and from where

| Field | Stated on the declaration | Otherwise derived from |
|---|---|---|
| `name` | `mcp: 'create-note'` or `mcp.name` | the route's `name` |
| `description` | `mcp.description` | the route's `openapi` summary or description |
| `inputSchema` | `mcp.inputSchema` | the route's validation schema, converted; failing that, its path parameters |
| `outputSchema` | `mcp.outputSchema` | nothing. A shape nobody promised is not sent |

Every source is optional. An application with `openapi` and `validation` writes almost nothing. An
application with neither still gets working tools, built from what a route always has: a path, a
method, and its parameters. That degradation is the design, not a fallback.

A tool with no description is exposed and logged: an agent reading a bare name will guess, and it
guesses worst on the routes that write. Set `stone.mcp.requireDescription` to leave those out
instead.

## What happens on a call

```
tools/call  ->  a real request to the route  ->  rate limit -> auth -> authz -> validation -> handler
```

The caller's headers travel with it, so the bearer an agent was given is the bearer the route
authenticates. **An agent acts for someone, and that someone is the principal.** Nothing here
carries a permission model of its own: a second set of rules would be a second thing to keep in step
with the first.

A tool that fails answers a result with `isError`, not a protocol error. An agent reads it, explains
it and tries something else, which is what should happen when an authorization refuses.

## Protecting the endpoint

The endpoint is a route, so it is guarded like one:

```ts
blueprint.set('stone.mcp.route', {
  auth: true,
  rateLimit: { max: 60, window: 60, by: 'user' }
})
```

## Configuration

| Key | Meaning |
|---|---|
| `path` | Where the endpoint is served. Defaults to `/mcp`. |
| `name` / `version` | What the server calls itself during `initialize`. |
| `instructions` | Handed to the agent once, alongside the tool list. |
| `requireDescription` | Leave out a tool with no description. Defaults to `false`. |
| `route` | Anything to put on the endpoint's route: `auth`, `authz`, `rateLimit`, `middleware`. |
| `filter` | The last word on which tools are exposed, for what a declaration cannot know. |

## Why there is no stream

An MCP server over HTTP is one POST endpoint: the client posts JSON-RPC, the server answers JSON,
the connection closes. A stream is only needed for what a server sends unprompted, progress on a
long tool or a server-initiated sampling request, and an API exposing its own routes sends none of
them.

That is why this runs unchanged on a long-lived Node server, on a Lambda, or at the edge. There is
nothing to keep open, and no session to hold.

## Documentation

See the [official documentation](https://stonejs.dev/docs/extensions/mcp-server) for the full guide.

## License

[MIT](./LICENSE)
