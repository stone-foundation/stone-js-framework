# Stone.js - AWS Lambda HTTP Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/aws-lambda-http-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/aws-lambda-http-adapter)](https://www.npmjs.com/package/@stone-js/aws-lambda-http-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/aws-lambda-http-adapter)](https://www.npmjs.com/package/@stone-js/aws-lambda-http-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-aws-lambda-http-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-aws-lambda-http-adapter)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-aws-lambda-http-adapter&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-aws-lambda-http-adapter)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **AWS Lambda HTTP Adapter** allows your Stone.js application to run as a fully event-driven Lambda function behind API Gateway or any Lambda-compatible HTTP environment. It seamlessly transforms API Gateway events into `IncomingEvent` and returns `OutgoingResponse`, adhering to the Continuum Architecture.

---

## Introduction

In Stone.js, **adapters** serve as bridges between raw platform input and structured internal events. The AWS Lambda HTTP Adapter processes API Gateway-style HTTP events and turns them into normalized `IncomingEvent` objects. It also formats your system’s `OutgoingResponse` into a valid Lambda HTTP response payload.

This adapter empowers you to write cloud-native functions that stay decoupled from AWS specifics while preserving the full Stone.js lifecycle, type safety, and cross-platform consistency.

## Installation

```bash
npm install @stone-js/aws-lambda-http-adapter
````

> This package is **pure ESM**. Make sure your project uses ESM (`"type": "module"` in `package.json`) or configure your tooling accordingly.

## Usage

You can integrate the adapter either declaratively with a decorator or imperatively using the `awsLambdaHttpAdapterBlueprint`.

### Declarative API

```ts
import { AwsLambdaHttp } from '@stone-js/aws-lambda-http-adapter'
import { StoneApp, IncomingEvent, IEventHandler } from '@stone-js/core'

@StoneApp()
@AwsLambdaHttp({ default: true })
export class Application implements IEventHandler<IncomingEvent> {
  handle(event: IncomingEvent) {
    const name = event.get<string>('name', 'Lambda')
    return { message: `Hello ${name}` }
  }
}
```

### Imperative API

```ts
import { defineStoneApp, IncomingEvent, defineConfig, IBlueprint } from '@stone-js/core'
import { awsLambdaHttpAdapterBlueprint, AWS_LAMBDA_HTTP_PLATFORM } from '@stone-js/aws-lambda-http-adapter'

const handler = (event: IncomingEvent) => {
  const name = event.get<string>('name', 'Lambda')
  return { message: `Hi ${name}` }
}

export const App = defineStoneApp(handler, {}, [awsLambdaHttpAdapterBlueprint])

export const AppConfig = defineConfig({
  afterConfigure(blueprint: IBlueprint) {
    if (blueprint.is('stone.adapter.platform', AWS_LAMBDA_HTTP_PLATFORM)) {
      blueprint.set('stone.adapter.default', true)
    }
  }
})
```

## What It Enables

* **Serverless by Design**
  Build modern HTTP APIs or websites running entirely on AWS Lambda behind API Gateway or ALB.

* **Clean Separation of Concerns**
  Your app never sees AWS-specific payloads. All requests and responses are fully normalized by the adapter.

* **Full Continuum Integration**
  Request becomes `IncomingEvent`, response becomes `OutgoingResponse`. Lambda is just another execution environment.

* **Small, Fast, Efficient**
  No cold start bloat. No Express or frameworks. Just your logic and the lightweight Stone.js runtime.

* **Lifecycle Support**
  Includes support for `onStart`, `onStop`, error hooks, and adapter middleware.

* **Typed Event Context**
  Access query, body, headers, cookies, IPs and more with full TypeScript support.

* **Zero Glue Code**
  No need to write `handler(event, context)` boilerplate. Stone.js manages that for you.

* **Multi-platform Ready**
  The same app can run locally with Node, in the browser, or in the cloud, just change the adapter.

## Configuration Options

Unlike Node, this adapter inherits all standard options from the core `AdapterConfig`:

| Option          | Type                                      | Description                                      |
| --------------- | ----------------------------------------- | ------------------------------------------------ |
| `default`       | `boolean`                                 | Set as the default adapter for your app          |
| `alias`         | `string`                                  | Optional name to reference this adapter          |
| `current`       | `boolean`                                 | Marks this adapter as active at runtime          |
| `middleware[]`  | `AdapterMixedPipeType[]`                  | Middleware executed during the adapter lifecycle |
| `errorHandlers` | `Record<string, MetaAdapterErrorHandler>` | Customize error response formatting or behavior  |

> Note: AWS Lambda automatically injects its execution context and raw event. This adapter handles both without manual plumbing.

## Adapter Context Shape

When middleware or hooks execute, the AWS Lambda adapter provides this normalized context:

```ts
interface AwsLambdaHttpAdapterContext {
  rawEvent: AwsLambdaHttpEvent;
  rawResponse?: RawHttpResponseOptions;
  executionContext: Record<string, unknown>;
  incomingEvent?: IncomingHttpEvent;
  outgoingResponse?: OutgoingHttpResponse;
  incomingEventBuilder: IAdapterEventBuilder<IncomingHttpEventOptions, IncomingHttpEvent>;
  rawResponseBuilder: IAdapterEventBuilder<RawHttpResponseOptions, IRawResponseWrapper<RawHttpResponseOptions>>;
}
```

### AWS Lambda Event

```ts
export interface AwsLambdaHttpEvent extends Record<string, unknown> {
  path?: string
  body?: unknown
  rawPath?: string
  encoding?: string
  httpMethod?: string
  isBase64Encoded?: boolean
  headers: Record<string, string>
  queryStringParameters?: Record<string, string>
  requestContext?: {
    identity?: {
      sourceIp?: string
    }
    httpMethod?: string
    http?: {
      method?: string
      sourceIp?: string
    }
  }
}
```

### AWS Lambda Response

```ts
export interface RawHttpResponseOptions {
  body?: unknown
  statusCode: number
  statusMessage?: string
  headers?: Record<string, string>
  isBase64Encoded?: boolean
}
```

This context ensures complete control over request handling and response shaping, even in a FaaS environment.

## Summary

The `@stone-js/aws-lambda-http-adapter` makes your Stone.js app cloud-native, cost-efficient, and Lambda-ready. Embrace the event-driven cloud with minimal effort and maximum architectural clarity.

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter/blob/main/CONTRIBUTING.md)