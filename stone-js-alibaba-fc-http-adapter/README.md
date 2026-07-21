# Stone.js - Alibaba FC HTTP Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/alibaba-fc-http-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/alibaba-fc-http-adapter)](https://www.npmjs.com/package/@stone-js/alibaba-fc-http-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/alibaba-fc-http-adapter)](https://www.npmjs.com/package/@stone-js/alibaba-fc-http-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-alibaba-fc-http-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-alibaba-fc-http-adapter/actions/workflows/main.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-alibaba-fc-http-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-alibaba-fc-http-adapter)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Alibaba FC HTTP Adapter** lets your Stone.js application run on Alibaba Cloud Function Compute HTTP triggers, unchanged. It bridges FC's `(req, resp, context)` HTTP handler to the Stone.js event system, fully aligned with the Continuum Architecture.

---

## Introduction

In Stone.js, **adapters** are the translation layer between a platform and your domain. Alibaba Cloud Function Compute (FC 2.0) invokes an HTTP-triggered function with `(req, resp, context)`: a plain request object (with the body pre-read into a `Buffer`) and an imperative response written via `setStatusCode` / `setHeader` / `send`. This adapter turns the request into a standardized `IncomingHttpEvent`, runs it through your kernel, and writes the response, so your routes, validation and cookies run on FC with no changes to the domain.

It does **not** own a server: `run()` returns the `(req, resp, context)` handler FC invokes per request.

> **FC 3.0** runs a container with an ordinary HTTP server, so it does not need this adapter, use [`@stone-js/node-http-adapter`](https://www.npmjs.com/package/@stone-js/node-http-adapter) as-is.

## Installation

```bash
npm install @stone-js/alibaba-fc-http-adapter
# or
pnpm add @stone-js/alibaba-fc-http-adapter
# or
yarn add @stone-js/alibaba-fc-http-adapter
```

> Requires `@stone-js/core`, `@stone-js/http-core` and `@stone-js/filesystem` as peer dependencies.

## Usage

Declarative (decorator):

```ts
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { AlibabaFcHttp } from '@stone-js/alibaba-fc-http-adapter'

@AlibabaFcHttp()
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
```

Imperative (blueprint):

```ts
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { alibabaFcHttpAdapterBlueprint } from '@stone-js/alibaba-fc-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, alibabaFcHttpAdapterBlueprint]
)
```

`run()` returns the `(req, resp, context)` handler FC invokes:

```ts
// index.js — the FC HTTP function entry
exports.handler = await stoneApp.run()
```

## Documentation

See the [official documentation](https://stonejs.dev/docs/adapters/alibaba-fc) for the full guide.

## License

[MIT](./LICENSE)
