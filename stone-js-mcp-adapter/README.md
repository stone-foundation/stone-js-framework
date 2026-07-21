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

## Usage

```ts
import { Mcp } from '@stone-js/mcp-adapter'
import { Routing } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'

// Expose your existing router handlers to AI agents as MCP tools, unchanged.
// One domain, two contexts: your REST API and your agent tools are the same code.
@Mcp()
@Routing()
@StoneApp({ name: 'my-app' })
export class Application {}
```

## Documentation

Full documentation: **[stonejs.dev/docs/adapters/mcp](https://stonejs.dev/docs/adapters/mcp)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
