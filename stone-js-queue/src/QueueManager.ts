import { QueueError } from './errors/QueueError'
import { QueueConnection } from './declarations'

/**
 * A factory that lazily builds a {@link QueueConnection}.
 */
export type QueueConnectionThunk = () => QueueConnection

/**
 * Multi-connection queue registry.
 *
 * Application code resolves a connection by name (`queueManager.connection('redis')`) and talks to
 * it through the agnostic {@link QueueConnection} contract. A process-wide default instance lets the
 * `dispatch()` helper and the worker reach it without wiring.
 */
export class QueueManager {
  private static current?: QueueManager

  private defaultConnection: string
  private readonly connections = new Map<string, QueueConnection>()
  private readonly factories = new Map<string, QueueConnectionThunk>()

  /**
   * Create a QueueManager.
   *
   * @param defaultConnection - The default connection name.
   * @returns A new manager.
   */
  static create (defaultConnection: string = 'memory'): QueueManager {
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
  static setInstance (manager?: QueueManager): void {
    QueueManager.current = manager
  }

  /**
   * The process-wide default manager, if the queue module has been booted.
   *
   * @returns The manager, or `undefined`.
   */
  static getInstance (): QueueManager | undefined {
    return QueueManager.current
  }

  /**
   * Register a ready-made connection instance.
   *
   * @param name - The connection name.
   * @param connection - The connection instance.
   * @returns This manager for chaining.
   */
  register (name: string, connection: QueueConnection): this {
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
  registerFactory (name: string, factory: QueueConnectionThunk): this {
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
   * Resolve a connection by name (defaults to the default connection).
   *
   * @param name - The connection name.
   * @returns The resolved {@link QueueConnection}.
   * @throws {QueueError} When no connection/factory is registered under the name.
   */
  connection (name?: string): QueueConnection {
    const connectionName = name ?? this.defaultConnection

    const existing = this.connections.get(connectionName)
    if (existing !== undefined) { return existing }

    const factory = this.factories.get(connectionName)
    if (factory === undefined) {
      throw new QueueError(`No queue connection registered under "${connectionName}".`)
    }

    const connection = factory()
    this.connections.set(connectionName, connection)
    return connection
  }

  /**
   * Dispatch a job on the default connection.
   *
   * @param name - The job name.
   * @param payload - The job payload.
   * @param options - Dispatch options.
   * @returns The job id.
   */
  async dispatch <T = unknown>(name: string, payload: T, options?: import('./declarations').JobOptions): Promise<string> {
    return await this.connection().dispatch(name, payload, options)
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
