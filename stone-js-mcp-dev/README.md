# Stone.js · MCP dev server

[![npm](https://img.shields.io/npm/v/@stone-js/mcp-dev)](https://www.npmjs.com/package/@stone-js/mcp-dev)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Serve Stone.js's knowledge to your coding agent. One command — `stone mcp` — starts an MCP server exposing the framework's concepts, modules and best-practices (plus your own tools), so the LLM masters the context while you master the domain.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i -D @stone-js/mcp-dev
```

## Usage

Add the command to your app with the `@McpDev()` decorator (or register `mcpDevBlueprint`):

```ts
import { McpDev } from '@stone-js/mcp-dev'
import { StoneApp } from '@stone-js/core'

@McpDev()
@StoneApp({ name: 'my-app' })
export class Application {}
```

Then start the server from your project:

```bash
stone mcp
```

`stone mcp` starts an MCP server over **stdio** and keeps running until you press `Ctrl+C`, exactly
like `stone dev`. It hands the [MCP SDK](https://github.com/modelcontextprotocol) the built-in
framework-knowledge tools and lets the SDK own the protocol and run the handlers — these are dev and
knowledge helpers, not your domain, so they do not need to traverse the kernel. Every tool call is
logged to **stderr** (stdout is reserved for the JSON-RPC protocol) so you watch the agent think in
real time.

### Register it for your agent

Let `stone mcp` write `.mcp.json` for you (create or merge, never clobbering your own config):

```bash
stone mcp --init
```

Or add the entry yourself (Claude Code, Cursor, Claude Desktop, …):

```jsonc
{ "mcpServers": {
  "stone": { "command": "stone", "args": ["mcp"] }
} }
```

`.mcp.json` can be committed or `.gitignore`d per developer.

### Framework-knowledge tools

| Tool | What it returns |
|---|---|
| `stone_search` | Search the knowledge base (concepts, modules, best-practices, gaps). |
| `stone_concept` | Explain a core concept by id (omit id to list them all). |
| `stone_docs` | Links to the authoritative documentation. |
| `stone_modules` | The ecosystem modules and what each does. |
| `stone_best_practices` | Conventions and anti-patterns, each with its rationale. |
| `stone_gaps` | What the framework does not (yet) provide, and what to reach for. |
| `stone_brief` | The full agent brief (`llms-full.txt`). |

### App-introspection tools

These read *your* app's resolved blueprint (read-only, secrets redacted), so the agent understands
the app you are building, not just the framework:

| Tool | What it returns |
|---|---|
| `stone_app` | App name, env, active platform, and counts of routes/commands/providers/adapters. |
| `stone_routes` | The route tree (path, methods, name, handler, middleware). |
| `stone_commands` | The CLI commands (name, alias, args, description). |
| `stone_adapters` | Registered adapters (platform, alias, default/current) and the active platform. |
| `stone_providers` | The service providers. |
| `stone_kernel` | The kernel pipeline: event handler, middleware, error handlers. |
| `stone_key_routes` | Key-routing definitions (event-bus / realtime): key to handler. |
| `stone_config` | A resolved `stone.*` config value by dotted key (secrets redacted); omit the key to list them. |

### Your own tools

Add project-specific tools (they run in-process, so they receive their arguments directly). Set the
server name, `instructions`, or enable the GitHub report tools under `stone.mcpDev`:

```ts
import { McpDev } from '@stone-js/mcp-dev'

@McpDev({
  name: 'my-app-dev',
  tools: [
    { name: 'db_schema', description: 'Return the current DB schema', handler: () => readSchema() }
  ],
  report: { token: process.env.GITHUB_TOKEN!, repo: 'my-org/my-app' }
})
@StoneApp({ name: 'my-app' })
export class Application {}
```

The knowledge base and `llms.txt` helpers are also exported directly (`stoneMcpTools`,
`searchKnowledge`, `generateLlmsTxt`, `generateLlmsFullTxt`) if you want to serve them elsewhere.

## Agent Skills

The package ships [Agent Skills](https://agentskills.io) (`stone-js`, `stone-js-routing`,
`stone-js-adapters`) under [`skills/`](./skills): portable `SKILL.md` folders that teach a
skills-compatible agent the framework's conventions on demand. They complement the MCP tools (the
tools introspect the app; the skills say how to build it). Copy the ones you want into your agent's
skills directory:

```bash
mkdir -p .claude/skills
cp -R node_modules/@stone-js/mcp-dev/skills/stone-js* .claude/skills/
```

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/mcp](https://stonejs.dev/docs/extensions/mcp)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
