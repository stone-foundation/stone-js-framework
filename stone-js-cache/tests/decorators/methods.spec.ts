import { CacheManager } from '../../src/CacheManager'
import { Cacheable } from '../../src/decorators/Cacheable'
import { CachePut } from '../../src/decorators/CachePut'
import { CacheEvict } from '../../src/decorators/CacheEvict'
import { MemoryCacheStore } from '../../src/drivers/MemoryCacheStore'

const ctx = (name: string): any => ({ name, kind: 'method' })

describe('cache method decorators', () => {
  let manager: CacheManager

  beforeEach(() => {
    manager = CacheManager.create('memory').register('memory', MemoryCacheStore.create({ name: 'memory' }))
    CacheManager.setInstance(manager)
  })

  afterEach(() => { CacheManager.setInstance(undefined) })

  describe('@Cacheable', () => {
    it('caches on the default key and reuses it; distinct args recompute', async () => {
      const impl = vi.fn(async (n: number) => n * 2)
      const method = Cacheable()(impl, ctx('double'), {}) as (...a: any[]) => Promise<number>
      const self = { constructor: { name: 'Calc' } }

      expect(await method.call(self, 2)).toBe(4)
      expect(await method.call(self, 2)).toBe(4)
      expect(impl).toHaveBeenCalledTimes(1)

      expect(await method.call(self, 3)).toBe(6)
      expect(impl).toHaveBeenCalledTimes(2)
    })

    it('honours an explicit string key and a function key', async () => {
      const impl = vi.fn(async () => 'v')
      const fixed = Cacheable({ key: 'fixed', ttl: 60 })(impl, ctx('x'), {}) as (...a: any[]) => Promise<string>
      await fixed.call({}, 1)
      await fixed.call({}, 2)
      expect(impl).toHaveBeenCalledTimes(1) // same key regardless of args

      const impl2 = vi.fn(async (id: string) => id)
      const fn = Cacheable({ key: (id: string) => `k:${id}` })(impl2, ctx('y'), {}) as (...a: any[]) => Promise<string>
      expect(await fn.call({}, 'a')).toBe('a')
    })

    it('runs through (no caching) when the cache module is not enabled', async () => {
      CacheManager.setInstance(undefined)
      const impl = vi.fn(async () => 'v')
      const method = Cacheable()(impl, ctx('x'), {}) as (...a: any[]) => Promise<string>
      await method.call({}, 1)
      await method.call({}, 1)
      expect(impl).toHaveBeenCalledTimes(2)
    })
  })

  describe('@CacheEvict', () => {
    it('deletes the configured key after running', async () => {
      await manager.store().set('k', 'v')
      const method = CacheEvict({ key: 'k' })(vi.fn(async () => 'done'), ctx('m'), {}) as (...a: any[]) => Promise<string>
      expect(await method.call({})).toBe('done')
      expect(await manager.store().get('k')).toBeUndefined()
    })

    it('invalidates tags when given', async () => {
      await manager.store().set('a', 1, { tags: ['t'] })
      const method = CacheEvict({ tags: ['t'] })(vi.fn(async () => 'done'), ctx('m'), {}) as (...a: any[]) => Promise<string>
      await method.call({})
      expect(await manager.store().get('a')).toBeUndefined()
    })

    it('clears the whole store when all is set', async () => {
      await manager.store().set('a', 1)
      const method = CacheEvict({ all: true })(vi.fn(async () => 'done'), ctx('m'), {}) as (...a: any[]) => Promise<string>
      await method.call({})
      expect(await manager.store().get('a')).toBeUndefined()
    })

    it('deletes the default key when no options are given', async () => {
      const self = { constructor: { name: 'Svc' } }
      // Prime the same default key @Cacheable would write.
      const cacheable = Cacheable()(vi.fn(async () => 'v'), ctx('m'), {}) as (...a: any[]) => Promise<string>
      await cacheable.call(self, 1)
      const evict = CacheEvict()(vi.fn(async () => 'done'), ctx('m'), {}) as (...a: any[]) => Promise<string>
      await evict.call(self, 1)
      const recomputed = vi.fn(async () => 'again')
      const again = Cacheable()(recomputed, ctx('m'), {}) as (...a: any[]) => Promise<string>
      await again.call(self, 1)
      expect(recomputed).toHaveBeenCalledTimes(1) // key was evicted, so it recomputed
    })

    it('runs through when the cache module is not enabled', async () => {
      CacheManager.setInstance(undefined)
      const impl = vi.fn(async () => 'done')
      const method = CacheEvict({ key: 'k' })(impl, ctx('m'), {}) as (...a: any[]) => Promise<string>
      expect(await method.call({})).toBe('done')
    })
  })

  describe('@CachePut', () => {
    it('always runs and writes the result to the cache', async () => {
      const impl = vi.fn(async (id: string) => ({ id }))
      const method = CachePut({ key: (id: string) => `user:${id}`, ttl: 60 })(impl, ctx('update'), {}) as (...a: any[]) => Promise<object>
      expect(await method.call({}, 'u1')).toEqual({ id: 'u1' })
      expect(await manager.store().get('user:u1')).toEqual({ id: 'u1' })
    })

    it('runs through when the cache module is not enabled', async () => {
      CacheManager.setInstance(undefined)
      const impl = vi.fn(async () => 'done')
      const method = CachePut({ key: 'k' })(impl, ctx('m'), {}) as (...a: any[]) => Promise<string>
      expect(await method.call({})).toBe('done')
    })
  })
})
