import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/cache'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Cache } from '@stone-js/cache'

@Cache({ driver: 'memory' })
@StoneApp({ name: 'app' })
export class Application {}
`

const IMP = `
import { defineConfig } from '@stone-js/core'
import { defineCache } from '@stone-js/cache'

export const AppConfig = defineConfig(defineCache({
  default: 'redis',
  stores: [
    { name: 'redis', driver: 'redis', url: 'redis://localhost:6379', prefix: 'app' },
    { name: 'ram', driver: 'memory', ttl: 60 }
  ]
}))
`

/**
 * Extensions: Cache.
 */
@Page(PATH, { layout: 'docs' })
export class Cache implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Cache',
      description: 'Agnostic caching on one store contract: memory and Redis drivers, remember/tags, cache decorators, and a cacheManager injected in the container.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Cache' />
        <Lead>
          One cache contract, pluggable backends. <code>@stone-js/cache</code> gives you
          <code> get</code>/<code>set</code>/<code>remember</code> with TTL and tags, over a memory
          store (zero-config) or Redis, injected as <code>cache</code>, with decorators to cache method
          results declaratively. Provider KV follows.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/cache
npm i ioredis   # only for the Redis store`}</Code>

        <H2>Enable it</H2>
        <Principle
          principle={
            <p>
              Caching should be a property of the call, not plumbing woven through it. Declare what to
              cache and for how long; let the store handle the rest.
            </p>
          }
          incarnation={
            <p>
              A single {'{'} <code>get</code>, <code>set</code>, <code>remember</code>, <code>invalidateTags</code> {'}'}
              contract backs every driver. The provider binds the manager as <code>cacheManager</code>
              and the default store as <code>cache</code>.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Use it</H3>
        <p>
          Inject the default store as <code>cache</code> (or the manager as <code>cacheManager</code>).
          <code> remember</code> returns the cached value or computes, stores and returns it, and
          concurrent cold calls share one computation (stampede protection).
        </p>
        <Code file='app/ReportService.ts'>{`export class ReportService {
  constructor (private readonly cache) {}

  async monthly (year: number) {
    return await this.cache.remember(
      \`report:\${year}\`,
      async () => await this.compute(year),
      { ttl: 300, tags: ['reports'] }
    )
  }
}`}</Code>

        <H2>Decorators</H2>
        <p>Cache method results without touching their bodies.</p>
        <Code file='app/UserService.ts'>{`import { Cacheable, CacheEvict, CachePut } from '@stone-js/cache'

class UserService {
  @Cacheable({ ttl: 300, tags: ['users'] })
  async find (id: string) { return await this.repo.get(id) }

  @CachePut({ key: (id) => \`User.find:\${id}\` })
  async update (id: string, data: object) { return await this.repo.save(id, data) }

  @CacheEvict({ tags: ['users'] })
  async purge () { await this.repo.clear() }
}`}</Code>
        <PropsTable nameHeader='decorator' rows={[
          { name: '@Cacheable', type: 'method', desc: 'Cache the result (cache-aside). Serves the cache on a hit; distinct arguments key distinct entries.' },
          { name: '@CachePut', type: 'method', desc: 'Always run, then refresh the cached value. Keeps the cache warm after writes.' },
          { name: '@CacheEvict', type: 'method', desc: 'Invalidate a key, tags, or the whole store after the method runs.' }
        ]} />
        <Callout kind='note' title='Plug and play'>
          If the cache module is not enabled, the decorators simply call the method, no caching, never
          a crash. Turn caching on later with one decorator and they start working.
        </Callout>

        <H2>Drivers</H2>
        <PropsTable nameHeader='driver' rows={[
          { name: 'memory', type: 'built-in', desc: 'In-process Map with TTL, tags and counters. The zero-config default; single process.' },
          { name: 'redis', type: 'ioredis', desc: 'Shared across instances. JSON values, native TTL, tags via Redis sets. Set url / options / client.' },
          { name: 'provider KV', type: 'coming next', desc: 'Cloudflare / Vercel KV, same contract.' }
        ]} />

        <SeeAlso links={[
          { title: 'Service container & DI', path: '/docs/foundations/container' },
          { title: 'Service providers', path: '/docs/foundations/providers' },
          { title: 'Cloud File (storage)', path: '/docs/extensions/cloud-file' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
