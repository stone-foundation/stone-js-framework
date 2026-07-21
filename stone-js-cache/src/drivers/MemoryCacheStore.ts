import { singleFlight } from '../utils'
import { CacheStore, CacheSetOptions, StoreConfig } from '../declarations'

/** A stored entry with an optional absolute expiry (epoch ms). */
interface Entry {
  value: unknown
  expiresAt?: number
}

/**
 * In-process memory cache store.
 *
 * The zero-config default: a `Map` with per-key TTL, tag-grouped invalidation, atomic-enough
 * counters and stampede protection. Fast and dependency-free; scoped to a single process (use the
 * Redis store to share across instances).
 */
export class MemoryCacheStore implements CacheStore {
  readonly name: string

  private readonly prefix: string
  private readonly defaultTtl: number
  private readonly store = new Map<string, Entry>()
  private readonly tagIndex = new Map<string, Set<string>>()
  private readonly inflight = new Map<string, Promise<any>>()

  /**
   * Create a memory store.
   *
   * @param config - The store options.
   * @returns A new store.
   */
  static create (config: Partial<StoreConfig> = {}): MemoryCacheStore {
    return new this(config)
  }

  /**
   * @param config - The store options.
   */
  constructor (config: Partial<StoreConfig> = {}) {
    this.name = config.name ?? 'memory'
    this.prefix = config.prefix ?? ''
    this.defaultTtl = config.ttl ?? 0
  }

  /** @inheritdoc */
  async get <T = unknown>(key: string): Promise<T | undefined> {
    const entry = this.store.get(this.k(key))
    if (entry === undefined) { return undefined }
    if (this.isExpired(entry)) { this.store.delete(this.k(key)); return undefined }
    return entry.value as T
  }

  /** @inheritdoc */
  async set <T = unknown>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    const ttl = options.ttl ?? this.defaultTtl
    const fullKey = this.k(key)
    this.store.set(fullKey, { value, expiresAt: ttl > 0 ? Date.now() + ttl * 1000 : undefined })
    for (const tag of options.tags ?? []) {
      const set = this.tagIndex.get(tag) ?? new Set<string>()
      set.add(fullKey)
      this.tagIndex.set(tag, set)
    }
  }

  /** @inheritdoc */
  async has (key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined
  }

  /** @inheritdoc */
  async delete (key: string): Promise<boolean> {
    return this.store.delete(this.k(key))
  }

  /** @inheritdoc */
  async clear (): Promise<void> {
    this.store.clear()
    this.tagIndex.clear()
  }

  /** @inheritdoc */
  async pull <T = unknown>(key: string): Promise<T | undefined> {
    const value = await this.get<T>(key)
    await this.delete(key)
    return value
  }

  /** @inheritdoc */
  async add <T = unknown>(key: string, value: T, options: CacheSetOptions = {}): Promise<boolean> {
    if (await this.has(key)) { return false }
    await this.set(key, value, options)
    return true
  }

  /** @inheritdoc */
  async increment (key: string, amount: number = 1): Promise<number> {
    const fullKey = this.k(key)
    const entry = this.store.get(fullKey)
    const valid = entry !== undefined && !this.isExpired(entry)
    const current = valid && typeof entry?.value === 'number' ? entry.value : 0
    const next = current + amount
    this.store.set(fullKey, { value: next, expiresAt: valid ? entry?.expiresAt : undefined })
    return next
  }

  /** @inheritdoc */
  async decrement (key: string, amount: number = 1): Promise<number> {
    return await this.increment(key, -amount)
  }

  /** @inheritdoc */
  async remember <T = unknown>(key: string, factory: () => Promise<T> | T, options: CacheSetOptions = {}): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== undefined) { return cached }
    return await singleFlight(this.inflight, this.k(key), async () => {
      const value = await factory()
      await this.set(key, value, options)
      return value
    })
  }

  /** @inheritdoc */
  async invalidateTags (tags: string[]): Promise<void> {
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag)
      if (keys === undefined) { continue }
      for (const fullKey of keys) { this.store.delete(fullKey) }
      this.tagIndex.delete(tag)
    }
  }

  /**
   * Apply the store's key prefix.
   *
   * @param key - The bare key.
   * @returns The prefixed key.
   */
  private k (key: string): string {
    return this.prefix.length > 0 ? `${this.prefix}:${key}` : key
  }

  /**
   * Whether an entry has passed its expiry.
   *
   * @param entry - The stored entry.
   * @returns True when expired.
   */
  private isExpired (entry: Entry): boolean {
    return entry.expiresAt !== undefined && Date.now() >= entry.expiresAt
  }
}
