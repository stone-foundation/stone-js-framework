# Stone.js - Rate limit

[![npm license](https://img.shields.io/npm/l/@stone-js/rate-limit)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/rate-limit)](https://www.npmjs.com/package/@stone-js/rate-limit)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/rate-limit)](https://www.npmjs.com/package/@stone-js/rate-limit)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Rate limiting for Stone.js.** A budget declared where the route is declared, enforced before authentication, authorization and validation, and counted by a limiter you choose: per process by default, shared through Redis, or a driver of your own for the store your deployment already runs on.

The rule it exists to serve: **throttle the subject, not the address alone.**

---

## Installation

```bash
npm install @stone-js/rate-limit

# for the shared Redis limiter (optional):
npm install ioredis
```

> Peer dependency: `@stone-js/core`. `ioredis` is an optional peer, imported lazily only when a Redis limiter is used.

## Enable it

Declarative:

```ts
import { StoneApp } from '@stone-js/core'
import { RateLimit } from '@stone-js/rate-limit'

@RateLimit()
@StoneApp({ name: 'app' })
export class Application {}
```

Imperative, through `stone.rateLimit`:

```ts
import { defineConfig } from '@stone-js/core'

export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.rateLimit', {
  default: 'shared',
  limiters: [{ name: 'shared', driver: 'redis', url: 'redis://localhost:6379' }],
  trustedAddressHeaders: ['cloudfront-viewer-address']
}))
```

Enabling the module limits nothing on its own. Nothing is throttled until a route says so.

## Declare a budget

On a route, which is the usual place:

```ts
@Post('/auth/code', { rateLimit: { max: 3, window: 900, by: 'email' } })
sendCode (event: IncomingHttpEvent) { … }
```

On a group, which every child inherits:

```ts
@EventHandler('/api', { rateLimit: { max: 100, window: 60, scope: 'api' } })
export class ApiHandler {
  @Get('/notes', { rateLimit: { max: 20, window: 60 } })
  notes (event: IncomingHttpEvent) { … }
}
```

Both budgets are kept: the group's and the route's, counted separately, enforced in that order.

On a handler method, the form that needs no router at all (a command, a queue consumer, a single-handler application):

```ts
class AuthController {
  @Throttle({ max: 3, window: 900, by: 'email' })
  sendCode (event: IncomingEvent) { … }
}
```

Or once, for everything that declares nothing, through `stone.rateLimit.global`.

## What a rule says

| Option | Meaning |
|---|---|
| `max` | How many requests the window allows. |
| `window` | How long the window lasts, in seconds. |
| `by` | What the budget belongs to: a request field (`'email'`), alternatives (`'phone\|email'`, first present wins), `'user'` for the authenticated principal, or `'address'`. Defaults to `'address'`. |
| `backstop` | The per-address bucket that runs alongside a subject budget, as a multiple of `max`. Defaults to ten times. `false` runs the subject budget alone. |
| `scope` | A bucket shared with every rule naming it, instead of one per route. This is how a ceiling spanning several routes is expressed. |
| `limiter` | Which configured limiter counts this rule. |

### Why the subject, and not the address

Throttling by address assumes one address is one person. On mobile networks using carrier-grade NAT, the norm across much of the world, hundreds of unrelated subscribers share one public address. A per-address quota then refuses legitimate users at random, and hardest exactly where the audience is largest.

So the budget belongs to the thing being protected: the account, the mailbox, the phone number. The address keeps a much looser bucket whose only job is to stop one machine enumerating subjects in bulk.

Subjects are hashed before they are used as keys. A key is read by whoever debugs the store, and a mailbox has no business being there.

### Why `scope` exists

A rule declared on a group is copied onto each child, and at enforcement time nothing records which ancestor a rule came from. Unscoped, a group's `max: 100` is therefore a hundred *per child route*. Naming a scope makes it the shared ceiling it looks like, and lets unrelated routes share one budget too.

## Limiters

`memory` is always available, needs no configuration, and counts per process: fine for one instance, and not a limit at all across several, since each grants the whole budget again.

`redis` is the one to use wherever the application runs as more than one process. One round trip per request, no read: the window index is part of the key, so a new window is a new key starting at zero, and the counter expires on its own.

A deployment that already has a store can plug it in, which is how a serverless application counts where its state lives:

```ts
export class TableLimiterProvider implements IServiceProvider {
  constructor (private readonly container: IContainer) {}

  register (): void {
    this.container.make<RateLimitManager>(RateLimitManager)
      .register('table', { hit: async (key, limit, windowMs) => await countInMyTable(key, limit, windowMs) })
  }
}
```

`hit` receives the limit rather than holding it, so an implementation that can refuse atomically through a conditional write has what it needs to express the condition, and pays nothing for a refusal.

## What a caller is told

A refusal answers `429` with `Retry-After`. The error carries its own status, so an HTTP platform answers `429` and a CLI or queue consumer reads `RateLimitError` directly.

While a caller is within its budget, the response carries `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset`, reporting the budget closest to being exceeded. Set `stone.rateLimit.headers` to `false` to publish nothing.

## Addresses behind a proxy

No forwarded header is read unless you name it, because a forwarded header is client-spoofable unless an edge you trust overwrites it, and reading one by default would hand every caller an unlimited supply of identities. Name the one your own edge guarantees, through `trustedAddressHeaders`.

## Documentation

See the [official documentation](https://stonejs.dev/docs/extensions/rate-limit) for the full guide.

## License

[MIT](./LICENSE)
