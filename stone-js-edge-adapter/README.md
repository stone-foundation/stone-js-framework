# Stone.js · Edge adapter

[![npm](https://img.shields.io/npm/v/@stone-js/edge-adapter)](https://www.npmjs.com/package/@stone-js/edge-adapter)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Deploy a Stone.js app to any WinterCG/edge or JS runtime — Cloudflare Workers, Vercel Edge, Netlify Edge, Deno and Bun — with one-line serve helpers on top of @stone-js/fetch-adapter. Build once, deploy anywhere.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/edge-adapter
```

## Usage

```ts
// One Stone.js domain, every WinterCG/edge runtime. Thin helpers over @stone-js/fetch-adapter.
import { serveCloudflare } from '@stone-js/edge-adapter'
import { Application } from './Application'

// Cloudflare Workers entry point:
export default serveCloudflare(Application)

// Also: serveVercel, serveNetlify, serveFetch (generic WinterCG fetch handler).
```

## Documentation

Full documentation: **[stonejs.dev/docs/adapters/fetch](https://stonejs.dev/docs/adapters/fetch)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
