import { CacheManager } from '../src/CacheManager'
import { CacheError } from '../src/errors/CacheError'
import { MemoryCacheStore } from '../src/drivers/MemoryCacheStore'

describe('CacheManager', () => {
  afterEach(() => { CacheManager.setInstance(undefined) })

  it('throws when resolving an unregistered store', () => {
    expect(() => CacheManager.create().store()).toThrow(CacheError)
  })

  it('builds a factory store once and reuses it', () => {
    const mgr = CacheManager.create('memory')
    const factory = vi.fn(() => MemoryCacheStore.create({ name: 'memory' }))
    mgr.registerFactory('memory', factory)
    expect(mgr.store()).toBe(mgr.store())
    expect(factory).toHaveBeenCalledTimes(1)
    expect(mgr.has('memory')).toBe(true)
    expect(mgr.has('nope')).toBe(false)
  })

  it('registers a ready instance and resolves the default store', () => {
    const store = MemoryCacheStore.create({ name: 'x' })
    const mgr = CacheManager.create().register('x', store).setDefaultStore('x')
    expect(mgr.store()).toBe(store)
    expect(mgr.store('x')).toBe(store)
  })

  it('publishes and clears a process-wide instance', () => {
    const mgr = CacheManager.create()
    CacheManager.setInstance(mgr)
    expect(CacheManager.getInstance()).toBe(mgr)
    CacheManager.setInstance(undefined)
    expect(CacheManager.getInstance()).toBeUndefined()
  })
})
