import { Broadcaster } from './declarations'
import { RealtimeError } from './errors/RealtimeError'

/**
 * A factory that lazily builds a {@link Broadcaster}.
 */
export type BroadcasterThunk = () => Broadcaster

/**
 * Multi-connection realtime registry.
 *
 * Resolves a broadcaster by name (`realtimeManager.connection('redis')`) through the agnostic
 * {@link Broadcaster} contract. A process-wide default instance lets the client and helpers reach it
 * without wiring.
 */
export class RealtimeManager {
  private static current?: RealtimeManager

  private defaultConnection: string
  private readonly connections = new Map<string, Broadcaster>()
  private readonly factories = new Map<string, BroadcasterThunk>()

  /**
   * Create a RealtimeManager.
   *
   * @param defaultConnection - The default connection name.
   * @returns A new manager.
   */
  static create (defaultConnection: string = 'memory'): RealtimeManager {
    return new this(defaultConnection)
  }

  /**
   * @param defaultConnection - The default connection name.
   */
  constructor (defaultConnection: string = 'memory') {
    this.defaultConnection = defaultConnection
  }

  /**
   * Register (or replace) the process-wide default manager.
   *
   * @param manager - The manager (or `undefined` to clear).
   */
  static setInstance (manager?: RealtimeManager): void {
    RealtimeManager.current = manager
  }

  /**
   * The process-wide default manager, if the realtime module has been booted.
   *
   * @returns The manager, or `undefined`.
   */
  static getInstance (): RealtimeManager | undefined {
    return RealtimeManager.current
  }

  /**
   * Register a ready-made broadcaster instance.
   *
   * @param name - The connection name.
   * @param broadcaster - The broadcaster.
   * @returns This manager for chaining.
   */
  register (name: string, broadcaster: Broadcaster): this {
    this.connections.set(name, broadcaster)
    return this
  }

  /**
   * Register a lazy factory for a connection (built on first access).
   *
   * @param name - The connection name.
   * @param factory - The broadcaster factory.
   * @returns This manager for chaining.
   */
  registerFactory (name: string, factory: BroadcasterThunk): this {
    this.factories.set(name, factory)
    return this
  }

  /**
   * Set the default connection name.
   *
   * @param name - The connection name.
   * @returns This manager for chaining.
   */
  setDefaultConnection (name: string): this {
    this.defaultConnection = name
    return this
  }

  /**
   * Resolve a broadcaster by name (defaults to the default connection).
   *
   * @param name - The connection name.
   * @returns The resolved {@link Broadcaster}.
   * @throws {RealtimeError} When no connection/factory is registered under the name.
   */
  connection (name?: string): Broadcaster {
    const connectionName = name ?? this.defaultConnection

    const existing = this.connections.get(connectionName)
    if (existing !== undefined) { return existing }

    const factory = this.factories.get(connectionName)
    if (factory === undefined) {
      throw new RealtimeError(`No realtime connection registered under "${connectionName}".`)
    }

    const broadcaster = factory()
    this.connections.set(connectionName, broadcaster)
    return broadcaster
  }

  /**
   * Whether a connection (instance or factory) is registered under the name.
   *
   * @param name - The connection name.
   * @returns True if registered.
   */
  has (name: string): boolean {
    return this.connections.has(name) || this.factories.has(name)
  }
}
