import { MemoryConnectionStore } from './MemoryConnectionStore'
import { ALL_CHANNELS, Broadcaster, ConnectionOptions, ConnectionStore, PresenceMember, RealtimeListener, RealtimeMessage } from '../declarations'

/**
 * The subscriptions, held by the broadcaster rather than by anything the framework owns.
 *
 * A listener is registered once, usually while an adapter starts, and has to be there for every
 * broadcast afterwards. Held per instance it was not: the container is rebuilt for every event, so
 * the broadcaster was too, and a broadcast reached the listeners registered during that one event
 * and nobody else. An adapter that subscribed at boot received nothing from then on.
 *
 * Keyed by the broadcaster's configured name, so two broadcasters fan out to their own subscribers.
 */
const backings = new Map<string, Map<string, Set<RealtimeListener>>>()

/** The subscriptions a named broadcaster fans out to, created the first time that name is used. */
function backingFor (name: string): Map<string, Set<RealtimeListener>> {
  const existing = backings.get(name)

  if (existing !== undefined) { return existing }

  const created = new Map<string, Set<RealtimeListener>>()
  backings.set(name, created)

  return created
}

/**
 * In-process broadcaster.
 *
 * The zero-config default: it fans a broadcast out to local listeners subscribed to the channel (or
 * to the `*` wildcard) and to any held connection that is a member of the channel.
 *
 * **It is one process wide, and that is worth saying plainly.** Two instances behind a load balancer
 * each fan out to their own sockets, so a broadcast reaches the clients attached to the node that
 * sent it and no others. Use the Redis broadcaster to fan out across instances.
 */
export class MemoryBroadcaster implements Broadcaster {
  readonly name: string

  private readonly listeners: Map<string, Set<RealtimeListener>>

  /**
   * Create a memory broadcaster.
   *
   * @param config - The connection options.
   * @param store - The connection store (defaults to the in-memory one of the same name).
   * @returns A new broadcaster.
   */
  static create (
    config: Partial<ConnectionOptions> = {},
    store: ConnectionStore = MemoryConnectionStore.create(config.name ?? 'memory')
  ): MemoryBroadcaster {
    return new this(config, store)
  }

  /**
   * @param config - The connection options.
   * @param store - The connection store.
   */
  constructor (
    config: Partial<ConnectionOptions> = {},
    public readonly store: ConnectionStore = MemoryConnectionStore.create(config.name ?? 'memory')
  ) {
    this.name = config.name ?? 'memory'
    this.listeners = backingFor(this.name)
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

  /**
   * Forget every subscription.
   *
   * The subscriptions outlive an instance now, so something has to be able to end them: mostly a
   * test wanting a clean slate. An application calling this mid-flight silences every listener it
   * registered.
   */
  clear (): void {
    this.listeners.clear()
  }
}
