import { ApiGatewayManagementClient } from './ApiGatewayManagementClient'
import { DynamoDbConnectionStore } from './drivers/DynamoDbConnectionStore'
import { ApiGatewayWsAdapterError } from './errors/ApiGatewayWsAdapterError'
import { ManagementClient, ManagementClientFactory } from './declarations'
import { ALL_CHANNELS, Broadcaster, ConnectionStore, PresenceMember, RealtimeListener, RealtimeMessage } from '@stone-js/realtime'

/**
 * Options for the {@link ApiGatewayWsBroadcaster}.
 */
export interface ApiGatewayWsBroadcasterOptions {
  /** A human-readable name. */
  name?: string
  /** The connection store (defaults to a DynamoDB store). */
  store?: ConnectionStore
  /** A factory that builds a management client for an endpoint (injectable in tests). */
  management?: ManagementClientFactory
}

/**
 * A serverless {@link Broadcaster} for API Gateway WebSocket APIs.
 *
 * With no held sockets, a broadcast reads the channel's members from the shared store and posts to
 * each connection via the API Gateway Management API. The management endpoint is per-invocation (it
 * comes from the event), so the adapter calls {@link useEndpoint} before dispatching. Local listeners
 * are also notified, for handlers that react within the same invocation.
 */
export class ApiGatewayWsBroadcaster implements Broadcaster {
  readonly name: string
  readonly store: ConnectionStore

  private endpoint?: string
  private client?: ManagementClient
  private readonly management: ManagementClientFactory
  private readonly listeners = new Map<string, Set<RealtimeListener>>()

  /**
   * Create a broadcaster.
   *
   * @param options - The broadcaster options.
   * @returns A new broadcaster.
   */
  static create (options: ApiGatewayWsBroadcasterOptions = {}): ApiGatewayWsBroadcaster {
    return new this(options)
  }

  /**
   * @param options - The broadcaster options.
   */
  constructor (options: ApiGatewayWsBroadcasterOptions = {}) {
    this.name = options.name ?? 'apigw-ws'
    this.store = options.store ?? DynamoDbConnectionStore.create()
    this.management = options.management ?? ((endpoint) => ApiGatewayManagementClient.create({ endpoint }))
  }

  /**
   * Set the management endpoint for the current invocation (rebuilds the client when it changes).
   *
   * @param endpoint - The `https://<domain>/<stage>` endpoint.
   */
  useEndpoint (endpoint: string): void {
    if (endpoint !== this.endpoint) {
      this.endpoint = endpoint
      this.client = undefined
    }
  }

  /** @inheritdoc */
  async broadcast <T = unknown>(channel: string, event: string, payload?: T): Promise<void> {
    const message: RealtimeMessage<T> = { channel, event, payload: payload as T }

    for (const listener of this.listeners.get(channel) ?? []) { await listener(message) }
    for (const listener of this.listeners.get(ALL_CHANNELS) ?? []) { await listener(message) }

    const client = this.resolveClient()
    const data = JSON.stringify(message)
    for (const connection of await this.store.connectionsFor(channel)) {
      await client.postToConnection(connection.id, data)
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
   * Resolve (and memoize) the management client for the current endpoint.
   *
   * @returns The management client.
   * @throws {ApiGatewayWsAdapterError} When no endpoint has been set yet.
   */
  private resolveClient (): ManagementClient {
    if (this.endpoint === undefined) {
      throw new ApiGatewayWsAdapterError('No management endpoint set. The adapter sets it from the event before broadcasting.')
    }
    this.client = this.client ?? this.management(this.endpoint)
    return this.client
  }
}
