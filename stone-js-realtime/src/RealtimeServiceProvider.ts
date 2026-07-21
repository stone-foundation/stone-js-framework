import { RealtimeManager } from './RealtimeManager'
import { RealtimeRouter } from './RealtimeRouter'
import { RealtimeError } from './errors/RealtimeError'
import { REALTIME_HANDLER_KEY } from './constants'
import { collectKeyHandlers } from '@stone-js/key-router'
import { MemoryBroadcaster } from './drivers/MemoryBroadcaster'
import { RedisBroadcaster } from './drivers/RedisBroadcaster'
import { ClassType, IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { RealtimeConfig, ConnectionOptions, Broadcaster, BroadcasterFactory, RealtimeGatewayMeta } from './declarations'

/**
 * Built-in broadcaster factories, keyed by driver name. `memory` needs nothing; `redis` imports
 * `ioredis` lazily as an optional peer dependency.
 */
const DRIVERS: Record<string, BroadcasterFactory> = {
  memory: (config) => MemoryBroadcaster.create(config),
  redis: (config) => RedisBroadcaster.create(config as any)
}

/**
 * Wires realtime into the container.
 *
 * From `stone.realtime` it builds a {@link RealtimeManager} (with a default `memory` connection) and
 * a {@link RealtimeRouter} populated from the configured/decorated gateways; then publishes both
 * process-wide and binds `realtimeManager`, `realtime` (default broadcaster) and `realtimeRouter`
 * into the container. The core is never touched: everything grafts here.
 */
export class RealtimeServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the realtime services.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<RealtimeConfig>('stone.realtime', {})

    const manager = RealtimeManager.create(config.default ?? 'memory')
    manager.registerFactory('memory', () => MemoryBroadcaster.create({ name: 'memory' }))
    for (const connection of config.connections ?? []) {
      this.registerConnection(manager, connection)
    }

    const router = RealtimeRouter.create()
    for (const gateway of config.gateways ?? []) {
      this.registerGateway(router, gateway)
    }

    RealtimeManager.setInstance(manager)
    RealtimeRouter.setInstance(router)

    this.container
      .instanceIf(RealtimeManager, manager)
      .alias(RealtimeManager, ['realtimeManager'])
      .instanceIf(RealtimeRouter, router)
      .alias(RealtimeRouter, ['realtimeRouter'])
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

  /**
   * Register one gateway's `@On*` methods into the router, resolving the class via the container.
   *
   * @param router - The realtime router.
   * @param meta - The gateway meta-module.
   */
  private registerGateway (router: RealtimeRouter, meta: RealtimeGatewayMeta): void {
    const isResolvable = meta.isClass === true || meta.isFactory === true
    const handler = isResolvable ? this.container.make<Broadcaster>(meta.module as any) : meta.module

    for (const { key, action } of collectKeyHandlers(meta.module as ClassType, REALTIME_HANDLER_KEY)) {
      router.register(key, handler as any, action)
    }
  }
}
