# Stone.js - Node WebSocket Adapter

[![npm license](https://img.shields.io/npm/l/@stone-js/node-ws-adapter)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/node-ws-adapter)](https://www.npmjs.com/package/@stone-js/node-ws-adapter)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/node-ws-adapter)](https://www.npmjs.com/package/@stone-js/node-ws-adapter)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Node.js WebSocket adapter for Stone.js.** Runs a [`ws`](https://github.com/websockets/ws) server and bridges every socket to [`@stone-js/realtime`](https://www.npmjs.com/package/@stone-js/realtime): each connection is added to the shared connection store (so `broadcast` reaches it) and its lifecycle (connect, subscribe, unsubscribe, message, error, disconnect) is dispatched into the realtime router, firing your `@On*` gateways. Data frames can optionally run through the Stone.js kernel too. The core is never touched: this adapter is pure Integration.

---

## Installation

```bash
npm install @stone-js/node-ws-adapter

# the WebSocket server (optional peer, imported lazily):
npm install ws
```

> Peer dependencies: `@stone-js/core` and `@stone-js/realtime`. `ws` is an optional peer, imported lazily when the server starts.

## Enable it

```ts
import { StoneApp } from '@stone-js/core'
import { Realtime } from '@stone-js/realtime'
import { NodeWs } from '@stone-js/node-ws-adapter'

@NodeWs({ url: 'ws://localhost:8080' })
@Realtime({ driver: 'memory' })
@StoneApp({ name: 'app' })
export class Application {}
```

That is all: connect a client, subscribe to a channel, and `broadcast` from anywhere reaches it.

```ts
import { RealtimeGateway, OnConnect, OnEvent, connectionOf } from '@stone-js/realtime'

@RealtimeGateway()
export class Chat {
  constructor (private readonly realtime) {}

  @OnConnect() onConnect (_, event) { const connection = connectionOf(event) /* … */ }

  @OnEvent('room:1', 'message')
  async onMessage (payload, event) {
    await this.realtime.to('room:1').emit('message', payload)
  }
}
```

## How it works

- The adapter runs a `ws` server bound to `stone.adapter.url` (default `ws://localhost:8080`).
- Each accepted socket becomes a realtime `Connection` with a `send`, added to the shared connection store.
- Control frames (`{ type: 'subscribe' | 'unsubscribe', channel }`) update presence.
- Every socket event is normalized into an `IncomingEvent`, keyed by its lifecycle or `event:channel:event` key, and run through the kernel, where the light key-router routes it to the matching `@On*` gateway. If a gateway returns content, it is sent back to the sender.

## Configuration

| key                             | default              | notes                                             |
| ------------------------------- | -------------------- | ------------------------------------------------- |
| `stone.adapter.url`             | `ws://localhost:8080`| The bind URL (host + port).                       |
| `stone.adapter.server`          | `{}`                 | Options passed to the `ws` `WebSocketServer`.     |
| `stone.adapter.serverFactory`   | `undefined`          | Inject a custom/fake server (tests, attach to an http server). |

## License

[MIT](./LICENSE)
