import { CacheManager } from '../src/CacheManager'
import { CacheError } from '../src/errors/CacheError'
import { CacheServiceProvider } from '../src/CacheServiceProvider'

const makeContainer = (config: any): any => {
  const container: any = {
    make: vi.fn(() => ({ get: vi.fn(() => config) })),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container),
    singletonIf: vi.fn(() => container)
  }
  return container
}

const managerArg = (container: any): CacheManager => container.instanceIf.mock.calls[0][1]
const cacheFactory = (container: any): (() => unknown) =>
  container.singletonIf.mock.calls.find((c: any[]) => c[0] === 'cache')[1]

describe('CacheServiceProvider', () => {
  afterEach(() => { CacheManager.setInstance(undefined) })

  it('binds the manager as `cacheManager`, the default store as `cache`, and publishes the instance', () => {
    const container = makeContainer({ default: 'redis', stores: [{ name: 'redis', driver: 'redis', url: 'redis://x' }] })

    new CacheServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(CacheManager, expect.any(CacheManager))
    expect(container.alias).toHaveBeenCalledWith(CacheManager, ['cacheManager'])
    expect(container.singletonIf).toHaveBeenCalledWith('cache', expect.any(Function))

    const manager = managerArg(container)
    expect(manager.has('redis')).toBe(true)
    expect(manager.has('memory')).toBe(true) // always-available default
    expect(manager.store('redis').name).toBe('redis')
    expect(CacheManager.getInstance()).toBe(manager)
  })

  it('is zero-config: the default memory store resolves as `cache`', () => {
    const container = makeContainer({})
    new CacheServiceProvider(container).register()
    const store: any = cacheFactory(container)()
    expect(store.name).toBe('memory')
  })

  it('registers a configured memory store', () => {
    const container = makeContainer({ stores: [{ name: 'ram', driver: 'memory' }] })
    new CacheServiceProvider(container).register()
    expect(managerArg(container).store('ram').name).toBe('ram')
  })

  it('throws for an unknown driver', () => {
    const container = makeContainer({ stores: [{ name: 'x', driver: 'memcached' }] })
    expect(() => new CacheServiceProvider(container).register()).toThrow(CacheError)
  })
})

describe('a cached value has to outlive the event that computed it', () => {
  afterEach(() => { CacheManager.setInstance(undefined) })

  it('keeps what it stored across container rebuilds, because the values belong to the store', async () => {
    // The bug this pins was total and silent: everything, the manager and the store with it, was
    // rebuilt for every event, so the memory store was empty on arrival every single time. Measured
    // on a real Node HTTP server, `get` after `set` returned nothing on the next request and
    // `remember` recomputed forever while reporting nothing wrong.
    //
    // What changed is *where* the values live, not how long the container lives. The container is
    // still an execution context rebuilt per event, and so is the manager. Cached values belong to
    // the store the application chose, which is the persistence boundary.
    const config = {}

    const first = makeContainer(config)
    new CacheServiceProvider(first).register()
    await managerArg(first).store().set('k', 'v', { ttl: 300 })

    const second = makeContainer(config)
    new CacheServiceProvider(second).register()

    await expect(managerArg(second).store().get('k')).resolves.toBe('v')
  })

  it('builds a new manager for every container, like everything else in it', () => {
    // The framework keeps nothing between events, and this module adds no exception to that. A
    // manager is a registry of factories: rebuilding it costs nothing and keeps the execution
    // context ephemeral, which is what makes a cold start a clean start.
    const config = {}

    const first = makeContainer(config)
    new CacheServiceProvider(first).register()

    const second = makeContainer(config)
    new CacheServiceProvider(second).register()

    expect(managerArg(second)).not.toBe(managerArg(first))
  })

  it('keeps two named memory stores apart', async () => {
    // Naming the store is what separates them, exactly as a prefix separates two Redis stores.
    const container = makeContainer({ stores: [{ name: 'one', driver: 'memory' }, { name: 'two', driver: 'memory' }] })

    new CacheServiceProvider(container).register()
    const manager = managerArg(container)

    await manager.store('one').set('k', 'from one', { ttl: 300 })

    await expect(manager.store('one').get('k')).resolves.toBe('from one')
    await expect(manager.store('two').get('k')).resolves.toBeUndefined()

    await manager.store('one').clear()
  })
})
