import { KeyRouter, collectKeyHandlers } from '@stone-js/router'
import { LocalEventBus } from './drivers/LocalEventBus'
import { EventBusManager } from './EventBusManager'
import { ON_BUS_EVENT_KEY } from './decorators/OnBusEvent'
import { MemoryEventBus } from './drivers/MemoryEventBus'
import { EventBusError } from './errors/EventBusError'
import { EventBridgeEventBus } from './drivers/EventBridgeEventBus'
import { ClassType, IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { EventBusConfig, ConnectionOptions, ConnectionFactory, BusHandlerMeta } from './declarations'

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
 * Wires the event bus into the container.
 *
 * Builds an {@link EventBusManager} (with a default `local` connection bound to the container's
 * `EventEmitter`), a key-router populated from the configured/decorated `@OnBusEvent` handlers, then
 * publishes the manager process-wide and binds `eventBus`, `eventBusManager` and `eventBusRouter`.
 * The core is never touched: the local driver uses the emitter, it does not modify it.
 */
export class EventBusServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the event-bus services.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<EventBusConfig>('stone.eventBus', {})

    const manager = EventBusManager.create(config.default ?? 'local', config.targets ?? ['local'])
    manager.registerFactory('local', () => LocalEventBus.create(this.container.make('eventEmitter')))
    for (const connection of config.connections ?? []) {
      this.registerConnection(manager, connection)
    }

    const router = KeyRouter.create()
    for (const handler of config.handlers ?? []) {
      this.registerHandler(router, handler)
    }

    EventBusManager.setInstance(manager)

    this.container
      .instanceIf(EventBusManager, manager)
      .alias(EventBusManager, ['eventBus', 'eventBusManager'])
      .instanceIf(KeyRouter, router)
      .alias(KeyRouter, ['eventBusRouter'])
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

  /**
   * Register one handler meta-module into the key-router, resolving classes/factories via the container.
   *
   * @param router - The key-router.
   * @param meta - The handler meta-module.
   */
  private registerHandler (router: KeyRouter, meta: BusHandlerMeta): void {
    const isResolvable = meta.isClass === true || meta.isFactory === true
    const handler = isResolvable ? this.container.make(meta.module as any) : meta.module

    if (meta.name !== undefined) {
      router.register(meta.name, handler as any, meta.action ?? 'handle')
    }

    if (isResolvable) {
      for (const { key, action } of collectKeyHandlers(meta.module as ClassType, ON_BUS_EVENT_KEY)) {
        router.register(key, handler as any, action)
      }
    }
  }
}
