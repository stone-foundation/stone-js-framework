import { Connection, ConnectionStore, PresenceMember } from '../declarations'

/**
 * In-process connection store: connections and their channel memberships in `Map`s.
 *
 * The zero-config default and the building block a WS adapter uses on a single node (swap for a
 * Redis/DynamoDB store to share presence across instances).
 */
export class MemoryConnectionStore implements ConnectionStore {
  private readonly connections = new Map<string, Connection>()
  private readonly channelMembers = new Map<string, Set<string>>()
  private readonly memberships = new Map<string, Set<string>>()

  /**
   * Create a memory connection store.
   *
   * @returns A new store.
   */
  static create (): MemoryConnectionStore {
    return new this()
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
}
