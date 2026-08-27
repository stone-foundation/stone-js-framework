import { MemoryRateLimiter } from './drivers/MemoryRateLimiter'
import { RateLimitConfigurationError } from './errors/RateLimitConfigurationError'
import { RateLimiter, RateLimitHit } from './declarations'

/**
 * Holds the configured limiters and hands one out by name.
 *
 * The same shape every driver-based module in the framework uses: named limiters, a default, and
 * factories so an application can register a driver this package has never heard of. That last part
 * matters more here than elsewhere: a limiter has to live where the application's other state lives,
 * and for a serverless deployment that is often the table it already runs on.
 */
export class RateLimitManager {
  private static current?: RateLimitManager

  private readonly limiters = new Map<string, RateLimiter>()
  private readonly factories = new Map<string, () => RateLimiter>()

  /**
   * @param defaultLimiter - The limiter used when a rule names none.
   * @returns A manager.
   */
  static create (defaultLimiter: string = 'memory'): RateLimitManager {
    return new this(defaultLimiter)
  }

  constructor (private readonly defaultLimiter: string = 'memory') {
    // `memory` is always available, built on first use. Zero-config lives here rather than in the
    // provider so that *every* manager enforces: one reached outside the container would otherwise
    // answer a configuration error to a request that a limit was declared for, which is the one thing
    // a limiter must never do. Configuring a limiter named `memory` replaces it.
    this.factories.set('memory', () => MemoryRateLimiter.create({ name: 'memory' }))
  }

  /** Publish the manager, so code outside the container can reach it. */
  static setInstance (manager?: RateLimitManager): void {
    RateLimitManager.current = manager
  }

  /** The published manager, if there is one. */
  static getInstance (): RateLimitManager | undefined {
    return RateLimitManager.current
  }

  /**
   * Register a built limiter.
   *
   * @param name - The name rules refer to it by.
   * @param limiter - The limiter.
   * @returns This manager.
   */
  register (name: string, limiter: RateLimiter): this {
    this.limiters.set(name, limiter)
    return this
  }

  /**
   * Register a limiter to be built on first use.
   *
   * @param name - The name rules refer to it by.
   * @param factory - How to build it.
   * @returns This manager.
   */
  registerFactory (name: string, factory: () => RateLimiter): this {
    this.factories.set(name, factory)
    return this
  }

  /**
   * The limiter a rule named, or the default.
   *
   * @param name - The limiter's name.
   * @returns The limiter.
   * @throws {RateLimitConfigurationError} When nothing is registered under that name.
   */
  limiter (name: string = this.defaultLimiter): RateLimiter {
    const built = this.limiters.get(name)
    if (built !== undefined) { return built }

    const factory = this.factories.get(name)
    if (factory === undefined) {
      throw new RateLimitConfigurationError(
        `No rate limiter is registered as '${name}'. Configure it under \`stone.rateLimit.limiters\`, ` +
        'or leave the rule without a `limiter` to use the default one.'
      )
    }

    const limiter = factory()
    this.limiters.set(name, limiter)

    return limiter
  }

  /**
   * Count one hit against the named limiter.
   *
   * @param key - What the budget belongs to.
   * @param limit - How many hits the window allows.
   * @param windowMs - How long the window lasts.
   * @param name - Which limiter counts it.
   * @returns The verdict.
   */
  async hit (key: string, limit: number, windowMs: number, name?: string): Promise<RateLimitHit> {
    return await this.limiter(name).hit(key, limit, windowMs)
  }
}

/** What a driver receives when the manager builds it, re-exported for whoever writes one. */
export type { LimiterConfig, RateLimiterFactory } from './declarations'
