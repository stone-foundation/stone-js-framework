import { LocalEventBus } from './drivers/LocalEventBus'
import { EventBusManager } from './EventBusManager'
import { MemoryEventBus } from './drivers/MemoryEventBus'
import { EventBusError } from './errors/EventBusError'
import { EventBridgeEventBus } from './drivers/EventBridgeEventBus'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { EventBusConfig, ConnectionOptions, ConnectionFactory } from './declarations'

/**
 * Built-in connection factories, keyed by driver name. `memory` needs nothing; `eventbridge` imports
 * `@aws-sdk/client-eventbridge` lazily as an optional peer dependency. `local` is wired separately
 * because it needs the container's event emitter.
 */
const DRIVERS: Record<string, ConnectionFactory> = {
  memory: (options) => MemoryEventBus.create(options.name),
  eventbridge: (options) => EventBridgeEventBus.create(options as any)
}

/**
 * Wires the emit side of the event bus into the container.
 *
 * Builds an {@link EventBusManager} (with a default `local` connection bound to the container's
 * `EventEmitter`), publishes it process-wide and binds `eventBus` / `eventBusManager`. The listener
 * side is the light key-router from `@stone-js/router` (enabled by `@BusListener()`), so this
 * provider no longer owns a router. The core is never touched: the local driver uses the emitter.
 */
export class EventBusServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the event-bus emit services.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<EventBusConfig>('stone.eventBus', {})

    const manager = EventBusManager.create(config.default ?? 'local', config.targets ?? ['local'])
    manager.registerFactory('local', () => LocalEventBus.create(this.container.make('eventEmitter')))
    for (const connection of config.connections ?? []) {
      this.registerConnection(manager, connection)
    }

    EventBusManager.setInstance(manager)

    this.container
      .instanceIf(EventBusManager, manager)
      .alias(EventBusManager, ['eventBus', 'eventBusManager'])
  }

  /**
   * Register one connection's lazy factory on the manager.
   *
   * @param manager - The bus manager.
   * @param connection - The connection options.
   * @throws {EventBusError} When the connection names an unknown driver.
   */
  private registerConnection (manager: EventBusManager, connection: ConnectionOptions): void {
    const factory = DRIVERS[connection.driver]
    if (factory === undefined) {
      throw new EventBusError(`Unknown event-bus driver "${String(connection.driver)}" for connection "${connection.name}".`)
    }
    manager.registerFactory(connection.name, () => factory(connection))
  }
}
