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

  it('keeps what it stored across container rebuilds', async () => {
    // The bug this pins was total and silent. The container is an execution context, rebuilt for
    // every event, and the provider used to build a new manager with it, taking the memory store
    // along. So the store was empty on arrival every single time: measured on a real Node HTTP
    // server, `get` after `set` returned nothing on the next request, and `remember` recomputed
    // forever while reporting nothing wrong.
    const config = {}

    const first = makeContainer(config)
    new CacheServiceProvider(first).register()
    await managerArg(first).store().set('k', 'v', { ttl: 300 })

    const second = makeContainer(config)
    new CacheServiceProvider(second).register()

    await expect(managerArg(second).store().get('k')).resolves.toBe('v')
  })

  it('hands every container the same manager', () => {
    const config = {}

    const first = makeContainer(config)
    new CacheServiceProvider(first).register()

    const second = makeContainer(config)
    new CacheServiceProvider(second).register()

    expect(managerArg(second)).toBe(managerArg(first))
  })

  it('starts fresh in a new process, which is where a cache legitimately empties', () => {
    const first = makeContainer({})
    new CacheServiceProvider(first).register()

    // `setInstance(undefined)` is what a new process looks like from here.
    CacheManager.setInstance(undefined)

    const second = makeContainer({})
    new CacheServiceProvider(second).register()

    expect(managerArg(second)).not.toBe(managerArg(first))
  })
})
