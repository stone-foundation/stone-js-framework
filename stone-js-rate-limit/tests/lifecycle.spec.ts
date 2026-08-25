import { clearProcessScope } from '@stone-js/core'
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
  afterEach(() => { clearProcessScope(); RateLimitManager.setInstance(undefined) })

  it('keeps counting across container rebuilds', async () => {
    // The bug this pins was total and silent: the container is an execution context, rebuilt for
    // every event, and the provider used to build a new manager with it. The memory limiter therefore
    // started every request at zero, so a declared budget of two answered 200 forever while the
    // headers cheerfully reported one request remaining. Measured on a real Node HTTP server before
    // the fix: five requests, five 200s.
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

  it('hands every container the same manager', () => {
    const config = {}

    const first = newContainer(config)
    new RateLimitServiceProvider(first).register()

    const second = newContainer(config)
    new RateLimitServiceProvider(second).register()

    expect(managerOf(second)).toBe(managerOf(first))
  })

  it('starts fresh in a new process, which is where a limiter legitimately resets', () => {
    const first = newContainer({})
    new RateLimitServiceProvider(first).register()

    // Dropping the process scope is what a new process looks like from here.
    clearProcessScope()
    RateLimitManager.setInstance(undefined)

    const second = newContainer({})
    new RateLimitServiceProvider(second).register()

    expect(managerOf(second)).not.toBe(managerOf(first))
  })
})

describe('a limiter an application builds itself', () => {
  afterEach(() => { clearProcessScope(); RateLimitManager.setInstance(undefined) })

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
