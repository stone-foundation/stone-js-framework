# Stone.js - Alibaba FC Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/alibaba-fc-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/alibaba-fc-adapter)](https://www.npmjs.com/package/@stone-js/alibaba-fc-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/alibaba-fc-adapter)](https://www.npmjs.com/package/@stone-js/alibaba-fc-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-alibaba-fc-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-alibaba-fc-adapter/actions/workflows/main.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-alibaba-fc-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-alibaba-fc-adapter)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Alibaba FC Adapter** lets your Stone.js application run on **event-driven** Alibaba Cloud Function Compute, beyond HTTP. It normalizes any non-HTTP trigger (OSS, MNS, Timer, EventBridge, Log) into a Stone.js `IncomingEvent`, fully aligned with the Continuum Architecture.

> For **HTTP-triggered** functions, use [`@stone-js/alibaba-fc-http-adapter`](https://www.npmjs.com/package/@stone-js/alibaba-fc-http-adapter).

---

## Introduction

In Stone.js, **adapters** are the translation layer between a platform and your domain. This adapter targets the non-HTTP FC triggers: the function is invoked with `(event, context)`, and the adapter turns that into a standardized `IncomingEvent`, runs it through your kernel, and returns a raw response. The event payload is exposed on the event metadata, so one handler can dispatch on the trigger.

It does **not** own a server: `run()` returns the `(event, context)` handler FC invokes.

## Installation

```bash
npm install @stone-js/alibaba-fc-adapter
# or
pnpm add @stone-js/alibaba-fc-adapter
# or
yarn add @stone-js/alibaba-fc-adapter
```

> Requires `@stone-js/core` and `@stone-js/env` as peer dependencies.

## Usage

Declarative (decorator):

```ts
import { StoneApp } from '@stone-js/core'
import { AlibabaFc } from '@stone-js/alibaba-fc-adapter'

@AlibabaFc()
@StoneApp({ name: 'workers' })
export class Application {}
```

Imperative (blueprint):

```ts
import { defineStoneApp } from '@stone-js/core'
import { alibabaFcAdapterBlueprint } from '@stone-js/alibaba-fc-adapter'

export const App = defineStoneApp({ name: 'workers' }, [alibabaFcAdapterBlueprint])
```

`run()` returns the `(event, context)` handler FC invokes:

```ts
// index.js — the FC event function entry
exports.handler = await stoneApp.run()
```

### Failures and retries

FC treats an event invocation as **failed** only when the handler rejects. On failure the adapter rethrows by default so FC's retry / dead-letter policy applies, set `stone.adapter.rethrowOnError = false` to opt out and manage failures yourself.

## Documentation

See the [official documentation](https://stonejs.dev/docs/adapters/alibaba-fc) for the full guide.

## License

[MIT](./LICENSE)
