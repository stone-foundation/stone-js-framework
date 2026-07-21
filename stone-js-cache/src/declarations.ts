/**
 * Options for writing a value to the cache.
 */
export interface CacheSetOptions {
  /** Time to live, in seconds. `0`/omitted means no expiry. */
  ttl?: number
  /** Tags to associate with the key, for grouped invalidation. */
  tags?: string[]
}

/**
 * The agnostic cache store contract.
 *
 * A single backend (memory, Redis, a provider KV) implements it; application code depends only on
 * this interface, so switching or mixing stores is configuration, not code. Values are structured
 * (serialized by drivers that need it); TTLs are in seconds.
 */
export interface CacheStore {
  /** A human-readable store name (e.g. `'memory'`, `'redis'`). */
  readonly name: string

  /** Read a value; `undefined` when absent or expired. */
  get: <T = unknown>(key: string) => Promise<T | undefined>

  /** Write a value with optional TTL/tags. */
  set: <T = unknown>(key: string, value: T, options?: CacheSetOptions) => Promise<void>

  /** Whether a (non-expired) value exists. */
  has: (key: string) => Promise<boolean>

  /** Delete a key. Resolves to whether something was removed. */
  delete: (key: string) => Promise<boolean>

  /** Remove everything from the store. */
  clear: () => Promise<void>

  /** Read and delete in one step. */
  pull: <T = unknown>(key: string) => Promise<T | undefined>

  /** Write only if the key is absent. Resolves to whether it was written. */
  add: <T = unknown>(key: string, value: T, options?: CacheSetOptions) => Promise<boolean>

  /** Atomically increment a numeric value (created at `0` when absent). */
  increment: (key: string, amount?: number) => Promise<number>

  /** Atomically decrement a numeric value (created at `0` when absent). */
  decrement: (key: string, amount?: number) => Promise<number>

  /**
   * Return the cached value, or compute it with `factory`, store it, and return it (cache-aside).
   * Concurrent calls for the same key share a single `factory` execution (stampede protection).
   */
  remember: <T = unknown>(key: string, factory: () => Promise<T> | T, options?: CacheSetOptions) => Promise<T>

  /** Invalidate every key associated with any of the given tags. */
  invalidateTags: (tags: string[]) => Promise<void>
}

/**
 * A factory that builds a {@link CacheStore} from disk-like options.
 */
export type CacheStoreFactory = (config: StoreConfig) => CacheStore

/**
 * Built-in driver identifiers. `memory` and `redis` ship now; provider KV follows.
 */
export type CacheDriver = 'memory' | 'redis' | string

/**
 * Options common to every store, plus the driver selector. Driver-specific options live alongside.
 */
export interface StoreConfig {
  /** The store name, used to resolve it via `cacheManager.store(name)`. */
  name: string
  /** Which driver backs this store. */
  driver: CacheDriver
  /** A key prefix/namespace applied to every key in this store. */
  prefix?: string
  /** Default TTL (seconds) applied when a write specifies none. */
  ttl?: number
  /** Driver-specific options (see {@link RedisStoreOptions}). */
  [key: string]: unknown
}

/**
 * Options for the Redis store.
 */
export interface RedisStoreOptions extends StoreConfig {
  /** A Redis connection URL (e.g. `redis://localhost:6379`). */
  url?: string
  /** An existing `ioredis` client to reuse instead of creating one. */
  client?: unknown
  /** Inline `ioredis` options (host/port/password/db/tls…) when no `url`/`client` is given. */
  options?: Record<string, unknown>
}

/** A cache key: a fixed string, or a function of the decorated method's arguments. */
export type CacheKeyOption = string | ((...args: any[]) => string)

/** Options for the `@Cacheable` method decorator. */
export interface CacheableOptions {
  /** The cache key (defaults to `Class.method:<hash(args)>`). */
  key?: CacheKeyOption
  /** Time to live, in seconds. */
  ttl?: number
  /** Tags to associate with the cached value. */
  tags?: string[]
  /** The store to use (defaults to the default store). */
  store?: string
}

/** Options for the `@CacheEvict` method decorator. */
export interface CacheEvictOptions {
  /** The key to delete (defaults to `Class.method:<hash(args)>`). Ignored when `tags`/`all` are set. */
  key?: CacheKeyOption
  /** Invalidate these tags instead of a single key. */
  tags?: string[]
  /** Clear the whole store. */
  all?: boolean
  /** The store to use (defaults to the default store). */
  store?: string
}

/** Options for the `@CachePut` method decorator. */
export interface CachePutOptions {
  /** The key to write (defaults to `Class.method:<hash(args)>`). */
  key?: CacheKeyOption
  /** Time to live, in seconds. */
  ttl?: number
  /** Tags to associate with the cached value. */
  tags?: string[]
  /** The store to use (defaults to the default store). */
  store?: string
}

/**
 * The `stone.cache` configuration bucket.
 */
export interface CacheConfig {
  /** The default store name (resolved by `cacheManager.store()` / injected as `cache`). */
  default?: string
  /** The stores to register. */
  stores?: StoreConfig[]
}
