import { RateLimitManager } from './RateLimitManager'
import { MemoryRateLimiter } from './drivers/MemoryRateLimiter'
import { RedisRateLimiter } from './drivers/RedisRateLimiter'
import { RateLimitConfigurationError } from './errors/RateLimitConfigurationError'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { LimiterConfig, RateLimitConfig, RateLimiterFactory } from './declarations'

/** The drivers this package ships. Anything else is a factory the application registered. */
const DRIVERS: Record<string, RateLimiterFactory> = {
  memory: (config) => MemoryRateLimiter.create(config),
  redis: (config) => RedisRateLimiter.create(config as any)
}

/**
 * Builds the limiters and binds the manager.
 *
 * The memory limiter is always registered, so an application that declares a rule and configures
 * nothing still gets one: zero-config, with the per-process caveat written where it will be read.
 */
export class RateLimitServiceProvider implements IServiceProvider {
  constructor (private readonly container: IContainer) {}

  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<RateLimitConfig>('stone.rateLimit', {})
    // The manager already knows `memory`, so an application that declares a rule and configures
    // nothing still gets enforcement.
    const manager = RateLimitManager.create(config.default ?? 'memory')

    for (const limiter of config.limiters ?? []) {
      this.registerLimiter(manager, limiter)
    }

    RateLimitManager.setInstance(manager)

    this.container
      .instanceIf(RateLimitManager, manager)
      .alias(RateLimitManager, ['rateLimit', 'rateLimiter'])
  }

  /**
   * Register one configured limiter, lazily: a driver's client is built when first used, not at boot,
   * so an application that configures Redis for production does not need it running to start locally.
   *
   * @param manager - The manager to register into.
   * @param config - What the application declared.
   */
  private registerLimiter (manager: RateLimitManager, config: LimiterConfig): void {
    const driver = config.driver ?? 'memory'
    const factory = DRIVERS[driver]

    if (factory === undefined) {
      throw new RateLimitConfigurationError(
        `Unknown rate limit driver '${driver}'. Ships with 'memory' and 'redis'; register your own ` +
        'with `RateLimitManager.registerFactory(name, factory)` from a provider, which is how a ' +
        'serverless deployment plugs the store it already runs on.'
      )
    }

    manager.registerFactory(config.name, () => factory(config))
  }
}
