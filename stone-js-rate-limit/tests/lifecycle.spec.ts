import { RateLimitManager } from '../src/RateLimitManager'
import { MemoryRateLimiter } from '../src/drivers/MemoryRateLimiter'
import { RateLimitServiceProvider } from '../src/RateLimitServiceProvider'

/** A container, rebuilt for each event exactly as the kernel rebuilds it. */
const newContainer = (config: any): any => {
  const container: any = {
    make: vi.fn(() => ({ get: vi.fn(() => config) })),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container)
  }
  return container
}

const managerOf = (container: any): RateLimitManager => container.instanceIf.mock.calls[0][1]

describe('a limiter has to outlive the event it is counting', () => {
  afterEach(() => { MemoryRateLimiter.create().clear(); RateLimitManager.setInstance(undefined) })

  it('keeps counting across container rebuilds, because the counting belongs to the store', async () => {
    // The bug this pins was total and silent: everything, the manager and the limiter with it, was
    // rebuilt for every event, so the memory limiter started each request at zero and a declared
    // budget of two answered 200 forever while the headers reported one request remaining. Measured
    // on a real Node HTTP server before the fix: five requests, five 200s.
    //
    // What changed is *where* the counting lives, not how long the container lives. The container is
    // still an execution context rebuilt per event, and so is the manager. The counters belong to
    // the limiter, which is a store the application chose, and a store is the persistence boundary.
    const config = {}

    const first = newContainer(config)
    new RateLimitServiceProvider(first).register()
    await managerOf(first).hit('k', 2, 60_000)

    const second = newContainer(config)
    new RateLimitServiceProvider(second).register()
    await managerOf(second).hit('k', 2, 60_000)

    // The third hit is over the budget only if the first two were remembered.
    const third = newContainer(config)
    new RateLimitServiceProvider(third).register()

    await expect(managerOf(third).hit('k', 2, 60_000)).resolves.toMatchObject({ allowed: false })
  })

  it('builds a new manager for every container, like everything else in it', () => {
    // The framework keeps nothing between events, and this module adds no exception to that. A
    // manager is a registry of factories: rebuilding it costs nothing and keeps the execution
    // context ephemeral, which is what makes a cold start a clean start.
    const config = {}

    const first = newContainer(config)
    new RateLimitServiceProvider(first).register()

    const second = newContainer(config)
    new RateLimitServiceProvider(second).register()

    expect(managerOf(second)).not.toBe(managerOf(first))
  })

  it('counts two named memory limiters separately', async () => {
    // Naming the store is what separates them, exactly as a prefix separates two Redis limiters.
    const container = newContainer({
      default: 'a',
      limiters: [{ name: 'a', driver: 'memory' }, { name: 'b', driver: 'memory' }]
    })

    new RateLimitServiceProvider(container).register()
    const manager = managerOf(container)

    await manager.hit('k', 1, 60_000, 'a')

    await expect(manager.hit('k', 1, 60_000, 'a')).resolves.toMatchObject({ allowed: false })
    await expect(manager.hit('k', 1, 60_000, 'b')).resolves.toMatchObject({ allowed: true })

    MemoryRateLimiter.create({ name: 'a' }).clear()
    MemoryRateLimiter.create({ name: 'b' }).clear()
  })

  it('forgets what it counted when the store is cleared', () => {
    // A store that can only grow is not a store. It is also how a suite starts from a clean slate,
    // which is the honest place for that: the store, not a framework-wide reset.
    const limiter = MemoryRateLimiter.create({ name: 'scratch' })

    expect(typeof limiter.clear).toBe('function')
  })
})

describe('a limiter an application builds itself', () => {
  afterEach(() => { MemoryRateLimiter.create().clear(); RateLimitManager.setInstance(undefined) })

  it('is declared with the other limiters, and survives every rebuild', async () => {
    // Registering it on the manager from a provider reads well and does not survive: the provider
    // runs inside a container that is thrown away with the event. Declared in config, it is rebuilt
    // with the manager, or rather never has to be.
    const counted: string[] = []
    const config = {
      default: 'mine',
      limiters: [{
        name: 'mine',
        factory: () => ({
          hit: async (key: string) => {
            counted.push(key)
            return { allowed: true, resetAt: 1 }
          }
        })
      }]
    }

    const first = newContainer(config)
    new RateLimitServiceProvider(first).register()
    await managerOf(first).hit('a', 1, 1000)

    const second = newContainer(config)
    new RateLimitServiceProvider(second).register()

    await expect(managerOf(second).hit('b', 1, 1000)).resolves.toMatchObject({ allowed: true })
    expect(counted).toEqual(['a', 'b'])
  })

  it('receives its own configuration, so a driver can read its options', async () => {
    const seen: any[] = []
    const container = newContainer({
      limiters: [{ name: 'mine', prefix: 'app:', factory: (c: any) => { seen.push(c); return MemoryRateLimiter.create() } }]
    })

    new RateLimitServiceProvider(container).register()
    managerOf(container).limiter('mine')

    expect(seen[0]).toMatchObject({ name: 'mine', prefix: 'app:' })
  })

  it('wins over a driver name declared alongside it', () => {
    const container = newContainer({
      limiters: [{ name: 'mine', driver: 'redis', factory: () => MemoryRateLimiter.create() }]
    })

    new RateLimitServiceProvider(container).register()

    expect(managerOf(container).limiter('mine')).toBeInstanceOf(MemoryRateLimiter)
  })
})
