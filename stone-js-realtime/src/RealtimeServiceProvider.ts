import { RealtimeManager } from './RealtimeManager'
import { RealtimeError } from './errors/RealtimeError'
import { MemoryBroadcaster } from './drivers/MemoryBroadcaster'
import { RedisBroadcaster } from './drivers/RedisBroadcaster'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { RealtimeConfig, ConnectionOptions, BroadcasterFactory } from './declarations'

/**
 * Built-in broadcaster factories, keyed by driver name. `memory` needs nothing; `redis` imports
 * `ioredis` lazily as an optional peer dependency.
 */
const DRIVERS: Record<string, BroadcasterFactory> = {
  memory: (config) => MemoryBroadcaster.create(config),
  redis: (config) => RedisBroadcaster.create(config as any)
}

/**
 * Wires the broadcaster side of realtime into the container.
 *
 * From `stone.realtime` it builds a {@link RealtimeManager} (with a default `memory` connection),
 * publishes it process-wide and binds `realtimeManager` and `realtime` (the default broadcaster). The
 * listener side is the light key-router from `@stone-js/router`: `@RealtimeGateway` (an alias of
 * `@KeyHandler`) registers gateway methods there, and a WS adapter drives them through the kernel.
 * The core is never touched: everything grafts here.
 */
export class RealtimeServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the realtime broadcaster services.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<RealtimeConfig>('stone.realtime', {})

    const manager = RealtimeManager.create(config.default ?? 'memory')
    manager.registerFactory('memory', () => MemoryBroadcaster.create({ name: 'memory' }))
    for (const connection of config.connections ?? []) {
      this.registerConnection(manager, connection)
    }

    RealtimeManager.setInstance(manager)

    this.container
      .instanceIf(RealtimeManager, manager)
      .alias(RealtimeManager, ['realtimeManager'])
      .singletonIf('realtime', () => manager.connection())
  }

  /**
   * Register one connection's lazy factory on the manager.
   *
   * @param manager - The realtime manager.
   * @param connection - The connection configuration.
   * @throws {RealtimeError} When the connection names an unknown driver.
   */
  private registerConnection (manager: RealtimeManager, connection: ConnectionOptions): void {
    const factory = DRIVERS[connection.driver]
    if (factory === undefined) {
      throw new RealtimeError(`Unknown realtime driver "${String(connection.driver)}" for connection "${connection.name}".`)
    }
    manager.registerFactory(connection.name, () => factory(connection))
  }
}
