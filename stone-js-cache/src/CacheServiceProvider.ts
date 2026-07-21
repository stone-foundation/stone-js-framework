import { CacheManager } from './CacheManager'
import { CacheError } from './errors/CacheError'
import { MemoryCacheStore } from './drivers/MemoryCacheStore'
import { RedisCacheStore } from './drivers/RedisCacheStore'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { CacheConfig, StoreConfig, CacheStoreFactory } from './declarations'

/**
 * Built-in store factories, keyed by driver name. `memory` needs nothing; `redis` imports `ioredis`
 * lazily as an optional peer dependency.
 */
const DRIVERS: Record<string, CacheStoreFactory> = {
  memory: (config) => MemoryCacheStore.create(config),
  redis: (config) => RedisCacheStore.create(config as any)
}

/**
 * Wires the cache into the container.
 *
 * From `stone.cache` it builds a {@link CacheManager}, registers a lazy factory per configured store
 * (plus a default `memory` store so it works zero-config), publishes the manager as the process-wide
 * default (so the method decorators can reach it), and binds the manager as `cacheManager` and the
 * default store as `cache`: `constructor ({ cache })` or `constructor ({ cacheManager })`.
 */
export class CacheServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the cache services.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<CacheConfig>('stone.cache', {})
    const manager = CacheManager.create(config.default ?? 'memory')

    // Always-available zero-config default.
    manager.registerFactory('memory', () => MemoryCacheStore.create({ name: 'memory' }))

    for (const store of config.stores ?? []) {
      this.registerStore(manager, store)
    }

    // Let the method decorators (@Cacheable/@CacheEvict/@CachePut) reach the manager.
    CacheManager.setInstance(manager)

    this.container
      .instanceIf(CacheManager, manager)
      .alias(CacheManager, ['cacheManager'])
      .singletonIf('cache', () => manager.store())
  }

  /**
   * Register one store's lazy factory on the manager.
   *
   * @param manager - The cache manager.
   * @param store - The store configuration.
   * @throws {CacheError} When the store names an unknown driver.
   */
  private registerStore (manager: CacheManager, store: StoreConfig): void {
    const factory = DRIVERS[store.driver]
    if (factory === undefined) {
      throw new CacheError(`Unknown cache driver "${String(store.driver)}" for store "${store.name}".`)
    }
    manager.registerFactory(store.name, () => factory(store))
  }
}
