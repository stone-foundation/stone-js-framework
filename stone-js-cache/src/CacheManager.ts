import { CacheStore } from './declarations'
import { CacheError } from './errors/CacheError'

/**
 * A factory that lazily builds a {@link CacheStore} (so a store is only constructed when first
 * used, e.g. a Redis client is not created until the `redis` store is accessed).
 */
export type CacheStoreThunk = () => CacheStore

/**
 * Multi-store cache registry.
 *
 * Application code resolves a store by name (`cacheManager.store('redis')`) and talks to it through
 * the agnostic {@link CacheStore} contract, so the concrete backend is a registration detail. A
 * `memory` store is registered by default. The manager also exposes a process-wide default instance
 * so the method decorators (`@Cacheable`, `@CacheEvict`, `@CachePut`) can reach it without wiring.
 */
export class CacheManager {
  private static current?: CacheManager

  private defaultStore: string
  private readonly stores = new Map<string, CacheStore>()
  private readonly factories = new Map<string, CacheStoreThunk>()

  /**
   * Create a CacheManager.
   *
   * @param defaultStore - The name of the default store.
   * @returns A new CacheManager.
   */
  static create (defaultStore: string = 'memory'): CacheManager {
    return new this(defaultStore)
  }

  /**
   * @param defaultStore - The name of the default store.
   */
  constructor (defaultStore: string = 'memory') {
    this.defaultStore = defaultStore
  }

  /**
   * Register (or replace) the process-wide default manager used by the method decorators.
   *
   * @param manager - The manager instance (or `undefined` to clear).
   */
  static setInstance (manager?: CacheManager): void {
    CacheManager.current = manager
  }

  /**
   * The process-wide default manager, if the cache module has been booted.
   *
   * @returns The manager, or `undefined`.
   */
  static getInstance (): CacheManager | undefined {
    return CacheManager.current
  }

  /**
   * Register a ready-made store instance.
   *
   * @param name - The store name.
   * @param store - The store instance.
   * @returns This manager for chaining.
   */
  register (name: string, store: CacheStore): this {
    this.stores.set(name, store)
    return this
  }

  /**
   * Register a lazy factory for a store (built on first access).
   *
   * @param name - The store name.
   * @param factory - The store factory.
   * @returns This manager for chaining.
   */
  registerFactory (name: string, factory: CacheStoreThunk): this {
    this.factories.set(name, factory)
    return this
  }

  /**
   * Set the default store name.
   *
   * @param name - The store name.
   * @returns This manager for chaining.
   */
  setDefaultStore (name: string): this {
    this.defaultStore = name
    return this
  }

  /**
   * Resolve a store by name (defaults to the default store).
   *
   * @param name - The store name.
   * @returns The resolved {@link CacheStore}.
   * @throws {CacheError} When no store/factory is registered under the name.
   */
  store (name?: string): CacheStore {
    const storeName = name ?? this.defaultStore

    const existing = this.stores.get(storeName)
    if (existing !== undefined) { return existing }

    const factory = this.factories.get(storeName)
    if (factory === undefined) {
      throw new CacheError(`No cache store registered under "${storeName}".`)
    }

    const store = factory()
    this.stores.set(storeName, store)
    return store
  }

  /**
   * Whether a store (instance or factory) is registered under the name.
   *
   * @param name - The store name.
   * @returns True if registered.
   */
  has (name: string): boolean {
    return this.stores.has(name) || this.factories.has(name)
  }
}
