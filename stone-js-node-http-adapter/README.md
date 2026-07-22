# Stone.js - Node HTTP Adapter

[![npm license](https://img.shields.io/npm/l/@stone-js/node-http-adapter)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/node-http-adapter)](https://www.npmjs.com/package/@stone-js/node-http-adapter)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/node-http-adapter)](https://www.npmjs.com/package/@stone-js/node-http-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **Node HTTP Adapter** enables your Stone.js application to run in any Node.js HTTP environment. It provides a low-level bridge between raw Node HTTP events and the internal event system of Stone.js, fully aligned with the Continuum Architecture.

---

## Introduction

In Stone.js, **adapters** are the translation layer between the outside world and your internal logic. The Node HTTP Adapter handles incoming HTTP requests from Node’s built-in `http` module, transforming them into standardized `IncomingEvent` objects, and turning your system’s `OutgoingResponse` back into proper HTTP responses.

This adapter allows your Stone.js app to behave like a traditional web server, without requiring Express or any framework overhead, while still benefiting from Stone.js’s unified event model, clean lifecycle, and platform independence.

## Installation

```bash
npm install @stone-js/node-http-adapter
```

> This package is **pure ESM**. Make sure your project uses ESM (`"type": "module"` in `package.json`) or configure your tooling accordingly.

## Usage

You can integrate the adapter either declaratively with a decorator or imperatively using the `nodeHttpAdapterBlueprint`.

### Declarative API

```ts
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, IncomingEvent, IEventHandler } from '@stone-js/core'

@StoneApp()
@NodeHttp({ url: 'http://localhost:8081' })
export class Application implements IEventHandler<IncomingEvent> {
  handle(event: IncomingEvent) {
    const name = event.get<string>('name', 'World')
    return { message: `Hello ${name}` }
  }
}
```

### Imperative API

```ts
import { defineStoneApp, IncomingEvent, defineConfig, IBlueprint } from '@stone-js/core'
import { nodeHttpAdapterBlueprint, NODE_HTTP_PLATFORM } from '@stone-js/node-http-adapter'

const handler = (event: IncomingEvent) => {
  const name = event.get<string>('name', 'World')
  return { message: `Hi ${name}` }
}

export const App = defineStoneApp(handler, {}, [nodeHttpAdapterBlueprint])

export const AppConfig = defineConfig({
  afterConfigure(blueprint: IBlueprint) {
    if (blueprint.is('stone.adapter.platform', NODE_HTTP_PLATFORM)) {
      blueprint.set('stone.adapter.url', 'http://localhost:8081')
    }
  }
})
```

## What It Enables

* **Universal HTTP Support**
  Run your Stone.js app on any Node.js HTTP server. No Express or external framework needed.

* **Full Continuum Integration**
  HTTP becomes a native dimension of your system: requests and responses are transformed into `IncomingEvent` and `OutgoingResponse`, respecting the Continuum model.

* **Server-Level Middleware**
  Add `serverMiddleware[]` to intercept raw HTTP traffic before Stone.js handles it. Works with most connect-style middlewares.

* **Lifecycle and Hook Support**
  Includes support for `onStart`, `onStop`, error hooks, and adapter middleware pipelines.

* **Rich Event Context**
  Access IP, cookies, headers, body, uploaded files, and more in a normalized and typed format.

* **Streaming & File Uploads**
  Direct access to Node’s `IncomingMessage` and `ServerResponse` for advanced use cases like streaming or file handling.

* **First-Class TypeScript Support**
  Strong typings for all configuration, events, and response types.

* **Built-in Error Handling**
  Customize how errors are caught and transformed into HTTP responses.

## Configuration Options

| Option               | Type                                      | Description                                                     |
| -------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| `url`                | `string`                                  | Base URL of the server. Example: `http://localhost:3000`        |
| `isSsl`              | `boolean`                                 | Whether to use HTTPS                                            |
| `server`             | `NodeServerOptions`                       | Native Node server configuration                                |
| `printUrls`          | `boolean`                                 | Log URL(s) to console on server start                           |
| `serverMiddleware[]` | `Array<(req, res, next) => void>`         | Platform-level connect-like middleware before Stone.js kicks in |
| `alias`              | `string`                                  | Optional name for referencing the adapter                       |
| `default`            | `boolean`                                 | Set as default adapter for the app                              |
| `current`            | `boolean`                                 | Mark this as the active adapter during runtime                  |
| `middleware[]`       | `AdapterMixedPipeType[]`                  | Middleware for request/response within the Stone.js lifecycle   |
| `errorHandlers`      | `Record<string, MetaAdapterErrorHandler>` | Fine-grained adapter-level error handling                       |

## Adapter Context Shape

When middleware or integration hooks execute, they receive the following context object:

```ts
interface NodeHttpAdapterContext {
  rawEvent: IncomingMessage;
  rawResponse?: ServerResponse;
  executionContext: NodeHttpServer;
  incomingEvent?: IncomingHttpEvent;
  outgoingResponse?: OutgoingHttpResponse;
  incomingEventBuilder: IAdapterEventBuilder<IncomingHttpEventOptions, IncomingHttpEvent>;
  rawResponseBuilder: IAdapterEventBuilder<RawHttpResponseOptions, IRawResponseWrapper<ServerResponse>>;
}
```

These values expose the full HTTP lifecycle and provide access to Stone.js event builders.

### Incoming HTTP Event Options

```ts
interface IncomingHttpEventOptions {
  url: URL;
  ip: string;
  ips?: string[];
  protocol?: string;
  method?: HttpMethods;
  queryString?: string;
  cookies?: CookieCollection;
  body?: Record<string, unknown>;
  files?: Record<string, UploadedFile[]>;
  headers?: Record<string, string> | Headers;
}
```

### Raw HTTP Response Options

```ts
interface RawHttpResponseOptions {
  body: unknown;
  charset?: string;
  statusCode: number;
  statusMessage: string;
  headers: Map<string, string> | Headers;
  streamFile?: () => void | Promise<void>;
}
```

This context flows through all adapter middleware and hooks.

## Summary

The `@stone-js/node-http-adapter` brings your Stone.js application to life in the HTTP world. With seamless integration, native Node support, and complete event transformation, you can build modern APIs, websites, or microservices that feel as fast and flexible as Node, but with the architectural rigor of Stone.js.

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-node-http-adapter/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-node-http-adapter/blob/main/CONTRIBUTING.md)
