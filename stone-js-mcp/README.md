# Stone.js · MCP (framework knowledge)

[![npm](https://img.shields.io/npm/v/@stone-js/mcp)](https://www.npmjs.com/package/@stone-js/mcp)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> The agent-native brain of Stone.js. A machine-readable map of the framework (concepts, modules, best-practices, gaps) exposed as MCP tools and llms.txt — so the LLM masters the context while you master the domain.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/mcp
```

## Usage

```ts
import { stoneMcpTools, searchKnowledge, generateLlmsTxt } from '@stone-js/mcp'

// Serve the framework's own knowledge (concepts, modules, APIs) to an LLM or
// agent as MCP tools, and generate an llms.txt for your docs site.
const hits = searchKnowledge('how do adapters collapse at runtime')
const llms = generateLlmsTxt()
```

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/mcp](https://stonejs.dev/docs/extensions/mcp)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
