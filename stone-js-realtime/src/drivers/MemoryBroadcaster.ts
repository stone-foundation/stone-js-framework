import { MemoryConnectionStore } from './MemoryConnectionStore'
import { ALL_CHANNELS, Broadcaster, ConnectionOptions, ConnectionStore, PresenceMember, RealtimeListener, RealtimeMessage } from '../declarations'

/**
 * In-process broadcaster.
 *
 * The zero-config default: it fans a broadcast out to local listeners subscribed to the channel (or
 * to the `*` wildcard) and to any held connection that is a member of the channel. Single process;
 * use the Redis broadcaster to fan out across instances.
 */
export class MemoryBroadcaster implements Broadcaster {
  readonly name: string

  private readonly listeners = new Map<string, Set<RealtimeListener>>()

  /**
   * Create a memory broadcaster.
   *
   * @param config - The connection options.
   * @param store - The connection store (defaults to an in-memory one).
   * @returns A new broadcaster.
   */
  static create (config: Partial<ConnectionOptions> = {}, store: ConnectionStore = MemoryConnectionStore.create()): MemoryBroadcaster {
    return new this(config, store)
  }

  /**
   * @param config - The connection options.
   * @param store - The connection store.
   */
  constructor (config: Partial<ConnectionOptions> = {}, public readonly store: ConnectionStore = MemoryConnectionStore.create()) {
    this.name = config.name ?? 'memory'
  }

  /** @inheritdoc */
  async broadcast <T = unknown>(channel: string, event: string, payload?: T): Promise<void> {
    const message: RealtimeMessage<T> = { channel, event, payload: payload as T }

    for (const listener of this.listeners.get(channel) ?? []) { await listener(message) }
    for (const listener of this.listeners.get(ALL_CHANNELS) ?? []) { await listener(message) }

    for (const connection of await this.store.connectionsFor(channel)) {
      if (typeof connection.send === 'function') { await connection.send(message) }
    }
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
    return () => { this.listeners.get(channel)?.delete(listener as RealtimeListener) }
  }

  /** @inheritdoc */
  async members (channel: string): Promise<PresenceMember[]> {
    return await this.store.members(channel)
  }
}
