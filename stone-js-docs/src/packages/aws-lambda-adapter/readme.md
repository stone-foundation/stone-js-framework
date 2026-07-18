# Stone.js - AWS Lambda Adapter

[![npm](https://img.shields.io/npm/l/@stone-js/aws-lambda-adapter)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/aws-lambda-adapter)](https://www.npmjs.com/package/@stone-js/aws-lambda-adapter)
[![npm](https://img.shields.io/npm/dm/@stone-js/aws-lambda-adapter)](https://www.npmjs.com/package/@stone-js/aws-lambda-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/actions/workflows/main.yml)
[![Publish Package to npmjs](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-aws-lambda-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-aws-lambda-adapter)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-aws-lambda-adapter&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-aws-lambda-adapter)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The **AWS Lambda Adapter** allows you to deploy any Stone.js application as a general-purpose Lambda function, not tied to HTTP. Whether you're building background jobs, event processors, queue consumers, or cron-based automation, this adapter brings the full power of Continuum Architecture to the serverless world.

---

## Introduction

In Stone.js, **adapters** connect your app to the outside world. The AWS Lambda Adapter enables your logic to run in any AWS Lambda context, triggered by SQS, EventBridge, CloudWatch, or even a custom invocation.

This adapter captures the Lambda `event` and `context`, wraps them in a consistent `IncomingEvent`, and allows you to produce a clean `OutgoingResponse`, or nothing at all, if your function is fire-and-forget.

The result? One system, one lifecycle, one architectural model, everywhere.

## Installation

```bash
npm install @stone-js/aws-lambda-adapter
```

> This package is **pure ESM**. Make sure your project uses ESM (`"type": "module"` in `package.json`) or configure your tooling accordingly.

## Usage

You can register the adapter via class decorators or programmatically using the blueprint.

### Declarative API

```ts
import { AwsLambda } from '@stone-js/aws-lambda-adapter'
import { StoneApp, IncomingEvent, IEventHandler } from '@stone-js/core'

@StoneApp()
@AwsLambda()
export class LambdaHandler implements IEventHandler<IncomingEvent> {
  async handle(event: IncomingEvent) {
    const payload = event.get<any>('payload')
    // Process message or do background work
    return { success: true, received: payload }
  }
}
```

### Imperative API

```ts
import { defineStoneApp, IncomingEvent } from '@stone-js/core'
import { awsLambdaAdapterBlueprint } from '@stone-js/aws-lambda-adapter'

const handler = async (event: IncomingEvent) => {
  const task = event.get<string>('task')
  console.log(`Processing task: ${task}`)
}

export const App = defineStoneApp(handler, {}, [awsLambdaAdapterBlueprint])
```

## What It Enables

* **General-Purpose Lambda Support**
  Process any AWS Lambda invocation, from SQS to EventBridge, without HTTP assumptions.

* **Full Continuum Integration**
  The raw Lambda event and context become cleanly wrapped in a Stone `IncomingEvent`.

* **Minimal Setup, Max Power**
  Start with a single function, scale to a complex pipeline, no boilerplate required.

* **No Vendor Lock-in**
  The logic is decoupled from Lambda. You can reuse and test it outside of AWS with zero changes.

* **Flexible Output Handling**
  Return an `OutgoingResponse`, throw errors, or simply return `void`, your flow, your rules.

* **Lifecycle Hooks**
  Define `onStart`, `onStop`, and hook into adapter middleware.

* **First-Class TypeScript Support**
  All context and behavior are typed and autocompleted out of the box.

## Configuration Options

The AWS Lambda Adapter inherits the base Stone.js `AdapterConfig` type. It does not define custom options, but you can configure:

| Option          | Type                                      | Description                                      |
| --------------- | ----------------------------------------- | ------------------------------------------------ |
| `default`       | `boolean`                                 | Set as the default adapter for your app          |
| `alias`         | `string`                                  | Optional name to reference this adapter          |
| `current`       | `boolean`                                 | Marks this adapter as active at runtime          |
| `middleware[]`  | `AdapterMixedPipeType[]`                  | Middleware executed during the adapter lifecycle |
| `errorHandlers` | `Record<string, MetaAdapterErrorHandler>` | Customize error response formatting or behavior  |

## Adapter Context Shape

During execution, adapter middleware and hooks receive a full context object:

```ts
interface AwsLambdaAdapterContext {
  rawEvent: unknown;              // The raw AWS Lambda event input
  rawResponse?: unknown;          // Optionally the return response (if expected)
  executionContext: LambdaContext; // AWS Lambda context object
  incomingEvent?: IncomingEvent;
  outgoingResponse?: OutgoingResponse;
  incomingEventBuilder: IAdapterEventBuilder<any, IncomingEvent>;
  rawResponseBuilder: IAdapterEventBuilder<any, any>;
}
```

This allows for full introspection and control at all stages of execution, including advanced transformation and diagnostics.

## Summary

The `@stone-js/aws-lambda-adapter` bridges your system with AWS Lambda, but without compromising your architecture. Whether you're building automation scripts, stream processors, or serverless services, this adapter keeps your code structured, composable, and future-proof.

Build it once. Deploy it anywhere.

## Learn More

This package is part of the Stone.js ecosystem, a JavaScript framework for cloud-native applications built on the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

* [API](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/blob/main/docs)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-aws-lambda-adapter/blob/main/CONTRIBUTING.md)
