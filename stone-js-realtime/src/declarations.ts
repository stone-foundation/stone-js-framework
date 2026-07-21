/** The wildcard channel that receives every broadcast (useful for logging/bridging). */
export const ALL_CHANNELS = '*'

/**
 * A message flowing over a channel: an event name and its payload.
 */
export interface RealtimeMessage<T = unknown> {
  /** The channel the message belongs to. */
  channel: string
  /** The event name. */
  event: string
  /** The payload. */
  payload: T
}

/**
 * A presence member on a channel.
 */
export interface PresenceMember<T = unknown> {
  /** The connection id. */
  connectionId: string
  /** Arbitrary member info (user id, name…). */
  info?: T
}

/**
 * A local subscriber callback, invoked when a message is delivered to a channel.
 */
export type RealtimeListener<T = unknown> = (message: RealtimeMessage<T>) => void | Promise<void>

/**
 * The agnostic broadcaster contract: publish an event to a channel.
 *
 * The single API the domain touches to *emit*, on the backend and the frontend alike. On the server
 * it fans out to subscribers; on the client it sends the event up to the server. The concrete
 * effect is resolved by the driver/transport (context).
 */
export interface Broadcaster {
  /** A human-readable name (e.g. `'memory'`, `'redis'`). */
  readonly name: string

  /** Publish `event` with `payload` on `channel`. */
  broadcast: <T = unknown>(channel: string, event: string, payload?: T) => Promise<void>

  /** Fluent form: `to(channel).emit(event, payload)`. */
  to: (channel: string) => { emit: <T = unknown>(event: string, payload?: T) => Promise<void> }

  /** Subscribe a local listener to a channel; returns an unsubscribe function. */
  on: <T = unknown>(channel: string, listener: RealtimeListener<T>) => () => void

  /** The presence members currently on a channel. */
  members: (channel: string) => Promise<PresenceMember[]>
}

/**
 * A connection held by a server transport (WS/SSE), tracked so broadcasts can target it.
 */
export interface Connection<T = unknown> {
  /** The connection id. */
  id: string
  /** Presence info, if any. */
  info?: T
  /** Send a message to this connection (implemented by the transport/adapter). */
  send?: (message: RealtimeMessage) => void | Promise<void>
}

/**
 * The agnostic connection store: who is connected and which channels they are members of.
 *
 * Backed by memory (single node), Redis (multi-node) or a provider store (DynamoDB on AWS). The WS
 * adapters populate it; the broadcaster reads it to target and to report presence.
 */
export interface ConnectionStore {
  /** Record a new connection. */
  add: (connection: Connection) => Promise<void>
  /** Remove a connection and all its memberships. */
  remove: (connectionId: string) => Promise<void>
  /** Make a connection a member of a channel. */
  subscribe: (connectionId: string, channel: string) => Promise<void>
  /** Remove a connection's membership of a channel. */
  unsubscribe: (connectionId: string, channel: string) => Promise<void>
  /** The connections that are members of a channel. */
  connectionsFor: (channel: string) => Promise<Connection[]>
  /** The presence members of a channel. */
  members: (channel: string) => Promise<PresenceMember[]>
}

/**
 * A factory that builds a {@link Broadcaster} from its options.
 */
export type BroadcasterFactory = (config: ConnectionOptions) => Broadcaster

/** Built-in driver identifiers. `memory` and `redis` ship now; provider fan-out follows. */
export type RealtimeDriver = 'memory' | 'redis' | string

/**
 * Options common to every realtime connection, plus the driver selector.
 */
export interface ConnectionOptions {
  /** The connection name, used to resolve it via `realtimeManager.connection(name)`. */
  name: string
  /** Which driver backs this connection. */
  driver: RealtimeDriver
  /** A key prefix/namespace applied to backend keys/channels. */
  prefix?: string
  /** Driver-specific options (see {@link RedisBroadcasterOptions}). */
  [key: string]: unknown
}

/**
 * Options for the Redis broadcaster.
 */
export interface RedisBroadcasterOptions extends ConnectionOptions {
  /** A Redis connection URL. */
  url?: string
  /** An existing `ioredis` client to reuse (a duplicate is made for the subscriber). */
  client?: unknown
  /** Inline `ioredis` options when no `url`/`client` is given. */
  options?: Record<string, unknown>
}

/**
 * The `stone.realtime` configuration bucket.
 */
export interface RealtimeConfig {
  /** The default connection name (resolved by `realtimeManager.connection()` / injected as `realtime`). */
  default?: string
  /** The connections to register. */
  connections?: ConnectionOptions[]
  /** The client endpoint (WebSocket URL) used by the isomorphic client. */
  url?: string
}
