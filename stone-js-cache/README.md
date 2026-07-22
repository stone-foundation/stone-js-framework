# Stone.js - Cache

[![npm license](https://img.shields.io/npm/l/@stone-js/cache)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/cache)](https://www.npmjs.com/package/@stone-js/cache)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/cache)](https://www.npmjs.com/package/@stone-js/cache)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Agnostic cache for Stone.js.** One store contract (`get`/`set`/`ttl`/`tags`/`remember`), pluggable drivers (memory now, Redis via `ioredis`, provider KV next), decorators (`@Cache`, `@Cacheable`, `@CacheEvict`, `@CachePut`), and a `cacheManager` injected in the container. Zero-config by default, with stampede protection and tag-grouped invalidation.

---

## Installation

```bash
npm install @stone-js/cache

# for the Redis store (optional):
npm install ioredis
```

> Peer dependency: `@stone-js/core`. `ioredis` is an optional peer, imported lazily only when a Redis store is used.

## Enable it

Declarative (single store):

```ts
import { StoneApp } from '@stone-js/core'
import { Cache } from '@stone-js/cache'

@Cache({ driver: 'memory' })
@StoneApp({ name: 'app' })
export class Application {}
```

Imperative / multi-store via `stone.cache`:

```ts
import { defineConfig } from '@stone-js/core'
import { defineCache } from '@stone-js/cache'

export const AppConfig = defineConfig(defineCache({
  default: 'redis',
  stores: [
    { name: 'redis', driver: 'redis', url: 'redis://localhost:6379', prefix: 'app' },
    { name: 'ram', driver: 'memory', ttl: 60 }
  ]
}))
```

## Use the cache

Inject the default store (`cache`) or the manager (`cacheManager`):

```ts
export class ReportService {
  constructor (private readonly cache) {}

  async monthly (year: number) {
    return await this.cache.remember(`report:${year}`, async () => await this.compute(year), { ttl: 300, tags: ['reports'] })
  }
}
```

`get` · `set(key, value, { ttl, tags })` · `has` · `delete` · `clear` · `pull` · `add` · `increment`/`decrement` · `remember(key, factory, { ttl, tags })` · `invalidateTags([...])`.

## Decorators

```ts
class UserService {
  @Cacheable({ ttl: 300, tags: ['users'] })
  async find (id: string) { return await this.repo.get(id) }

  @CachePut({ key: (id) => `User.find:${id}` })
  async update (id: string, data: object) { return await this.repo.save(id, data) }

  @CacheEvict({ tags: ['users'] })
  async purge () { await this.repo.clear() }
}
```

- `@Cacheable` caches the result (cache-aside); concurrent cold calls share one execution.
- `@CachePut` always runs and refreshes the cache.
- `@CacheEvict` invalidates a key, tags, or the whole store after the method runs.

If the cache module is not enabled, the decorators call through with no caching (graceful no-op).

## Documentation

See the [official documentation](https://stonejs.dev/docs/extensions/cache) for the full guide.

## License

[MIT](./LICENSE)
