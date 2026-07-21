import { Worker } from './Worker'
import { JobRegistry } from './JobRegistry'
import { QueueManager } from './QueueManager'
import { MemoryQueue } from './drivers/MemoryQueue'
import { RedisQueue } from './drivers/RedisQueue'
import { QueueError } from './errors/QueueError'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { QueueConfig, ConnectionConfig, JobHandlerMeta, JobHandler, QueueConnectionFactory } from './declarations'

/**
 * Built-in connection factories, keyed by driver name. `memory` needs nothing; `redis` imports
 * `ioredis` lazily as an optional peer dependency.
 */
const DRIVERS: Record<string, QueueConnectionFactory> = {
  memory: (config) => MemoryQueue.create(config),
  redis: (config) => RedisQueue.create(config as any)
}

/**
 * Wires the queue into the container.
 *
 * From `stone.queue` it builds a {@link QueueManager} (with a default `memory` connection), a
 * {@link JobRegistry} populated from the configured/decorated handlers, and a {@link Worker}; then
 * publishes the manager and registry process-wide and binds `queueManager`, `queue` (default
 * connection), `jobRegistry` and `worker` into the container.
 */
export class QueueServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the queue services.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<QueueConfig>('stone.queue', {})

    const manager = QueueManager.create(config.default ?? 'memory')
    manager.registerFactory('memory', () => MemoryQueue.create({ name: 'memory' }))
    for (const connection of config.connections ?? []) {
      this.registerConnection(manager, connection)
    }

    const registry = JobRegistry.create()
    for (const handler of config.handlers ?? []) {
      this.registerHandler(registry, handler)
    }

    QueueManager.setInstance(manager)
    JobRegistry.setInstance(registry)

    this.container
      .instanceIf(QueueManager, manager)
      .alias(QueueManager, ['queueManager'])
      .instanceIf(JobRegistry, registry)
      .alias(JobRegistry, ['jobRegistry'])
      .singletonIf('queue', () => manager.connection())
      .singletonIf(Worker, () => Worker.create(manager, registry))
      .alias(Worker, ['worker'])
  }

  /**
   * Register one connection's lazy factory on the manager.
   *
   * @param manager - The queue manager.
   * @param connection - The connection configuration.
   * @throws {QueueError} When the connection names an unknown driver.
   */
  private registerConnection (manager: QueueManager, connection: ConnectionConfig): void {
    const factory = DRIVERS[connection.driver]
    if (factory === undefined) {
      throw new QueueError(`Unknown queue driver "${String(connection.driver)}" for connection "${connection.name}".`)
    }
    manager.registerFactory(connection.name, () => factory(connection))
  }

  /**
   * Register one handler meta-module into the registry, resolving classes/factories via the container.
   *
   * @param registry - The job registry.
   * @param meta - The handler meta-module.
   */
  private registerHandler (registry: JobRegistry, meta: JobHandlerMeta): void {
    const handler = (meta.isClass === true || meta.isFactory === true)
      ? this.container.make<JobHandler>(meta.module as any)
      : (meta.module as JobHandler)
    registry.register(meta.name, handler, meta.action ?? 'handle')
  }
}
