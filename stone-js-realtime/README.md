# Stone.js - Realtime

[![npm license](https://img.shields.io/npm/l/@stone-js/realtime)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/realtime)](https://www.npmjs.com/package/@stone-js/realtime)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/realtime)](https://www.npmjs.com/package/@stone-js/realtime)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Agnostic, plug-and-play realtime for Stone.js.** One `Broadcaster` API for the backend and the frontend: publish an event on a channel, subscribe a listener, read presence. One connection contract, pluggable drivers (memory now, Redis via `ioredis`, provider fan-out next), gateways with `@OnConnect`/`@OnEvent`, an isomorphic client, and a `realtime` broadcaster injected in the container. The core is never touched.

---

## Installation

```bash
npm install @stone-js/realtime

# for the Redis (multi-node) fan-out (optional):
npm install ioredis

# for the Node client (optional; the browser uses the global WebSocket):
npm install ws
```

> Peer dependency: `@stone-js/core`. `ioredis` and `ws` are optional peers, imported lazily only when used.

## Enable it

Declarative (single connection):

```ts
import { StoneApp } from '@stone-js/core'
import { Realtime } from '@stone-js/realtime'

@Realtime({ driver: 'redis', url: 'redis://localhost:6379' })
@StoneApp({ name: 'app' })
export class Application {}
```

Imperative / multi-connection via `stone.realtime`:

```ts
import { defineConfig } from '@stone-js/core'
import { defineRealtime } from '@stone-js/realtime'

export const AppConfig = defineConfig(defineRealtime({
  default: 'redis',
  connections: [
    { name: 'redis', driver: 'redis', url: 'redis://localhost:6379', prefix: 'rt' },
    { name: 'local', driver: 'memory' }
  ]
}))
```

## Broadcast

The default broadcaster is injected as `realtime`:

```ts
export class OrderService {
  constructor (private readonly realtime) {}

  async ship (order) {
    await this.realtime.to(`order:${order.id}`).emit('shipped', { at: Date.now() })
  }
}
```

## Listen with a gateway

A gateway is a plain, dependency-injected class; its methods react to lifecycle and channel events:

```ts
import { RealtimeGateway, OnConnect, OnDisconnect, OnEvent, connectionOf } from '@stone-js/realtime'

@RealtimeGateway()
export class Chat {
  constructor (private readonly realtime) {}

  @OnConnect()    onConnect (_, event) { const connection = connectionOf(event) /* … */ }
  @OnDisconnect() onLeave (_, event)   { /* … */ }

  @OnEvent('room:1', 'message')
  async onMessage (payload, event) {
    await this.realtime.to('room:1').emit('message', payload)
  }
}
```

Every keyed handler receives `(payload, event)`; reach the originating connection with `connectionOf(event)`. The full set of method decorators: `@OnConnect`, `@OnDisconnect`, `@OnMessage`, `@OnError`, `@OnSubscribe`, `@OnUnsubscribe` and `@OnEvent(channel, event)`, thin aliases of the light router's `@OnKey` (and `@RealtimeGateway` is `@KeyHandler`).

## On the frontend

The isomorphic client speaks the same `Broadcaster` API, so the code that emits and listens is written once:

```ts
import { RealtimeClient } from '@stone-js/realtime'

const realtime = RealtimeClient.create({ url: 'wss://api.example.com/ws' })

realtime.on('room:1', (message) => render(message.payload))
await realtime.to('room:1').emit('message', { text: 'hi' })
```

## Drivers

| driver     | backing        | notes                                                                              |
| ---------- | -------------- | ---------------------------------------------------------------------------------- |
| `memory`   | built-in       | In-process fan-out. Zero-config default; single node.                              |
| `redis`    | `ioredis`      | Pub/sub fan-out across every node.                                                 |
| `provider` | coming next    | Cloud fan-out (EventBridge, Momento, Ably) wired as a driver, never grafted onto core. |

> The WebSocket server that holds connections ships as a separate adapter (`node-ws`, `aws-apigw-ws`); it populates the connection store and dispatches lifecycle events into the same router.

## License

[MIT](./LICENSE)
