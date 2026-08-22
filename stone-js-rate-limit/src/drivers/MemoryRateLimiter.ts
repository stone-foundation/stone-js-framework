import { windowOf } from '../utils'
import { LimiterConfig, RateLimiter, RateLimitHit } from '../declarations'

/**
 * Per-process fixed-window limiter. The zero-config default, and the right one for a single server.
 *
 * **Wrong for a function-as-a-service deployment**, and worth saying plainly: each cold instance keeps
 * its own counters, so every new instance grants the full budget again, which is no limit at all under
 * the traffic that warrants one. Configure a shared driver there.
 */
export class MemoryRateLimiter implements RateLimiter {
  private lastSweep = Date.now()
  private readonly buckets = new Map<string, { count: number, resetAt: number }>()

  /**
   * @param _config - Accepted for driver parity; nothing here needs it.
   * @returns A limiter.
   */
  static create (_config: LimiterConfig = { name: 'memory' }): MemoryRateLimiter {
    return new this()
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

  /** Drop expired buckets now and then, so the map cannot grow forever. */
  private sweepOccasionally (now: number): void {
    if (now - this.lastSweep < 60_000) { return }

    this.lastSweep = now

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) { this.buckets.delete(key) }
    }
  }
}
