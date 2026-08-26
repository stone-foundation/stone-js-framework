import { windowOf } from '../utils'
import { RateLimitConfigurationError } from '../errors/RateLimitConfigurationError'
import { RateLimiter, RateLimitHit, RedisLimiterConfig } from '../declarations'

/**
 * The clients, by what they connect to.
 *
 * A connection is a **resource**, not state. The memory driver holds counters because those must
 * survive; a client holds nothing, since the counting is in Redis, and rebuilding one loses nothing
 * at all. What it costs is a TCP handshake, and the driver is rebuilt with the container on every
 * event: without this, a busy server opens a connection per request and keeps opening them.
 *
 * Keyed by the connection target rather than by the limiter's name, so two limiters pointing at the
 * same Redis share one connection, which is what a connection pool is for.
 */
const clients = new Map<string, Promise<any>>()

/** What identifies a connection: the URL, or the options it would be built from. */
function targetOf (config: RedisLimiterConfig): string {
  return typeof config.url === 'string' ? config.url : JSON.stringify(config.options ?? {})
}

/**
 * Shared fixed-window limiter, over Redis.
 *
 * The one to use wherever the application runs as more than one process, which is the case that
 * warrants a limiter at all: per-process counters let every instance grant the full budget again.
 *
 * One round trip per request, and no read. The window index is part of the key, so a new window is a
 * new key that starts at zero, and the counter's own expiry cleans up after it: there is nothing to
 * sweep and nothing to read-modify-write. `INCR` and the expiry travel in one pipeline, because an
 * `INCR` whose `PEXPIRE` never arrived is a counter that never resets, and one lost round trip would
 * lock a caller out of that key forever.
 *
 * `ioredis` is imported lazily and is an optional peer, so this module carries no Redis weight until a
 * Redis limiter is actually configured.
 */
export class RedisRateLimiter implements RateLimiter {
  private readonly prefix: string
  private readonly config: RedisLimiterConfig

  /**
   * @param config - The limiter's configuration.
   * @returns A limiter.
   */
  static create (config: RedisLimiterConfig): RedisRateLimiter {
    return new this(config)
  }

  constructor (config: RedisLimiterConfig) {
    this.config = config
    this.prefix = config.prefix ?? 'ratelimit:'
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
    const { index, resetAt } = windowOf(Date.now(), windowMs)
    const client = await this.client()
    const redisKey = `${this.prefix}${key}:${index}`

    // A minute past the reset, so a clock skew between this process and Redis cannot drop a window
    // that is still being counted against.
    const [count] = await client
      .multi()
      .incr(redisKey)
      .pexpire(redisKey, windowMs + 60_000)
      .exec()
      .then((replies: Array<[Error | null, unknown]>) => replies.map(([, value]) => Number(value)))

    return { allowed: count <= limit, resetAt, remaining: Math.max(0, limit - count) }
  }

  /**
   * Close every connection this driver opened, and forget them.
   *
   * For a graceful shutdown, and for a test that wants none left behind. An application that never
   * calls it loses nothing: the connections go with the process.
   */
  static async disconnect (): Promise<void> {
    const pending = [...clients.values()]

    clients.clear()

    await Promise.all(pending.map(async (client) => {
      await client
        .then(async (c: any) => {
          // Whichever the driver exposes; a client that offers neither is simply dropped.
          const closing = c?.quit?.() ?? c?.disconnect?.()

          if (closing !== undefined && closing !== null) { await closing }
        })
        // A connection that was never opened, or already gone, has nothing to close.
        .catch(() => undefined)
    }))
  }

  /** The client for this configuration, opened once. */
  private async client (): Promise<any> {
    const configured = this.config.client

    // A client the application built is the application's to manage, connection included.
    if (configured !== undefined && configured !== null) { return configured }

    const target = targetOf(this.config)
    const existing = clients.get(target)

    if (existing !== undefined) { return await existing }

    // A failed connection is forgotten rather than remembered: a missing package is a setup mistake
    // that will not fix itself, but a cached rejection would also outlive the fix.
    const created = this.build().catch((error: any) => {
      clients.delete(target)
      throw error
    })

    clients.set(target, created)

    return await created
  }

  /** Build the client from what was configured, or fail saying what is missing. */
  private async build (): Promise<any> {
    const IORedis = await this.loadIORedis()

    return typeof this.config.url === 'string'
      ? new IORedis(this.config.url)
      : new IORedis((this.config.options ?? {}) as any)
  }

  /**
   * Load `ioredis`, an optional peer, and say plainly when it is not there.
   *
   * It ships both a default and a named `Redis` export, and which one a dynamic import lands on
   * depends on the interop the application was built with. Either is fine; neither is a 429, because
   * answering a refusal here would blame the caller for a setup mistake nobody could then find.
   *
   * @returns The client constructor.
   * @throws {RateLimitConfigurationError} When the package is absent or exports neither.
   */
  private async loadIORedis (): Promise<any> {
    const missing = (): never => {
      throw new RateLimitConfigurationError('The Redis limiter requires "ioredis". Install it: npm i ioredis')
    }

    const mod: any = await import('ioredis').catch(missing)

    return mod?.default ?? mod?.Redis ?? missing()
  }
}
