import { windowOf } from '../utils'
import { LimiterConfig, RateLimiter, RateLimitHit } from '../declarations'

/** What an unconfigured memory limiter is, as one value rather than a literal rebuilt per call. */
const DEFAULT_CONFIG: LimiterConfig = { name: 'memory' }

/**
 * The counters, held by the store rather than by anything the framework owns.
 *
 * This is the one place inter-request state may live, and it lives here because **a store is the
 * persistence boundary**: choosing this driver is choosing where the counting is kept. Everything
 * else in Stone.js is rebuilt for every event, deliberately, and nothing in the framework offers a
 * place to keep things across them.
 *
 * Keyed by the limiter's configured name, so two limiters both backed by memory count separately,
 * exactly as two Redis limiters with different prefixes would.
 */
const backings = new Map<string, Map<string, { count: number, resetAt: number }>>()

/** The map a named limiter counts in, created the first time that name is used. */
function backingFor (name: string): Map<string, { count: number, resetAt: number }> {
  const existing = backings.get(name)

  if (existing !== undefined) { return existing }

  const created = new Map<string, { count: number, resetAt: number }>()
  backings.set(name, created)

  return created
}

/**
 * Fixed-window limiter counting in this process. The zero-config default, and the right one for a
 * single server.
 *
 * **It is not a limit on a function-as-a-service deployment, and that is worth saying plainly.** Each
 * instance counts on its own, so a budget of three allows three per warm container, resets on every
 * cold start, and grants the whole budget again to every new instance. Under the traffic that
 * warrants a limiter at all, that is no limiter. Configure a shared one there, or register your own
 * with `limiters: [{ name, factory }]`.
 */
export class MemoryRateLimiter implements RateLimiter {
  private lastSweep = Date.now()
  private readonly buckets: Map<string, { count: number, resetAt: number }>

  /**
   * @param config - Names the limiter, which is what its counters are filed under.
   * @returns A limiter.
   */
  static create (config: LimiterConfig = DEFAULT_CONFIG): MemoryRateLimiter {
    return new this(config.name ?? 'memory')
  }

  constructor (name: string = 'memory') {
    // The instance is rebuilt with the container, on every event. The counting is not, because it is
    // the store's, and a limiter that started again on every request would refuse nothing at all.
    this.buckets = backingFor(name)
  }

  /**
   * Count one hit and say whether it may proceed.
   *
   * @param key - What the budget belongs to.
   * @param limit - How many hits the window allows.
   * @param windowMs - How long the window lasts.
   * @returns The verdict.
   */
  async hit (key: string, limit: number, windowMs: number): Promise<RateLimitHit> {
    const now = Date.now()

    this.sweepOccasionally(now)

    const existing = this.buckets.get(key)

    if (existing === undefined || existing.resetAt <= now) {
      const { resetAt } = windowOf(now, windowMs)
      this.buckets.set(key, { count: 1, resetAt })

      return { allowed: limit >= 1, resetAt, remaining: Math.max(0, limit - 1) }
    }

    // Counted before the verdict, like the conditional write a shared driver performs: a refused
    // request still consumed an attempt, which is what makes a retry storm hit the same wall instead
    // of buying itself a fresh budget by being refused.
    existing.count += 1

    return {
      allowed: existing.count <= limit,
      resetAt: existing.resetAt,
      remaining: Math.max(0, limit - existing.count)
    }
  }

  /**
   * Forget everything counted so far.
   *
   * A store that can only grow is not a store. Mostly for a test that wants a clean slate: an
   * application calling this mid-flight is handing every caller a fresh budget.
   */
  clear (): void {
    this.buckets.clear()
  }

  /** Drop expired buckets now and then, so the map cannot grow forever. */
  private sweepOccasionally (now: number): void {
    if (now - this.lastSweep < 60_000) { return }

    this.lastSweep = now

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) { this.buckets.delete(key) }
    }
  }
}
