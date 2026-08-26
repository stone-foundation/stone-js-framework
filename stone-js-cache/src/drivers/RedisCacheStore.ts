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
/**
 * The clients, by what they connect to.
 *
 * A connection is a **resource**, not state. The memory store holds values because those must
 * survive; a client holds nothing, since the values are in Redis, and rebuilding one loses nothing
 * at all. What it costs is a TCP handshake, and the store is rebuilt with the container on every
 * event: without this, a busy server opens a connection per request and keeps opening them.
 *
 * Keyed by the connection target rather than by the store's name, so two stores pointing at the same
 * Redis share one connection, which is what a connection pool is for.
 */
const clients = new Map<string, Promise<any>>()

/** What identifies a connection: the URL, or the options it would be built from. */
function targetOf (options: RedisStoreOptions): string {
  return typeof options.url === 'string' ? options.url : JSON.stringify(options.options ?? {})
}

export class RedisCacheStore implements CacheStore {
  readonly name: string

  private readonly prefix: string
  private readonly defaultTtl: number
  private readonly options: RedisStoreOptions
  private readonly inflight = new Map<string, Promise<any>>()

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
    const configured = this.options.client

    // A client the application built is the application's to manage, connection included.
    if (configured !== undefined && configured !== null) { return configured }

    const target = targetOf(this.options)
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

  /**
   * Close every connection this store opened, and forget them.
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

  /**
   * Resolve the client from a provided instance, a URL, or inline options.
   *
   * @returns The client.
   * @throws {CacheError} When `ioredis` is not installed.
   */
  private async build (): Promise<any> {
    const IORedis = await import('ioredis').then(resolveModuleDefault).catch(() => {
      throw new CacheError('The Redis store requires "ioredis". Install it: npm i ioredis')
    })

    return typeof this.options.url === 'string'
      ? new IORedis(this.options.url)
      : new IORedis(this.options.options ?? {})
  }
}
