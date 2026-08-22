import { MemoryRateLimiter } from '../src/drivers/MemoryRateLimiter'

describe('the per-process limiter', () => {
  it('allows up to the limit and refuses past it', async () => {
    const limiter = MemoryRateLimiter.create()

    await expect(limiter.hit('k', 2, 60_000)).resolves.toMatchObject({ allowed: true, remaining: 1 })
    await expect(limiter.hit('k', 2, 60_000)).resolves.toMatchObject({ allowed: true, remaining: 0 })
    await expect(limiter.hit('k', 2, 60_000)).resolves.toMatchObject({ allowed: false, remaining: 0 })
  })

  it('counts a refused hit, so a retry storm keeps hitting the same wall', async () => {
    // Counted before the verdict, like the conditional write a shared driver performs: a request that
    // was refused still consumed an attempt, and must not buy a fresh budget by being refused.
    const limiter = MemoryRateLimiter.create()

    await limiter.hit('k', 1, 60_000)
    await limiter.hit('k', 1, 60_000)

    await expect(limiter.hit('k', 1, 60_000)).resolves.toMatchObject({ allowed: false })
  })

  it('keeps one budget per key', async () => {
    const limiter = MemoryRateLimiter.create()

    await limiter.hit('a', 1, 60_000)

    await expect(limiter.hit('b', 1, 60_000)).resolves.toMatchObject({ allowed: true })
  })

  it('starts a fresh budget in the next window', async () => {
    vi.useFakeTimers()
    const limiter = MemoryRateLimiter.create()

    await limiter.hit('k', 1, 1000)
    await expect(limiter.hit('k', 1, 1000)).resolves.toMatchObject({ allowed: false })

    vi.setSystemTime(Date.now() + 2000)

    await expect(limiter.hit('k', 1, 1000)).resolves.toMatchObject({ allowed: true })
    vi.useRealTimers()
  })

  it('says when the window resets, so a refusal can say when to come back', async () => {
    const { resetAt } = await MemoryRateLimiter.create().hit('k', 1, 60_000)

    expect(resetAt).toBeGreaterThan(Date.now())
  })

  it('drops expired buckets, so the map cannot grow forever', async () => {
    vi.useFakeTimers()
    const limiter: any = MemoryRateLimiter.create()

    await limiter.hit('gone', 1, 1000)
    expect(limiter.buckets.size).toBe(1)

    // The sweep runs at most once a minute, so time has to move past both the window and that.
    vi.setSystemTime(Date.now() + 120_000)
    await limiter.hit('other', 1, 1000)

    expect(limiter.buckets.has('gone')).toBe(false)
    vi.useRealTimers()
  })

  it('refuses everything when the limit is zero, rather than letting one through', async () => {
    await expect(MemoryRateLimiter.create().hit('k', 0, 60_000)).resolves.toMatchObject({ allowed: false })
  })
})
