import { RateLimitManager } from '../src/RateLimitManager'
import { MemoryRateLimiter } from '../src/drivers/MemoryRateLimiter'
import { RedisRateLimiter } from '../src/drivers/RedisRateLimiter'
import { RateLimitServiceProvider } from '../src/RateLimitServiceProvider'
import { RateLimitConfigurationError } from '../src/errors/RateLimitConfigurationError'

const makeContainer = (config: any): any => {
  const container: any = {
    make: vi.fn(() => ({ get: vi.fn(() => config) })),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container)
  }
  return container
}

const managerOf = (container: any): RateLimitManager => container.instanceIf.mock.calls[0][1]

describe('wiring the module up', () => {
  afterEach(() => { RateLimitManager.setInstance(undefined) })

  it('binds the manager and publishes it, so code outside the container can reach it', () => {
    const container = makeContainer({})

    new RateLimitServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(RateLimitManager, expect.any(RateLimitManager))
    expect(container.alias).toHaveBeenCalledWith(RateLimitManager, ['rateLimit', 'rateLimiter'])
    expect(RateLimitManager.getInstance()).toBe(managerOf(container))
  })

  it('is zero-config: a rule that names no limiter gets a working one', async () => {
    // An application that declares a budget and configures nothing still gets enforcement, rather than
    // a configuration error at the first request.
    const container = makeContainer({})

    new RateLimitServiceProvider(container).register()

    await expect(managerOf(container).hit('k', 1, 60_000)).resolves.toMatchObject({ allowed: true })
  })

  it('registers each configured limiter under its name', () => {
    const container = makeContainer({
      limiters: [{ name: 'shared', driver: 'redis', url: 'redis://x' }, { name: 'local', driver: 'memory' }]
    })

    new RateLimitServiceProvider(container).register()
    const manager = managerOf(container)

    expect(manager.limiter('shared')).toBeInstanceOf(RedisRateLimiter)
    expect(manager.limiter('local')).toBeInstanceOf(MemoryRateLimiter)
  })

  it('treats a limiter that names no driver as a memory one', () => {
    const container = makeContainer({ limiters: [{ name: 'local' }] })

    new RateLimitServiceProvider(container).register()

    expect(managerOf(container).limiter('local')).toBeInstanceOf(MemoryRateLimiter)
  })

  it('honours the declared default limiter', () => {
    const container = makeContainer({ default: 'shared', limiters: [{ name: 'shared', driver: 'memory' }] })

    new RateLimitServiceProvider(container).register()

    // Named or unnamed, the rule lands on the same limiter.
    expect(managerOf(container).limiter()).toBe(managerOf(container).limiter('shared'))
  })

  it('builds a limiter on first use, not at boot', () => {
    // A Redis client built at boot means an application configured for production cannot start
    // locally. The driver is constructed here, but its client is not, and a limiter never used costs
    // nothing at all.
    const container = makeContainer({ limiters: [{ name: 'shared', driver: 'redis', url: 'redis://nowhere:1' }] })

    expect(() => new RateLimitServiceProvider(container).register()).not.toThrow()
  })

  it('refuses an unknown driver at setup, where the mistake is', () => {
    const container = makeContainer({ limiters: [{ name: 'x', driver: 'memcached' }] })

    expect(() => new RateLimitServiceProvider(container).register()).toThrow(RateLimitConfigurationError)
  })
})

describe('the manager', () => {
  it('says which limiter is missing rather than answering a wrong verdict', async () => {
    // A rule naming a limiter nobody registered is a setup mistake, and it must not read as either
    // "allowed" or "429": one silently removes the limit, the other blames the caller.
    const manager = RateLimitManager.create()

    await expect(manager.hit('k', 1, 1000, 'ghost')).rejects.toThrow(RateLimitConfigurationError)
    await expect(manager.hit('k', 1, 1000, 'ghost')).rejects.toThrow(/ghost/)
  })

  it('builds a factory-registered limiter once and reuses it', () => {
    // A limiter holds the counters, so building a second one would hand out a second full budget.
    let built = 0
    const manager = RateLimitManager.create()

    manager.registerFactory('lazy', () => { built++; return MemoryRateLimiter.create() })

    expect(manager.limiter('lazy')).toBe(manager.limiter('lazy'))
    expect(built).toBe(1)
  })

  it('lets an application register a driver this package never heard of', async () => {
    // The reason this is not an internal detail: a serverless deployment has to count in the store it
    // already runs on, and that store is not one this package can know about.
    const manager = RateLimitManager.create('table')
    const seen: Array<[string, number, number]> = []

    manager.register('table', {
      hit: async (key, limit, windowMs) => {
        seen.push([key, limit, windowMs])
        return { allowed: false, resetAt: 42 }
      }
    })

    await expect(manager.hit('k', 3, 1000)).resolves.toEqual({ allowed: false, resetAt: 42 })
    expect(seen).toEqual([['k', 3, 1000]])
  })
})
