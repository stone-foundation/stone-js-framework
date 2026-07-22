# Stone.js - Azure Functions HTTP Adapter

[![npm license](https://img.shields.io/npm/l/@stone-js/azure-functions-http-adapter)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/azure-functions-http-adapter)](https://www.npmjs.com/package/@stone-js/azure-functions-http-adapter)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/azure-functions-http-adapter)](https://www.npmjs.com/package/@stone-js/azure-functions-http-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Azure Functions HTTP Adapter** lets your Stone.js application run on Azure Functions v4 HTTP triggers, unchanged. Azure Functions v4 uses a Web-standard model (`HttpRequest → HttpResponseInit`), so the adapter reuses the same request normalization as the Fetch adapter and only differs in the response it hands back to the Functions host.

---

## Introduction

In Stone.js, **adapters** are the translation layer between a platform and your domain. Azure Functions v4 invokes an HTTP-triggered function with a Web-standard `HttpRequest` (built on `undici`) and expects an `HttpResponseInit` in return. This adapter turns the request into a standardized `IncomingHttpEvent`, runs it through your kernel, and builds the `HttpResponseInit` the host writes to the wire, so your routes, validation and cookies run on Azure Functions with no changes to the domain.

It does **not** own a server: `run()` returns the handler you register with `app.http(...)`.

## Installation

```bash
npm install @stone-js/azure-functions-http-adapter
# or
pnpm add @stone-js/azure-functions-http-adapter
# or
yarn add @stone-js/azure-functions-http-adapter
```

> Requires `@stone-js/core`, `@stone-js/http-core` and `@stone-js/filesystem` as peer dependencies.

## Usage

Declarative (decorator):

```ts
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { AzureFunctionsHttp } from '@stone-js/azure-functions-http-adapter'

@AzureFunctionsHttp()
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
```

Imperative (blueprint):

```ts
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { azureFunctionsHttpAdapterBlueprint } from '@stone-js/azure-functions-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, azureFunctionsHttpAdapterBlueprint]
)
```

`run()` returns the handler you register with `@azure/functions`:

```ts
import { app } from '@azure/functions'

app.http('stone', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  authLevel: 'anonymous',
  route: '{*path}',
  handler: await stoneApp.run()
})
```

## Documentation

See the [official documentation](https://stonejs.dev/docs/adapters/azure-functions) for the full guide.

## License

[MIT](./LICENSE)
