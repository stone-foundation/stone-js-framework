import { singleFlight, resolveModuleDefault } from '../utils'
import { CacheError } from '../errors/CacheError'
import { CacheStore, CacheSetOptions, RedisStoreOptions } from '../declarations'

/**
 * Redis cache store (via `ioredis`).
 *
 * Shares cache across instances/processes. Values are JSON-serialized; TTLs use native key expiry;
 * tags are tracked in Redis sets so invalidation is a set lookup + delete. `ioredis` is imported
 * **lazily** and is an optional peer dependency, so this module carries no Redis weight until a
 * Redis store is actually used.
 */
export class RedisCacheStore implements CacheStore {
  readonly name: string

  private readonly prefix: string
  private readonly defaultTtl: number
  private readonly options: RedisStoreOptions
  private readonly inflight = new Map<string, Promise<any>>()
  private clientPromise?: Promise<any>

  /**
   * Create a Redis store.
   *
   * @param options - The Redis store options.
   * @returns A new store.
   */
  static create (options: RedisStoreOptions): RedisCacheStore {
    return new this(options)
  }

  /**
   * @param options - The Redis store options.
   */
  constructor (options: RedisStoreOptions) {
    this.options = options
    this.name = options.name ?? 'redis'
    this.prefix = options.prefix ?? ''
    this.defaultTtl = options.ttl ?? 0
  }

  /** @inheritdoc */
  async get <T = unknown>(key: string): Promise<T | undefined> {
    const raw = await (await this.client()).get(this.k(key))
    return this.deserialize<T>(raw)
  }

  /** @inheritdoc */
  async set <T = unknown>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    const ttl = options.ttl ?? this.defaultTtl
    const client = await this.client()
    const payload = JSON.stringify(value)

    if (ttl > 0) {
      await client.set(this.k(key), payload, 'EX', ttl)
    } else {
      await client.set(this.k(key), payload)
    }

    for (const tag of options.tags ?? []) {
      await client.sadd(this.tagKey(tag), this.k(key))
    }
  }

  /** @inheritdoc */
  async has (key: string): Promise<boolean> {
    return await (await this.client()).exists(this.k(key)) === 1
  }

  /** @inheritdoc */
  async delete (key: string): Promise<boolean> {
    return await (await this.client()).del(this.k(key)) > 0
  }

  /** @inheritdoc */
  async clear (): Promise<void> {
    await this.scanDelete(this.k('*'))
  }

  /** @inheritdoc */
  async pull <T = unknown>(key: string): Promise<T | undefined> {
    const value = await this.get<T>(key)
    await this.delete(key)
    return value
  }

  /** @inheritdoc */
  async add <T = unknown>(key: string, value: T, options: CacheSetOptions = {}): Promise<boolean> {
    const ttl = options.ttl ?? this.defaultTtl
    const client = await this.client()
    const payload = JSON.stringify(value)
    const result = ttl > 0
      ? await client.set(this.k(key), payload, 'EX', ttl, 'NX')
      : await client.set(this.k(key), payload, 'NX')

    if (result !== 'OK') { return false }

    for (const tag of options.tags ?? []) {
      await client.sadd(this.tagKey(tag), this.k(key))
    }
    return true
  }

  /** @inheritdoc */
  async increment (key: string, amount: number = 1): Promise<number> {
    const value: number = await (await this.client()).incrby(this.k(key), amount)
    return value
  }

  /** @inheritdoc */
  async decrement (key: string, amount: number = 1): Promise<number> {
    const value: number = await (await this.client()).decrby(this.k(key), amount)
    return value
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
    const client = await this.client()
    for (const tag of tags) {
      const keys: string[] = await client.smembers(this.tagKey(tag))
      if (keys.length > 0) { await client.del(...keys) }
      await client.del(this.tagKey(tag))
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
   * The Redis set key backing a tag.
   *
   * @param tag - The tag name.
   * @returns The tag set key.
   */
  private tagKey (tag: string): string {
    return this.k(`tag:${tag}`)
  }

  /**
   * Parse a stored payload back into a value.
   *
   * @param raw - The raw string from Redis (or `null`).
   * @returns The parsed value, or `undefined` when absent/unparseable.
   */
  private deserialize <T>(raw: string | null): T | undefined {
    if (raw === null || raw === undefined) { return undefined }
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  }

  /**
   * Delete every key matching a glob pattern, using a non-blocking SCAN.
   *
   * @param pattern - The match pattern (e.g. `prefix:*`).
   */
  private async scanDelete (pattern: string): Promise<void> {
    const client = await this.client()
    let cursor = '0'
    do {
      const [next, keys]: [string, string[]] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = next
      if (keys.length > 0) { await client.del(...keys) }
    } while (cursor !== '0')
  }

  /**
   * Lazily build (and memoize) the `ioredis` client.
   *
   * @returns The client.
   * @throws {CacheError} When `ioredis` is not installed.
   */
  private async client (): Promise<any> {
    this.clientPromise = this.clientPromise ?? this.build()
    return await this.clientPromise
  }

  /**
   * Resolve the client from a provided instance, a URL, or inline options.
   *
   * @returns The client.
   * @throws {CacheError} When `ioredis` is not installed.
   */
  private async build (): Promise<any> {
    if (this.options.client !== undefined && this.options.client !== null) {
      return this.options.client
    }

    const IORedis = await import('ioredis').then(resolveModuleDefault).catch(() => {
      throw new CacheError('The Redis store requires "ioredis". Install it: npm i ioredis')
    })

    return typeof this.options.url === 'string'
      ? new IORedis(this.options.url)
      : new IORedis(this.options.options ?? {})
  }
}
