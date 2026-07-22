# Stone.js - Azure Functions Adapter

[![npm license](https://img.shields.io/npm/l/@stone-js/azure-functions-adapter)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/azure-functions-adapter)](https://www.npmjs.com/package/@stone-js/azure-functions-adapter)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/azure-functions-adapter)](https://www.npmjs.com/package/@stone-js/azure-functions-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Azure Functions Adapter** lets your Stone.js application run on **event-driven** Azure Functions, beyond HTTP. It normalizes any non-HTTP trigger (Queue Storage, Service Bus, Event Grid, Event Hub, Timer, Blob) into a Stone.js `IncomingEvent`, fully aligned with the Continuum Architecture.

> For **HTTP-triggered** functions, use [`@stone-js/azure-functions-http-adapter`](https://www.npmjs.com/package/@stone-js/azure-functions-http-adapter).

---

## Introduction

In Stone.js, **adapters** are the translation layer between a platform and your domain. This adapter targets the non-HTTP Azure Functions triggers: the Functions host invokes your function with a trigger input and an `InvocationContext`, and the adapter turns that into a standardized `IncomingEvent`, runs it through your kernel, and returns a raw response. The trigger input is exposed on the event metadata (alongside `context.triggerMetadata`), so one handler can dispatch on the trigger.

It does **not** own a server: `run()` returns the handler you register with `@azure/functions`.

## Installation

```bash
npm install @stone-js/azure-functions-adapter
# or
pnpm add @stone-js/azure-functions-adapter
# or
yarn add @stone-js/azure-functions-adapter
```

> Requires `@stone-js/core` and `@stone-js/env` as peer dependencies.

## Usage

Declarative (decorator):

```ts
import { StoneApp } from '@stone-js/core'
import { AzureFunctions } from '@stone-js/azure-functions-adapter'

@AzureFunctions()
@StoneApp({ name: 'workers' })
export class Application {}
```

Imperative (blueprint):

```ts
import { defineStoneApp } from '@stone-js/core'
import { azureFunctionsAdapterBlueprint } from '@stone-js/azure-functions-adapter'

export const App = defineStoneApp({ name: 'workers' }, [azureFunctionsAdapterBlueprint])
```

`run()` returns the trigger handler you register with `@azure/functions`:

```ts
import { app } from '@azure/functions'

app.storageQueue('stone', {
  queueName: 'jobs',
  connection: 'AzureWebJobsStorage',
  handler: await stoneApp.run()
})
```

### Failures and retries

Azure treats a trigger invocation as **failed** only when the handler rejects. On failure the adapter rethrows by default so the trigger's retry / poison-queue policy applies, set `stone.adapter.rethrowOnError = false` to opt out and manage failures yourself.

## Documentation

See the [official documentation](https://stonejs.dev/docs/adapters/azure-functions) for the full guide.

## License

[MIT](./LICENSE)
