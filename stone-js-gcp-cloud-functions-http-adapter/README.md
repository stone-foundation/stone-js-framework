# Stone.js - GCP Cloud Functions HTTP Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/gcp-cloud-functions-http-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/gcp-cloud-functions-http-adapter)](https://www.npmjs.com/package/@stone-js/gcp-cloud-functions-http-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/gcp-cloud-functions-http-adapter)](https://www.npmjs.com/package/@stone-js/gcp-cloud-functions-http-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-gcp-cloud-functions-http-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-gcp-cloud-functions-http-adapter/actions/workflows/main.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-gcp-cloud-functions-http-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-gcp-cloud-functions-http-adapter)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **GCP Cloud Functions HTTP Adapter** lets your Stone.js application run on Google Cloud Functions HTTP triggers, unchanged. It bridges the Functions Framework's Express-flavoured `(req, res)` call to the Stone.js event system, fully aligned with the Continuum Architecture.

---

## Introduction

In Stone.js, **adapters** are the translation layer between a platform and your domain. Google Cloud Functions invokes an HTTP function with the [Functions Framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) `(req, res)` signature (`req` extends Node's `IncomingMessage`). This adapter turns that request into a standardized `IncomingHttpEvent`, runs it through your kernel, and writes the `OutgoingHttpResponse` back onto the response, so your routes, validation, cookies and file uploads run on Cloud Functions with no changes to the domain.

Unlike the Node HTTP adapter, it does **not** create or own an HTTP server: the platform owns the process lifecycle and the socket. `run()` returns the handler the Functions Framework invokes per request.

> **Cloud Run** runs a container with an ordinary long-running HTTP server, so it does not need this adapter, use [`@stone-js/node-http-adapter`](https://www.npmjs.com/package/@stone-js/node-http-adapter) as-is. This adapter is specifically for the event-driven Cloud Functions runtime (1st and 2nd gen).

## Installation

```bash
npm install @stone-js/gcp-cloud-functions-http-adapter
# or
pnpm add @stone-js/gcp-cloud-functions-http-adapter
# or
yarn add @stone-js/gcp-cloud-functions-http-adapter
```

> Requires `@stone-js/core`, `@stone-js/http-core` and `@stone-js/filesystem` as peer dependencies.

## Usage

Declarative (decorator):

```ts
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { GcpCloudFunctionsHttp } from '@stone-js/gcp-cloud-functions-http-adapter'

@GcpCloudFunctionsHttp()
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
```

Imperative (blueprint):

```ts
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { gcpCloudFunctionsHttpAdapterBlueprint } from '@stone-js/gcp-cloud-functions-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, gcpCloudFunctionsHttpAdapterBlueprint]
)
```

`run()` returns the `(req, res)` handler you register with the Functions Framework:

```ts
import * as functions from '@google-cloud/functions-framework'

functions.http('stone', await stoneApp.run())
```

### Request bodies

The Functions Framework consumes the request stream before your handler runs and hands it the already-parsed `body` and the untouched `rawBody`. The adapter reads both, so JSON, form and text bodies work with zero configuration, and the raw payload stays available on the event metadata (webhook signature verification, etc.).

## Deploy

```bash
gcloud functions deploy tasks \
  --gen2 --runtime=nodejs20 \
  --trigger-http --entry-point=stone --allow-unauthenticated
```

## Documentation

See the [official documentation](https://stonejs.dev/docs/adapters/gcp-cloud-functions) for the full guide.

## License

[MIT](./LICENSE)
