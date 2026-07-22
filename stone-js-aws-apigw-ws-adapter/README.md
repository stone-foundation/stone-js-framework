# Stone.js - AWS API Gateway WebSocket Adapter

[![npm license](https://img.shields.io/npm/l/@stone-js/aws-apigw-ws-adapter)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/aws-apigw-ws-adapter)](https://www.npmjs.com/package/@stone-js/aws-apigw-ws-adapter)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/aws-apigw-ws-adapter)](https://www.npmjs.com/package/@stone-js/aws-apigw-ws-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**AWS API Gateway WebSocket adapter for Stone.js.** Runs your realtime app serverlessly: each socket event (`$connect`, `$disconnect`, a message) is a Lambda invocation, mapped onto [`@stone-js/realtime`](https://www.npmjs.com/package/@stone-js/realtime). The adapter keeps presence in DynamoDB (shared across the ephemeral invocations), fires your `@On*` gateways, and pushes messages back through the API Gateway Management API. The same gateway code runs here and on the Node `ws` adapter, no change.

---

## Installation

```bash
npm install @stone-js/aws-apigw-ws-adapter @stone-js/realtime

# the AWS SDKs it uses (optional peers, imported lazily):
npm install @aws-sdk/client-apigatewaymanagementapi @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

> Peer dependencies: `@stone-js/core`, `@stone-js/env` and `@stone-js/realtime`. The three `@aws-sdk/*` packages are optional peers, imported lazily when used.

## Enable it

```ts
import { StoneApp } from '@stone-js/core'
import { Realtime } from '@stone-js/realtime'
import { ApiGatewayWs } from '@stone-js/aws-apigw-ws-adapter'

@ApiGatewayWs()
@Realtime({ driver: 'memory' })   // bootstraps the RealtimeManager
@StoneApp({ name: 'chat' })
export class Application {}
```

Register the serverless broadcaster (DynamoDB-backed presence) as the realtime default with a small
provider. The adapter then resolves it from the manager and points it at each event's management
endpoint:

```ts
import { IServiceProvider } from '@stone-js/core'
import { RealtimeManager } from '@stone-js/realtime'
import { ApiGatewayWsBroadcaster, DynamoDbConnectionStore } from '@stone-js/aws-apigw-ws-adapter'

export class ApiGatewayWsRealtimeProvider implements IServiceProvider {
  register (): void {
    RealtimeManager.getInstance()
      ?.register('apigw-ws', ApiGatewayWsBroadcaster.create({
        store: DynamoDbConnectionStore.create({ table: 'ws_connections' })
      }))
      .setDefaultConnection('apigw-ws')
  }
}
```

## Gateways react to sockets

```ts
import { RealtimeGateway, OnConnect, OnEvent, connectionOf } from '@stone-js/realtime'

@RealtimeGateway()
export class Chat {
  constructor (private readonly realtime) {}

  @OnConnect() onConnect (_, event) { const connection = connectionOf(event) /* authorize… */ }

  @OnEvent('room:1', 'message')
  async onMessage (payload, event) {
    await this.realtime.to('room:1').emit('message', payload)   // fans out via postToConnection
  }
}
```

## How it works

- `run()` returns the `(event, context)` Lambda handler for your WebSocket API's routes.
- `requestContext.eventType` is mapped to a routing key: `CONNECT` adds the connection to the store; `DISCONNECT` removes it; `MESSAGE` parses the frame.
- Each event is normalized into an `IncomingEvent` and run through the kernel, where the light key-router routes it to the matching `@On*` gateway (`@OnConnect`, `@OnEvent`, ...).
- Control frames (`{ type: 'subscribe' | 'unsubscribe', channel }`) also update DynamoDB presence.
- A `broadcast` reads the channel's members from DynamoDB and posts to each via the Management API (the endpoint is taken from the event).

## License

[MIT](./LICENSE)
