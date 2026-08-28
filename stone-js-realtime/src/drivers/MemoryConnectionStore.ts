import { Connection, ConnectionStore, PresenceMember } from '../declarations'

/** What one named store holds: who is connected, and which channels they joined. */
interface Backing {
  connections: Map<string, Connection>
  channelMembers: Map<string, Set<string>>
  memberships: Map<string, Set<string>>
}

/**
 * The connections, held by the store rather than by anything the framework owns.
 *
 * This is the one place inter-request state may live, and it lives here because **a store is the
 * persistence boundary**: choosing this driver is choosing where presence is kept. Everything else in
 * Stone.js is rebuilt for every event, deliberately.
 *
 * Held per instance, a connection registered while handling one message was gone by the next one, so
 * a socket that had joined a channel received nothing and presence reported an empty room. Same
 * shape as the counters that never counted in `@stone-js/rate-limit`.
 *
 * Keyed by name, so two stores keep their own connections, exactly as two Redis prefixes would.
 */
const backings = new Map<string, Backing>()

/** The backing a named store works in, created the first time that name is used. */
function backingFor (name: string): Backing {
  const existing = backings.get(name)

  if (existing !== undefined) { return existing }

  const created: Backing = { connections: new Map(), channelMembers: new Map(), memberships: new Map() }
  backings.set(name, created)

  return created
}

/**
 * In-process connection store: connections and their channel memberships in `Map`s, held in this
 * module rather than in the instance.
 *
 * The zero-config default and the building block a WS adapter uses on a single node.
 *
 * **It is one process wide, and that is worth saying plainly.** Two instances behind a load balancer
 * each see their own connections, so a broadcast reaches only the sockets attached to the node that
 * sent it, and presence is that node's view. Swap for a Redis or DynamoDB store to share presence
 * across instances.
 */
export class MemoryConnectionStore implements ConnectionStore {
  private readonly connections: Map<string, Connection>
  private readonly channelMembers: Map<string, Set<string>>
  private readonly memberships: Map<string, Set<string>>

  /**
   * Create a memory connection store.
   *
   * @param name - The name its connections are filed under.
   * @returns A new store.
   */
  static create (name: string = 'memory'): MemoryConnectionStore {
    return new this(name)
  }

  /**
   * @param name - The name its connections are filed under.
   */
  constructor (name: string = 'memory') {
    const backing = backingFor(name)

    this.connections = backing.connections
    this.channelMembers = backing.channelMembers
    this.memberships = backing.memberships
  }

  /** @inheritdoc */
  async add (connection: Connection): Promise<void> {
    this.connections.set(connection.id, connection)
    if (!this.memberships.has(connection.id)) { this.memberships.set(connection.id, new Set()) }
  }

  /** @inheritdoc */
  async remove (connectionId: string): Promise<void> {
    for (const channel of this.memberships.get(connectionId) ?? []) {
      this.channelMembers.get(channel)?.delete(connectionId)
    }
    this.memberships.delete(connectionId)
    this.connections.delete(connectionId)
  }

  /** @inheritdoc */
  async subscribe (connectionId: string, channel: string): Promise<void> {
    const members = this.channelMembers.get(channel) ?? new Set<string>()
    members.add(connectionId)
    this.channelMembers.set(channel, members)
    const channels = this.memberships.get(connectionId) ?? new Set<string>()
    channels.add(channel)
    this.memberships.set(connectionId, channels)
  }

  /** @inheritdoc */
  async unsubscribe (connectionId: string, channel: string): Promise<void> {
    this.channelMembers.get(channel)?.delete(connectionId)
    this.memberships.get(connectionId)?.delete(channel)
  }

  /** @inheritdoc */
  async connectionsFor (channel: string): Promise<Connection[]> {
    const out: Connection[] = []
    for (const id of this.channelMembers.get(channel) ?? []) {
      const connection = this.connections.get(id)
      if (connection !== undefined) { out.push(connection) }
    }
    return out
  }

  /** @inheritdoc */
  async members (channel: string): Promise<PresenceMember[]> {
    return (await this.connectionsFor(channel)).map((connection) => ({ connectionId: connection.id, info: connection.info }))
  }

  /**
   * Forget every connection and every membership.
   *
   * The connections outlive an instance now, so something has to be able to end them: mostly a test
   * wanting a clean slate, and a graceful shutdown that would rather drop presence than leave it
   * claiming sockets that are gone.
   */
  clear (): void {
    this.connections.clear()
    this.channelMembers.clear()
    this.memberships.clear()
  }
}
