# Stone.js - Key Router

[![npm](https://img.shields.io/npm/l/@stone-js/key-router)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@stone-js/key-router)](https://www.npmjs.com/package/@stone-js/key-router)
[![npm](https://img.shields.io/npm/dm/@stone-js/key-router)](https://www.npmjs.com/package/@stone-js/key-router)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![Build Status](https://github.com/stone-foundation/stone-js-key-router/actions/workflows/main.yml/badge.svg)](https://github.com/stone-foundation/stone-js-key-router/actions/workflows/main.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-key-router&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-key-router)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

The small sibling of [`@stone-js/router`](https://www.npmjs.com/package/@stone-js/router): a **minimal key-to-handler router**. No paths, params, constraints or groups, just "this key maps to this handler". It is the reusable core behind job dispatch (job name → handler), realtime events (event name → handler), CLI commands (command → handler), and any simple adapter that keys work by an event type.

---

## Installation

```bash
npm install @stone-js/key-router
```

> Peer dependency: `@stone-js/core` (for the decorator metadata helpers).

## The registry

```ts
import { KeyRouter } from '@stone-js/key-router'

const router = KeyRouter.create()

router.register('send-email', async (payload) => { /* … */ })     // a function
router.register('resize', new ResizeImage())                       // an object with `handle()`
router.register('report', new ReportJob(), 'run')                  // a custom action method

router.has('send-email')            // true
await router.dispatch('send-email', { to: 'a@b.c' })               // resolve + invoke
```

`resolve(key)` throws a `KeyRouterError` when nothing is registered; `tryResolve(key)` returns `undefined`.

## Decorator discovery

Build your own named decorator for method-level handlers, backed by class metadata:

```ts
import { createKeyDecorator, collectKeyHandlers } from '@stone-js/key-router'

const JOB_KEY = Symbol('app.jobs')
export const OnJob = createKeyDecorator(JOB_KEY)

class Jobs {
  @OnJob('send-email') sendEmail (payload) { /* … */ }
  @OnJob('resize')     resize (payload) { /* … */ }
}

// later, in a provider: read what the class declared and register it
for (const { key, action } of collectKeyHandlers(Jobs, JOB_KEY)) {
  router.register(key, container.make(Jobs), action)
}
```

Imperative registration uses meta-modules:

```ts
import { defineKeyHandler } from '@stone-js/key-router'

defineKeyHandler('send-email', SendEmail, { isClass: true })
defineKeyHandler('ping', () => 'pong')
```

## Used by

`@stone-js/queue` (`@JobHandler`/`@OnJob`), `@stone-js/realtime` (`@OnEvent`/`@OnMessage`), the CLI adapter (commands), and simple event-driven adapters.

## License

[MIT](./LICENSE)
