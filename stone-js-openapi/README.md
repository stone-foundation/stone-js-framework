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

## Documentation

Full documentation: **[stonejs.dev/docs/extensions/openapi](https://stonejs.dev/docs/extensions/openapi)**.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
