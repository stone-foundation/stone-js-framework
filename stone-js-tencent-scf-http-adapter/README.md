# Stone.js - Tencent SCF HTTP Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/tencent-scf-http-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/tencent-scf-http-adapter)](https://www.npmjs.com/package/@stone-js/tencent-scf-http-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/tencent-scf-http-adapter)](https://www.npmjs.com/package/@stone-js/tencent-scf-http-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-tencent-scf-http-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-tencent-scf-http-adapter/actions/workflows/main.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-tencent-scf-http-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-tencent-scf-http-adapter)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Tencent SCF HTTP Adapter** lets your Stone.js application run on Tencent Cloud Serverless Cloud Function HTTP triggers, unchanged. SCF fronts HTTP with API Gateway's proxy integration, so the adapter normalizes that event into an intention and returns the `{ statusCode, headers, body, isBase64Encoded }` response the gateway expects, fully aligned with the Continuum Architecture.

---

## Introduction

In Stone.js, **adapters** are the translation layer between a platform and your domain. Tencent SCF invokes an HTTP function via API Gateway with `(event, context)`, where `event` is a proxy payload (`httpMethod`, `path`, `headers`, `queryString`, `body`, `isBase64Encoded`). This adapter turns it into a standardized `IncomingHttpEvent`, runs it through your kernel, and returns the proxy response, so your routes, validation and cookies run on SCF with no changes to the domain.

It does **not** own a server: `run()` returns the `(event, context)` handler SCF invokes.

## Installation

```bash
npm install @stone-js/tencent-scf-http-adapter
# or
pnpm add @stone-js/tencent-scf-http-adapter
# or
yarn add @stone-js/tencent-scf-http-adapter
```

> Requires `@stone-js/core`, `@stone-js/http-core`, `@stone-js/filesystem` and `@stone-js/env` as peer dependencies.

## Usage

Declarative (decorator):

```ts
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { TencentScfHttp } from '@stone-js/tencent-scf-http-adapter'

@TencentScfHttp()
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
```

Imperative (blueprint):

```ts
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { tencentScfHttpAdapterBlueprint } from '@stone-js/tencent-scf-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, tencentScfHttpAdapterBlueprint]
)
```

`run()` returns the `(event, context)` handler SCF invokes:

```ts
// index.js — the SCF function entry
exports.main_handler = await stoneApp.run()
```

> Enable **API Gateway proxy integration** ("集成响应" / base64 for binary) so SCF passes the full request event and returns the structured response.

## Documentation

See the [official documentation](https://stonejs.dev/docs/adapters/tencent-scf) for the full guide.

## License

[MIT](./LICENSE)
