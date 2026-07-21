# Stone.js - Tencent SCF Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/tencent-scf-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/tencent-scf-adapter)](https://www.npmjs.com/package/@stone-js/tencent-scf-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/tencent-scf-adapter)](https://www.npmjs.com/package/@stone-js/tencent-scf-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-tencent-scf-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-tencent-scf-adapter/actions/workflows/main.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-tencent-scf-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-tencent-scf-adapter)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Tencent SCF Adapter** lets your Stone.js application run on **event-driven** Tencent Cloud Serverless Cloud Function, beyond HTTP. It normalizes any non-HTTP trigger (COS, CMQ/TDMQ, Timer, CKafka) into a Stone.js `IncomingEvent`, fully aligned with the Continuum Architecture.

> For **HTTP-triggered** functions, use [`@stone-js/tencent-scf-http-adapter`](https://www.npmjs.com/package/@stone-js/tencent-scf-http-adapter).

---

## Introduction

In Stone.js, **adapters** are the translation layer between a platform and your domain. This adapter targets the non-HTTP SCF triggers: the function is invoked with `(event, context)`, and the adapter turns that into a standardized `IncomingEvent`, runs it through your kernel, and returns a raw response. The event payload is exposed on the event metadata, so one handler can dispatch on the trigger.

It does **not** own a server: `run()` returns the `(event, context)` handler SCF invokes.

## Installation

```bash
npm install @stone-js/tencent-scf-adapter
# or
pnpm add @stone-js/tencent-scf-adapter
# or
yarn add @stone-js/tencent-scf-adapter
```

> Requires `@stone-js/core` and `@stone-js/env` as peer dependencies.

## Usage

Declarative (decorator):

```ts
import { StoneApp } from '@stone-js/core'
import { TencentScf } from '@stone-js/tencent-scf-adapter'

@TencentScf()
@StoneApp({ name: 'workers' })
export class Application {}
```

Imperative (blueprint):

```ts
import { defineStoneApp } from '@stone-js/core'
import { tencentScfAdapterBlueprint } from '@stone-js/tencent-scf-adapter'

export const App = defineStoneApp({ name: 'workers' }, [tencentScfAdapterBlueprint])
```

`run()` returns the `(event, context)` handler SCF invokes:

```ts
// index.js — the SCF function entry
exports.main_handler = await stoneApp.run()
```

### Failures and retries

SCF treats an event invocation as **failed** only when the handler rejects. On failure the adapter rethrows by default so SCF's retry / dead-letter policy applies, set `stone.adapter.rethrowOnError = false` to opt out and manage failures yourself.

## Documentation

See the [official documentation](https://stonejs.dev/docs/adapters/tencent-scf) for the full guide.

## License

[MIT](./LICENSE)
