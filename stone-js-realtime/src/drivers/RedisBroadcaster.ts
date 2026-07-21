import { resolveModuleDefault } from '../utils'
import { RealtimeError } from '../errors/RealtimeError'
import { MemoryConnectionStore } from './MemoryConnectionStore'
import { ALL_CHANNELS, Broadcaster, ConnectionStore, PresenceMember, RealtimeListener, RealtimeMessage, RedisBroadcasterOptions } from '../declarations'

/**
 * Redis pub/sub broadcaster.
 *
 * Fans a broadcast out across every instance via Redis pub/sub: `broadcast` publishes on a Redis
 * channel; each instance subscribes and delivers to its local listeners (the sockets a WS adapter
 * registered). Uses a dedicated subscriber connection (a Redis connection in subscribe mode cannot
 * run other commands). `ioredis` is imported lazily as an optional peer dependency. Presence is read
 * from the injected {@link ConnectionStore}.
 */
export class RedisBroadcaster implements Broadcaster {
  readonly name: string

  private readonly prefix: string
  private readonly options: RedisBroadcasterOptions
  private readonly listeners = new Map<string, Set<RealtimeListener>>()
  private readonly subscribed = new Set<string>()
  private pubPromise?: Promise<any>
  private subPromise?: Promise<any>

  /**
   * Create a Redis broadcaster.
   *
   * @param options - The connection options.
   * @param store - The connection store (defaults to an in-memory one).
   * @returns A new broadcaster.
   */
  static create (options: RedisBroadcasterOptions, store: ConnectionStore = MemoryConnectionStore.create()): RedisBroadcaster {
    return new this(options, store)
  }

  /**
   * @param options - The connection options.
   * @param store - The connection store.
   */
  constructor (options: RedisBroadcasterOptions, public readonly store: ConnectionStore = MemoryConnectionStore.create()) {
    this.options = options
    this.name = options.name ?? 'redis'
    this.prefix = options.prefix ?? 'realtime'
  }

  /** @inheritdoc */
  async broadcast <T = unknown>(channel: string, event: string, payload?: T): Promise<void> {
    const pub = await this.pub()
    await pub.publish(this.channelKey(channel), JSON.stringify({ channel, event, payload }))
  }

  /** @inheritdoc */
  to (channel: string): { emit: <T = unknown>(event: string, payload?: T) => Promise<void> } {
    return { emit: async <T = unknown>(event: string, payload?: T) => { await this.broadcast(channel, event, payload) } }
  }

  /** @inheritdoc */
  on <T = unknown>(channel: string, listener: RealtimeListener<T>): () => void {
    const set = this.listeners.get(channel) ?? new Set<RealtimeListener>()
    set.add(listener as RealtimeListener)
    this.listeners.set(channel, set)
    void this.ensureSubscribed(channel)
    return () => { this.listeners.get(channel)?.delete(listener as RealtimeListener) }
  }

  /** @inheritdoc */
  async members (channel: string): Promise<PresenceMember[]> {
    return await this.store.members(channel)
  }

  /**
   * The Redis channel name for a logical channel.
   *
   * @param channel - The logical channel.
   * @returns The prefixed Redis channel.
   */
  private channelKey (channel: string): string {
    return `${this.prefix}:${channel}`
  }

  /**
   * Ensure the subscriber connection is subscribed to a channel (once).
   *
   * @param channel - The logical channel.
   */
  private async ensureSubscribed (channel: string): Promise<void> {
    if (this.subscribed.has(channel)) { return }
    this.subscribed.add(channel)
    const sub = await this.sub()
    await sub.subscribe(this.channelKey(channel))
  }

  /**
   * Deliver an incoming Redis message to the local listeners.
   *
   * @param redisChannel - The prefixed Redis channel the message arrived on.
   * @param raw - The raw JSON payload.
   */
  private deliver (redisChannel: string, raw: string): void {
    const channel = redisChannel.startsWith(`${this.prefix}:`) ? redisChannel.slice(this.prefix.length + 1) : redisChannel
    let message: RealtimeMessage
    try {
      message = JSON.parse(raw) as RealtimeMessage
    } catch {
      return
    }
    for (const listener of this.listeners.get(channel) ?? []) { void listener(message) }
    for (const listener of this.listeners.get(ALL_CHANNELS) ?? []) { void listener(message) }
  }

  /**
   * Lazily build (and memoize) the publisher client.
   *
   * @returns The client.
   */
  private async pub (): Promise<any> {
    this.pubPromise = this.pubPromise ?? this.build()
    return await this.pubPromise
  }

  /**
   * Lazily build (and memoize) the subscriber client (a duplicate of the publisher).
   *
   * @returns The subscriber client.
   */
  private async sub (): Promise<any> {
    this.subPromise = this.subPromise ?? this.pub().then((pub) => {
      const sub = typeof pub.duplicate === 'function' ? pub.duplicate() : pub
      sub.on('message', (redisChannel: string, raw: string) => { this.deliver(redisChannel, raw) })
      return sub
    })
    return await this.subPromise
  }

  /**
   * Resolve the publisher client from a provided instance, a URL, or inline options.
   *
   * @returns The client.
   * @throws {RealtimeError} When `ioredis` is not installed.
   */
  private async build (): Promise<any> {
    if (this.options.client !== undefined && this.options.client !== null) {
      return this.options.client
    }
    const IORedis = await import('ioredis').then(resolveModuleDefault).catch(() => {
      throw new RealtimeError('The Redis broadcaster requires "ioredis". Install it: npm i ioredis')
    })
    return typeof this.options.url === 'string' ? new IORedis(this.options.url) : new IORedis(this.options.options ?? {})
  }
}
