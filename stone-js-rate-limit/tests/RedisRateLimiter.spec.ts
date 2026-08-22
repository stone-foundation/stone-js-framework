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

  it('resolves its client once, however many hits it counts', async () => {
    // A client per hit means a connection per request, which is the one thing a limiter must not add to
    // a system already under load.
    let reads = 0
    const client = fakeClient()
    const limiter = RedisRateLimiter.create({ name: 'shared', get client () { reads++; return client } })

    await limiter.hit('k', 5, 60_000)
    await limiter.hit('k', 5, 60_000)
    await limiter.hit('k', 5, 60_000)

    expect(reads).toBe(1)
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
