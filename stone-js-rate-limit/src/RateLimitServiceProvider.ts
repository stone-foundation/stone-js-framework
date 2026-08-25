import { RateLimitManager } from './RateLimitManager'
import { MemoryRateLimiter } from './drivers/MemoryRateLimiter'
import { RedisRateLimiter } from './drivers/RedisRateLimiter'
import { RateLimitConfigurationError } from './errors/RateLimitConfigurationError'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { LimiterConfig, RateLimitConfig, RateLimiter, RateLimiterFactory } from './declarations'

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

    // One manager per **process**, not per container.
    //
    // The container is an execution context: it is rebuilt for every event, and providers register
    // again with it. A manager rebuilt on that rhythm takes its counters with it, so the memory
    // limiter starts every request at zero and refuses nothing: a declared budget of two answered
    // 200 forever, with the headers cheerfully reporting one request remaining. Counters have to
    // outlive the event they are counting, by definition, so the manager is process-scoped and the
    // container merely gets a handle on it.
    //
    // It is also what makes a limiter an application registered stay registered.
    const manager = RateLimitManager.getInstance() ?? RateLimitManager.create(config.default ?? 'memory')

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
    // A limiter the application builds itself, declared where the others are. The alternative, which
    // this module used to suggest in the message below, was to register it on the manager from a
    // provider: that reads well and does not survive, because the container the provider runs in is
    // rebuilt for every event.
    if (typeof config.factory === 'function') {
      manager.registerFactory(config.name, () => config.factory?.(config) as RateLimiter)
      return
    }

    const driver = config.driver ?? 'memory'
    const factory = DRIVERS[driver]

    if (factory === undefined) {
      throw new RateLimitConfigurationError(
        `Unknown rate limit driver '${driver}'. Ships with 'memory' and 'redis'. To count in a store ` +
        'this package has never heard of, declare the limiter with a `factory` instead of a `driver`: ' +
        '`limiters: [{ name: \'mine\', factory: () => myLimiter }]`.'
      )
    }

    manager.registerFactory(config.name, () => factory(config))
  }
}
