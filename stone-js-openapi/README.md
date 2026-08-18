# Stone.js · OpenAPI

[![npm license](https://img.shields.io/npm/l/@stone-js/openapi)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/openapi)](https://www.npmjs.com/package/@stone-js/openapi)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/openapi)](https://www.npmjs.com/package/@stone-js/openapi)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Framework-agnostic OpenAPI 3.1 for Stone.js. Derive a public contract from your Zod schemas and routes, serve it (JSON + Swagger UI), and generate typed frontend clients from it.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/openapi
```

## Usage

```ts
import { OpenApiGenerator, swaggerUiHtml } from '@stone-js/openapi'
import { NewTask } from './schemas'   // your Zod / Standard Schema

export const spec = OpenApiGenerator
  .create({ title: 'Tasks API', version: '1.0.0' })
  .addServer('http://localhost:8080')
  .addSchema('NewTask', NewTask)      // schema -> JSON Schema, automatically
  .addPath('post', '/tasks', { request: { body: NewTask }, responses: { 201: { description: 'Created' } } })
  .build()

// Serve spec as JSON from one route, and swaggerUiHtml('/openapi.json') as HTML from another.
```

## Serving the contract

One line and the contract serves itself, at `/openapi.json` with an explorer at `/docs`:

```ts
import { openApiBlueprint } from '@stone-js/openapi'

// From a @Configuration (or defineConfig):
blueprint
  .set(openApiBlueprint)
  .set('stone.openapi.info', { title: 'Tasks', version: '1.0.0' })
  .set('stone.openapi.routes', [
    { path: '/tasks', method: 'get', openapi: { summary: 'List tasks' } }
  ])
```

Everything under `stone.openapi` is optional:

| Key | Default | What it does |
|---|---|---|
| `info` | `{ title: 'API', version: '1.0.0' }` | Document metadata |
| `specPath` | `/openapi.json` | Where the JSON document is served |
| `docsPath` | `/docs` | Where the explorer is served; `false` serves the JSON only |
| `routes` | `[]` | Routes to describe |
| `document` | none | A pre-built document, when your app assembles its own |
| `servers` | the requesting host | Server URLs to advertise |
| `swaggerUi` | `{}` | Explorer rendering options |

**The advertised server URL is the host that answered**, not a value frozen at build time: the same
artefact runs behind a local port, a load balancer and an API Gateway stage, and a hardcoded URL is
wrong for at least two of them. Declare `servers` to override that.

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/openapi](https://stonejs.dev/docs/extensions/openapi)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
