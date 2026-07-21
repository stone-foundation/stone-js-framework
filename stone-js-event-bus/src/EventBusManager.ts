import { LOCAL } from './constants'
import { EventBusError } from './errors/EventBusError'
import { EmitOptions, EventBusConnection, IEventBus } from './declarations'

/** A factory that lazily builds an {@link EventBusConnection}. */
export type ConnectionThunk = () => EventBusConnection

/**
 * Multi-connection event bus.
 *
 * Publishes to one or more target connections (`emit(name, payload, { targets: ['local','cloud'] })`),
 * so the same domain code reaches in-process listeners in a monolith and a cloud bus when distributed.
 * A process-wide default instance lets adapters (the listener side) reach it without wiring.
 */
export class EventBusManager implements IEventBus {
  private static current?: EventBusManager

  private defaultConnection: string
  private defaultTargets: string[]
  private readonly connections = new Map<string, EventBusConnection>()
  private readonly factories = new Map<string, ConnectionThunk>()

  /**
   * Create an EventBusManager.
   *
   * @param defaultConnection - The default connection name.
   * @param defaultTargets - The default emit targets.
   * @returns A new manager.
   */
  static create (defaultConnection: string = LOCAL, defaultTargets: string[] = [LOCAL]): EventBusManager {
    return new this(defaultConnection, defaultTargets)
  }

  /**
   * @param defaultConnection - The default connection name.
   * @param defaultTargets - The default emit targets.
   */
  constructor (defaultConnection: string = LOCAL, defaultTargets: string[] = [LOCAL]) {
    this.defaultConnection = defaultConnection
    this.defaultTargets = defaultTargets
  }

  /**
   * Register (or replace) the process-wide default manager.
   *
   * @param manager - The manager (or `undefined` to clear).
   */
  static setInstance (manager?: EventBusManager): void {
    EventBusManager.current = manager
  }

  /**
   * The process-wide default manager, if the bus has been booted.
   *
   * @returns The manager, or `undefined`.
   */
  static getInstance (): EventBusManager | undefined {
    return EventBusManager.current
  }

  /**
   * Register a ready-made connection.
   *
   * @param name - The connection name.
   * @param connection - The connection.
   * @returns This manager for chaining.
   */
  register (name: string, connection: EventBusConnection): this {
    this.connections.set(name, connection)
    return this
  }

  /**
   * Register a lazy factory for a connection (built on first access).
   *
   * @param name - The connection name.
   * @param factory - The connection factory.
   * @returns This manager for chaining.
   */
  registerFactory (name: string, factory: ConnectionThunk): this {
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
   * Set the default emit targets.
   *
   * @param targets - The target connection names.
   * @returns This manager for chaining.
   */
  setDefaultTargets (targets: string[]): this {
    this.defaultTargets = targets
    return this
  }

  /**
   * Resolve a connection by name (defaults to the default connection).
   *
   * @param name - The connection name.
   * @returns The resolved connection.
   * @throws {EventBusError} When no connection/factory is registered under the name.
   */
  connection (name?: string): EventBusConnection {
    const connectionName = name ?? this.defaultConnection

    const existing = this.connections.get(connectionName)
    if (existing !== undefined) { return existing }

    const factory = this.factories.get(connectionName)
    if (factory === undefined) {
      throw new EventBusError(`No event-bus connection registered under "${connectionName}".`)
    }

    const connection = factory()
    this.connections.set(connectionName, connection)
    return connection
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

  /** @inheritdoc */
  async emit <T = unknown>(name: string, payload?: T, options: EmitOptions = {}): Promise<void> {
    const targets = options.targets ?? this.defaultTargets
    for (const target of targets) {
      await this.connection(target).emit(name, payload, options)
    }
  }
}
