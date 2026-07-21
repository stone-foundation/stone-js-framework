# Stone.js · OpenAPI

[![npm](https://img.shields.io/npm/v/@stone-js/openapi)](https://www.npmjs.com/package/@stone-js/openapi)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
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

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/openapi](https://stonejs.dev/docs/extensions/openapi)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
