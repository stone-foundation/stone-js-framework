# Stone.js · MCP dev server

[![npm license](https://img.shields.io/npm/l/@stone-js/mcp-dev)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/mcp-dev)](https://www.npmjs.com/package/@stone-js/mcp-dev)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/mcp-dev)](https://www.npmjs.com/package/@stone-js/mcp-dev)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
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

### Register it for your agent

One command writes `.mcp.json` for you (create or merge, never clobbering your own config):

```bash
npx stone mcp --init
```

That is the whole setup: **you never start the server yourself.** It speaks MCP over **stdio**, so the
transport is the child process's own standard input and output. Your agent reads `.mcp.json`, spawns
its own `stone mcp` process and performs the handshake; a server you launch in a terminal has no
channel to your agent and would simply sit there. Restart your agent session after the first
`--init` so it picks the entry up.

The command hands the [MCP SDK](https://github.com/modelcontextprotocol) the built-in
framework-knowledge tools and lets the SDK own the protocol and run the handlers: these are dev and
knowledge helpers, not your domain, so they do not need to traverse the kernel. Every tool call is
logged to **stderr** (stdout is reserved for the JSON-RPC protocol), so running `npx stone mcp` in a
terminal lets you read those logs live. Useful for debugging, never required.

> `npx` is used because `@stone-js/cli` is a dev dependency of your project: the bare `stone` command
> only resolves if you also installed it globally (`npm i -g @stone-js/cli`). Inside a package script
> the prefix is unnecessary.

Or add the entry yourself (Claude Code, Cursor, Claude Desktop, …):

```jsonc
{ "mcpServers": {
  "stone": { "command": "npx", "args": ["stone", "mcp"] }
} }
```

`.mcp.json` can be committed or `.gitignore`d per developer.

### Framework-knowledge tools

| Tool | What it returns |
|---|---|
| `stone_search` | Search the knowledge base (concepts, modules, best-practices, gaps). |
| `stone_concept` | Explain a core concept by id (omit id to list them all). |
| `stone_modules` | The ecosystem modules and what each does. |
| `stone_best_practices` | Conventions and anti-patterns, each with its rationale. |
| `stone_gaps` | What the framework does not (yet) provide, and what to reach for. |
| `stone_brief` | The full agent brief (`llms-full.txt`). |

### App-introspection tools

These read *your* app's resolved configuration (read-only, secrets redacted), so the agent
understands the app you are building, not just the framework:

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
| `stone_describes` | Which application the answers above describe, and how the server knows. |

#### Which application, exactly

`stone mcp` is a console command, so a blueprint it resolves itself is the one a **console** boot
produces: its adapters, its response type and every platform-conditional contribution belong to a
different application than the one you run under `stone dev`.

So the running app publishes its own truth, and the **build** arranges it — not your application:

```bash
npm i -D @stone-js/mcp-dev
```

That is the whole setup. Introspection is a development concern, so it belongs to the build: this
package ships a CLI plugin, the CLI auto-discovers first-party plugins from your direct dependencies,
and on a development build (`dev`, `serve`, `preview`) the plugin injects a hook that writes your
running app's resolved configuration to `.stone/app-context.json`. Your application never imports this
module, never mentions it, and a production build carries none of it.

Run `stone dev` once and the agent sees the real thing: the platform you actually run, your adapters,
your resolved config. Until then the MCP server answers from its own boot and says so through
`stone_describes`, naming which answers not to trust rather than pretending.

Opt out in `stone.config.mjs` with `mcpDev: { publishContext: false }`: nothing is generated at all,
rather than code that ships and decides not to run.

A file rather than a dev endpoint, deliberately: the Blueprint is assembled once before the first
event and then read, so publishing it at boot *is* the value, not a snapshot of something moving. It
also needs no port to discover, adds no route to your application, and works for a CLI or an edge
context that has no HTTP surface at all.

Publishing is on outside production and off in it, since nothing there reads it. Override either way
with `mcpDev: { publishContext: true | false }`.

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
