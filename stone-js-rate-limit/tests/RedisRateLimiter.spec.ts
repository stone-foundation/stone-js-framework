import { RedisRateLimiter } from '../src/drivers/RedisRateLimiter'

/** A client that records the pipeline it was given, and answers like Redis does. */
const fakeClient = (counts: number[] = []): any => {
  const calls: Array<[string, ...unknown[]]> = []
  let next = 0

  const pipeline = {
    incr (key: string) { calls.push(['incr', key]); return pipeline },
    pexpire (key: string, ttl: number) { calls.push(['pexpire', key, ttl]); return pipeline },
    async exec () {
      const count = counts[next++] ?? next
      return [[null, count], [null, 1]]
    }
  }

  return { calls, multi: () => pipeline }
}

describe('the shared limiter', () => {
  it('allows up to the limit and refuses past it, on what the counter answers', async () => {
    const client = fakeClient([1, 2, 3])
    const limiter = RedisRateLimiter.create({ name: 'shared', client })

    await expect(limiter.hit('k', 2, 60_000)).resolves.toMatchObject({ allowed: true, remaining: 1 })
    await expect(limiter.hit('k', 2, 60_000)).resolves.toMatchObject({ allowed: true, remaining: 0 })
    await expect(limiter.hit('k', 2, 60_000)).resolves.toMatchObject({ allowed: false, remaining: 0 })
  })

  it('counts in one round trip, with no read', async () => {
    // A read-then-write would be both slower and wrong: two instances reading the same count each
    // decide independently, and the budget doubles.
    const client = fakeClient()

    await RedisRateLimiter.create({ name: 'shared', client }).hit('k', 5, 60_000)

    expect(client.calls.map(([command]: any[]) => command)).toEqual(['incr', 'pexpire'])
  })

  it('sends the expiry with the increment, never after it', async () => {
    // An INCR whose PEXPIRE never arrived is a counter that never resets, and that locks every caller
    // out of the key forever. In one pipeline they cannot come apart.
    const client = fakeClient()

    await RedisRateLimiter.create({ name: 'shared', client }).hit('k', 5, 60_000)

    const [incr, pexpire] = client.calls
    expect(incr[1]).toBe(pexpire[1])
    expect(pexpire[2]).toBeGreaterThan(60_000)
  })

  it('puts the window in the key, so a new window starts at zero on its own', async () => {
    // No sweep, no reset job, no read-modify-write: a new window is a new key, and the old one expires
    // by itself. It also makes every instance agree on the boundary without talking.
    vi.useFakeTimers()
    const client = fakeClient()
    const limiter = RedisRateLimiter.create({ name: 'shared', client })

    await limiter.hit('k', 5, 1000)
    vi.setSystemTime(Date.now() + 5000)
    await limiter.hit('k', 5, 1000)

    const [first, , second] = client.calls
    expect(first[1]).not.toBe(second[1])
    vi.useRealTimers()
  })

  it('prefixes its keys, so several applications can share one Redis', async () => {
    const client = fakeClient()

    await RedisRateLimiter.create({ name: 'shared', client, prefix: 'noowow:' }).hit('k', 5, 60_000)

    expect(String(client.calls[0][1]).startsWith('noowow:k:')).toBe(true)
  })

  it('uses the client it was given, and opens nothing of its own', async () => {
    // A client per hit means a connection per request, which is the one thing a limiter must not add
    // to a system already under load. When one is supplied there is nothing to open at all: the
    // pooling below covers the case where the driver opens its own.
    const client = fakeClient()
    const limiter = RedisRateLimiter.create({ name: 'shared', client })

    await limiter.hit('k', 5, 60_000)
    await limiter.hit('k', 5, 60_000)
    await limiter.hit('k', 5, 60_000)

    expect(client.calls.filter(([command]: any[]) => command === 'incr')).toHaveLength(3)
  })

  it('builds its client from a url, or from options, whichever was configured', async () => {
    vi.resetModules()
    const built: unknown[] = []
    class FakeRedis {
      constructor (arg: unknown) { built.push(arg) }
      multi (): any { return { incr: () => this.multi(), pexpire: () => this.multi(), exec: async () => [[null, 1], [null, 1]] } }
    }
    // Exported as a default, the way ioredis ships it.
    vi.doMock('ioredis', () => ({ default: FakeRedis }))

    const { RedisRateLimiter: Fresh } = await import('../src/drivers/RedisRateLimiter')

    await Fresh.create({ name: 'a', url: 'redis://example:6379' }).hit('k', 1, 1000)
    await Fresh.create({ name: 'b', options: { host: 'example' } }).hit('k', 1, 1000)
    await Fresh.create({ name: 'c' }).hit('k', 1, 1000)

    expect(built).toEqual(['redis://example:6379', { host: 'example' }, {}])

    vi.doUnmock('ioredis')
    vi.resetModules()
  })

  it('takes the named Redis export when the default is not where it landed', async () => {
    // ioredis ships both, and which one a dynamic import lands on depends on the interop the
    // application was built with. That difference must not be the reason a limiter stops limiting.
    vi.resetModules()
    class FakeRedis {
      multi (): any { return { incr: () => this.multi(), pexpire: () => this.multi(), exec: async () => [[null, 1], [null, 1]] } }
    }
    // `default: undefined` is how a mocked namespace says it has none: reading a missing export off
    // the mock proxy is an error, where a real namespace would answer undefined.
    vi.doMock('ioredis', () => ({ default: undefined, Redis: FakeRedis }))

    const { RedisRateLimiter: Fresh } = await import('../src/drivers/RedisRateLimiter')

    await expect(Fresh.create({ name: 'a' }).hit('k', 1, 1000)).resolves.toMatchObject({ allowed: true })

    vi.doUnmock('ioredis')
    vi.resetModules()
  })

  it('says so too when the package is there but exports neither', async () => {
    vi.resetModules()
    vi.doMock('ioredis', () => ({ default: undefined, Redis: undefined }))

    const { RedisRateLimiter: Fresh } = await import('../src/drivers/RedisRateLimiter')
    const { RateLimitConfigurationError: FreshError } = await import('../src/errors/RateLimitConfigurationError')

    await expect(Fresh.create({ name: 'a' }).hit('k', 1, 1000)).rejects.toThrow(FreshError)

    vi.doUnmock('ioredis')
    vi.resetModules()
  })

  it('says a Redis limiter needs ioredis, rather than refusing the request', async () => {
    // Answering 429 for a missing package would blame the caller for a setup mistake, and a limiter
    // that reports the wrong cause is a limiter nobody can debug under load.
    vi.resetModules()
    vi.doMock('ioredis', () => { throw new Error('not installed') })

    // Both from the fresh registry: a class re-evaluated after a module reset is not the same class.
    const { RedisRateLimiter: Fresh } = await import('../src/drivers/RedisRateLimiter')
    const { RateLimitConfigurationError: FreshError } = await import('../src/errors/RateLimitConfigurationError')

    await expect(Fresh.create({ name: 'shared' }).hit('k', 1, 1000)).rejects.toThrow(FreshError)
    await expect(Fresh.create({ name: 'shared' }).hit('k', 1, 1000)).rejects.toThrow(/ioredis/)

    vi.doUnmock('ioredis')
    vi.resetModules()
  })
})

describe('the connection a shared limiter opens', () => {
  afterEach(async () => { await RedisRateLimiter.disconnect() })

  it('is opened once for one target, however many limiters point at it', async () => {
    // The driver is rebuilt with the container, on every event. Without pooling, a busy server opens
    // a TCP connection per request and keeps opening them. A connection is a resource, not state:
    // the counting is in Redis, so reusing one loses nothing and saves a handshake.
    vi.resetModules()
    let built = 0
    class FakeRedis {
      constructor () { built++ }
      multi (): any { return { incr: () => this.multi(), pexpire: () => this.multi(), exec: async () => [[null, 1], [null, 1]] } }
      async quit (): Promise<void> {}
    }
    vi.doMock('ioredis', () => ({ default: FakeRedis }))

    const { RedisRateLimiter: Fresh } = await import('../src/drivers/RedisRateLimiter')

    // Two limiters, two names, one Redis: the same connection.
    await Fresh.create({ name: 'a', url: 'redis://one:6379' }).hit('k', 1, 1000)
    await Fresh.create({ name: 'b', url: 'redis://one:6379' }).hit('k', 1, 1000)

    expect(built).toBe(1)

    // A different target is a different connection.
    await Fresh.create({ name: 'c', url: 'redis://two:6379' }).hit('k', 1, 1000)

    expect(built).toBe(2)

    await Fresh.disconnect()
    vi.doUnmock('ioredis')
    vi.resetModules()
  })

  it('forgets a connection that failed, so a fixed setup is not held to the old failure', async () => {
    vi.resetModules()
    let attempts = 0
    vi.doMock('ioredis', () => { attempts++; throw new Error('not installed') })

    const { RedisRateLimiter: Fresh } = await import('../src/drivers/RedisRateLimiter')

    await expect(Fresh.create({ name: 'a', url: 'redis://x' }).hit('k', 1, 1000)).rejects.toThrow(/ioredis/)
    await expect(Fresh.create({ name: 'a', url: 'redis://x' }).hit('k', 1, 1000)).rejects.toThrow(/ioredis/)

    // Tried again rather than answering a remembered rejection.
    expect(attempts).toBe(2)

    vi.doUnmock('ioredis')
    vi.resetModules()
  })

  it('leaves a client the application built to the application', async () => {
    // Its lifetime is not this driver's business: whoever opened it closes it.
    const client = fakeClient()

    await RedisRateLimiter.create({ name: 'a', client }).hit('k', 1, 1000)
    await RedisRateLimiter.disconnect()

    // Still usable, because nothing here closed it.
    await expect(RedisRateLimiter.create({ name: 'a', client }).hit('k', 1, 1000)).resolves.toBeDefined()
  })
})
