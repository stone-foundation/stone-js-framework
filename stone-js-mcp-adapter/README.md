# Stone.js · MCP adapter (agents)

[![npm](https://img.shields.io/npm/v/@stone-js/mcp-adapter)](https://www.npmjs.com/package/@stone-js/mcp-adapter)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Model Context Protocol (MCP) adapter for Stone.js. Expose your domain to AI agents as MCP tools — the MCP equivalent of a REST API — without touching your handlers. Write your domain once, serve it over HTTP and MCP.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/mcp-adapter
```

## A tools adapter, not an HTTP-domain adapter

This adapter exposes **explicitly declared tools**, each a curated domain operation. It does **not**
auto-expose an existing HTTP-route app (turning routes into tools is a separate router-to-MCP
bridge). The adapter owns no routing: it turns a tool call into an `IncomingEvent` and the
**kernel's key-router** (`@KeyRouting()`) dispatches it to the tool's handler, through the same
middleware / DI / hooks as any other Stone.js event.

## Usage

```ts
import { Mcp } from '@stone-js/mcp-adapter'
import { KeyRouting } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'

// A tool is dispatched by the key-router (its name is the routing key), exactly like a bus event
// or a realtime gateway method — one dispatch model across every Stone.js adapter.
@Mcp()
@KeyRouting()
@StoneApp({ name: 'my-app' })
export class Application {}
```

Declare the tools (name → handler) with `defineMcpTools`; each handler runs through the kernel:

```ts
import { defineMcpTools } from '@stone-js/mcp-adapter'

export const Tools = defineMcpTools([
  { name: 'create_task', description: 'Create a task', handler: (args, event) => /* domain */ ({ id: 1 }) }
])
```

The server advertises an `instructions` string to the agent (the Continuum contract: the tools are
your domain, resolved by the same kernel as HTTP). Customise it, and the rest of the server, with
`defineMcp` in your app's modules:

```ts
import { defineMcp } from '@stone-js/mcp-adapter'

export const Mcp = defineMcp({
  name: 'my-app',
  version: '1.0.0',
  instructions: 'Call these tools to manage tasks. Every call is validated exactly like the REST API.'
})
```

## Local development: serve your app to a coding agent

A tool call is just another context, so the same app can answer your editor's LLM while you build.
Two moves:

1. **Give the agent the framework's knowledge** by composing the `@stone-js/mcp` tools with yours,
   so the agent can query Stone.js concepts/modules/conventions in real time:

   ```ts
   import { stoneMcpTools } from '@stone-js/mcp'
   import { defineMcpTools } from '@stone-js/mcp-adapter'

   export const Tools = defineMcpTools([...stoneMcpTools /*, ...your domain tools */])
   ```

2. **Run the app on the MCP adapter** (stdio) as a second process, next to your usual `stone dev`.
   The run-time collapse selects the adapter whose platform matches `stone.adapter.platform`, so a
   tiny `@Configuration` can flip the app into MCP mode on demand:

   ```ts
   import { Configuration, IBlueprint, IConfiguration } from '@stone-js/core'
   import { getString } from '@stone-js/env'

   @Configuration()
   export class McpMode implements IConfiguration {
     configure (blueprint: IBlueprint): void {
       if (getString('STONE_MCP', '') === '1') blueprint.set('stone.adapter.platform', 'mcp')
     }
   }
   ```

Then point your agent at it via `.mcp.json` (Claude Code, Cursor, Claude Desktop, …):

```jsonc
{ "mcpServers": {
  "my-app": { "command": "sh", "args": ["-c", "STONE_MCP=1 node dist/server.mjs"] }
} }
```

`stone dev` still serves HTTP for you; the agent gets the same domain as tools, plus the framework
knowledge, plus the `instructions` contract. (An ergonomic `stone mcp` command is on the way to
replace the env flag.)

## Documentation

Full documentation: **[stonejs.dev/docs/adapters/mcp](https://stonejs.dev/docs/adapters/mcp)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
