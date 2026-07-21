# Stone.js - Event Bus

[![npm](https://img.shields.io/npm/l/@stone-js/event-bus)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/event-bus)](https://www.npmjs.com/package/@stone-js/event-bus)
[![npm](https://img.shields.io/npm/dm/@stone-js/event-bus)](https://www.npmjs.com/package/@stone-js/event-bus)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-event-bus/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-event-bus/actions/workflows/main.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-event-bus&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-event-bus)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Agnostic cloud event bus for Stone.js.** `emit` on one side, `@OnBusEvent` on the other. The core `EventEmitter` already handles in-process events; this module handles the cloud: publish domain events to `local` and/or `cloud` targets, and route incoming bus events to their handlers via the `key-router`, on **any** simple cloud adapter (AWS Lambda, GCP, Azure...). No dedicated adapter: the listener side injects itself as the kernel event handler, exactly like `@stone-js/router`. The core is never touched.

---

## Installation

```bash
npm install @stone-js/event-bus

# the EventBridge driver (optional peer, imported lazily):
npm install @aws-sdk/client-eventbridge
```

> Peer dependency: `@stone-js/core`. `@aws-sdk/client-eventbridge` is an optional peer, imported lazily.

## Emit

```ts
import { StoneApp } from '@stone-js/core'
import { EventBus } from '@stone-js/event-bus'

@EventBus({ driver: 'eventbridge', source: 'my.app' })
@StoneApp({ name: 'orders' })
export class Application {}
```

`eventBus` is injected. Emit to the default targets, or pick them per call:

```ts
export class OrderService {
  constructor (private readonly eventBus) {}

  async ship (order) {
    // reaches in-process listeners AND the cloud bus: same code, monolith or distributed
    await this.eventBus.emit('order.shipped', { id: order.id }, { targets: ['local', 'cloud'] })
  }
}
```

- `local` uses the app's own `EventEmitter` (used, never modified).
- `cloud` publishes through the driver (EventBridge `PutEvents`).

## Listen (on any cloud adapter)

The listener side is the light key-router from `@stone-js/router`: `@BusListener`, `@BusHandler` and
`@OnBusEvent` are bus-flavoured aliases of `@KeyRouting`, `@KeyHandler` and `@OnKey`. It installs
itself as the kernel event handler and plugs onto a simple cloud adapter (here AWS Lambda); the
adapter receives the event, the light router routes it to the handler.

```ts
import { StoneApp } from '@stone-js/core'
import { AwsLambda } from '@stone-js/aws-lambda-adapter'
import { BusListener, BusHandler, OnBusEvent } from '@stone-js/event-bus'

@BusListener({ source: 'detail-type' })   // which incoming property carries the routing key
@AwsLambda()
@StoneApp({ name: 'consumer' })
export class Application {}

@BusHandler()
export class Orders {
  @OnBusEvent('order.shipped')   async onShipped (payload) { /* … */ }
  @OnBusEvent('order.cancelled') async onCancelled (payload) { /* … */ }
}
```

The routing-key `source` defaults to `detail-type` (where the EventBridge driver puts the event name,
so the pair round-trips). It is not hard-coded: set another property, or pass a full `extractor`
via `@BusListener({ extractor })` for any bus shape.

## Drivers

| driver        | backing       | notes                                                          |
| ------------- | ------------- | -------------------------------------------------------------- |
| `local`       | built-in      | The app's `EventEmitter`. In-process delivery.                 |
| `memory`      | built-in      | Records emitted messages (tests / local dev).                  |
| `eventbridge` | AWS SDK       | `PutEvents` (Source / DetailType / Detail). Rules fan out to consumers. |

## License

[MIT](./LICENSE)
