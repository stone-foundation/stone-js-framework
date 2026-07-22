# Stone.js - Queue

[![npm license](https://img.shields.io/npm/l/@stone-js/queue)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/queue)](https://www.npmjs.com/package/@stone-js/queue)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/queue)](https://www.npmjs.com/package/@stone-js/queue)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Agnostic job queue for Stone.js.** Dispatch work now or later, process it with a worker, retry with backoff, dead-letter failures. One connection contract, pluggable drivers (memory now, Redis via `ioredis`, provider queues next), a `@JobHandler` decorator, and a `queueManager` injected in the container.

---

## Installation

```bash
npm install @stone-js/queue

# for the Redis connection (optional):
npm install ioredis
```

> Peer dependency: `@stone-js/core`. `ioredis` is an optional peer, imported lazily only when a Redis connection is used.

## Enable it

Declarative (single connection):

```ts
import { StoneApp } from '@stone-js/core'
import { Queue } from '@stone-js/queue'

@Queue({ driver: 'redis', url: 'redis://localhost:6379' })
@StoneApp({ name: 'app' })
export class Application {}
```

Imperative / multi-connection via `stone.queue`:

```ts
import { defineConfig } from '@stone-js/core'
import { defineQueue } from '@stone-js/queue'

export const AppConfig = defineConfig(defineQueue({
  default: 'redis',
  connections: [
    { name: 'redis', driver: 'redis', url: 'redis://localhost:6379', prefix: 'jobs' },
    { name: 'sync', driver: 'memory' }
  ]
}))
```

## Dispatch jobs

Inject the default connection (`queue`) or the manager (`queueManager`):

```ts
export class OrderService {
  constructor (private readonly queue) {}

  async checkout (order) {
    await this.queue.dispatch('send-receipt', { orderId: order.id }, { delay: 5, maxAttempts: 3, backoff: 10 })
  }
}
```

## Handle jobs

```ts
import { JobHandler } from '@stone-js/queue'

@JobHandler('send-receipt')
export class SendReceipt {
  constructor (private readonly mailer) {}      // dependency-injected
  async handle (payload: { orderId: string }) { await this.mailer.receipt(payload.orderId) }
}
```

One class can handle several jobs, one method each, with `@OnJob` (a name-less `@JobHandler()` marks the class for scanning):

```ts
import { JobHandler, OnJob } from '@stone-js/queue'

@JobHandler()
export class Jobs {
  @OnJob('resize') async resize (payload) { /* … */ }
  @OnJob('purge')  async purge (payload) { /* … */ }
}
```

Register handlers imperatively too: `defineQueue({ handlers: [ defineJobHandler('send-receipt', SendReceipt, { isClass: true }) ] })`.

## Process jobs

Run the worker in a long-running process (Node). On serverless, the provider adapter invokes per message instead, routing to the same handlers.

```ts
export class Consumer {
  constructor (private readonly worker) {}
  async start () { await this.worker.run({ queues: ['default'], sleep: 1000 }) }
}
```

The worker reserves each job, runs its handler, and acknowledges it; on failure it retries with linear backoff up to `maxAttempts`, then dead-letters.

## Drivers

| driver | backend | notes |
| --- | --- | --- |
| `memory` | in-process | zero-config default; delay, retries, dead-letter; single process |
| `redis` | `ioredis` | shared/reliable; ready LIST + delayed ZSET + processing LIST |
| provider | SQS / Pub/Sub / Azure | coming next, wired to the FaaS adapters |

## Documentation

See the [official documentation](https://stonejs.dev/docs/extensions/queue) for the full guide.

## License

[MIT](./LICENSE)
