# Stone.js - GCP Cloud Functions Adapter

[![npm license](https://img.shields.io/npm/l/@stone-js/gcp-cloud-functions-adapter)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/gcp-cloud-functions-adapter)](https://www.npmjs.com/package/@stone-js/gcp-cloud-functions-adapter)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/gcp-cloud-functions-adapter)](https://www.npmjs.com/package/@stone-js/gcp-cloud-functions-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **GCP Cloud Functions Adapter** lets your Stone.js application run on **event-driven** Google Cloud Functions, beyond HTTP. It normalizes any CloudEvent trigger (Pub/Sub, Cloud Storage, Eventarc, Firestore, schedulers) into a Stone.js `IncomingEvent`, fully aligned with the Continuum Architecture.

> For **HTTP-triggered** functions, use [`@stone-js/gcp-cloud-functions-http-adapter`](https://www.npmjs.com/package/@stone-js/gcp-cloud-functions-http-adapter). For **Cloud Run** (a container with a long-running server), use [`@stone-js/node-http-adapter`](https://www.npmjs.com/package/@stone-js/node-http-adapter) as-is.

---

## Introduction

In Stone.js, **adapters** are the translation layer between a platform and your domain. This adapter targets the non-HTTP Cloud Functions runtime: the Functions Framework invokes your function with a **CloudEvent**, and the adapter turns that into a standardized `IncomingEvent`, runs it through your kernel, and returns a raw response. The whole CloudEvent (its `type`, `source`, `subject`, `id`, `time` and trigger-specific `data`) is exposed on the event metadata, so one handler can dispatch on the event type.

It does **not** own a server: `run()` returns the handler you register with the Functions Framework.

## Installation

```bash
npm install @stone-js/gcp-cloud-functions-adapter
# or
pnpm add @stone-js/gcp-cloud-functions-adapter
# or
yarn add @stone-js/gcp-cloud-functions-adapter
```

> Requires `@stone-js/core` and `@stone-js/env` as peer dependencies.

## Usage

Declarative (decorator):

```ts
import { StoneApp } from '@stone-js/core'
import { GcpCloudFunctions } from '@stone-js/gcp-cloud-functions-adapter'

@GcpCloudFunctions()
@StoneApp({ name: 'workers' })
export class Application {}
```

Imperative (blueprint):

```ts
import { defineStoneApp } from '@stone-js/core'
import { gcpCloudFunctionsAdapterBlueprint } from '@stone-js/gcp-cloud-functions-adapter'

export const App = defineStoneApp({ name: 'workers' }, [gcpCloudFunctionsAdapterBlueprint])
```

`run()` returns the CloudEvent handler you register with the Functions Framework:

```ts
import * as functions from '@google-cloud/functions-framework'

functions.cloudEvent('stone', await stoneApp.run())
```

### Failures and retries

Cloud Functions treats an event-driven invocation as **failed** only when the handler rejects. On failure the adapter rethrows by default so the platform's retry policy applies, set `stone.adapter.rethrowOnError = false` to opt out and manage failures yourself.

## Deploy

```bash
# Example: a Pub/Sub-triggered function
gcloud functions deploy workers \
  --gen2 --runtime=nodejs20 --entry-point=stone \
  --trigger-topic=my-topic
```

## Documentation

See the [official documentation](https://stonejs.dev/docs/adapters/gcp-cloud-functions) for the full guide.

## License

[MIT](./LICENSE)
