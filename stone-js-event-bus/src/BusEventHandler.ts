import { defaultExtractor } from './utils'
import { KeyRouter } from '@stone-js/router'
import { DEFAULT_KEY_SOURCE } from './constants'
import { IBlueprint, IEventHandler, IncomingEvent } from '@stone-js/core'
import { BusEventExtractor, BusListenConfig } from './declarations'

/**
 * Options for the {@link BusEventHandler}.
 */
export interface BusEventHandlerOptions {
  blueprint: IBlueprint
  eventBusRouter: KeyRouter
}

/**
 * The kernel event handler for the listener side of the bus.
 *
 * Injected as `stone.kernel.eventHandler` (exactly like `@stone-js/router`'s `RouterEventHandler`),
 * so it plugs onto any simple cloud adapter that runs the kernel: the adapter turns the raw cloud
 * event into an `IncomingEvent`, this handler extracts the routing key from a configurable property
 * and dispatches through the key-router to the matching `@OnBusEvent` handler. Unmatched events are
 * a no-op, buses routinely deliver events a given consumer does not handle.
 */
export class BusEventHandler implements IEventHandler<IncomingEvent> {
  private readonly router: KeyRouter
  private readonly extractor: BusEventExtractor

  /**
   * Create a BusEventHandler.
   *
   * @param options - The handler options.
   * @returns A new handler.
   */
  static create (options: BusEventHandlerOptions): BusEventHandler {
    return new this(options)
  }

  /**
   * @param options - The handler options (injected by the container).
   */
  constructor ({ blueprint, eventBusRouter }: BusEventHandlerOptions) {
    this.router = eventBusRouter
    const listen = blueprint.get<BusListenConfig>('stone.eventBus.listen', {})
    this.extractor = listen.extractor ?? defaultExtractor(listen.source ?? DEFAULT_KEY_SOURCE)
  }

  /**
   * Route an incoming bus event to its handler.
   *
   * @param event - The incoming event.
   * @returns The handler's result, or `undefined` when the event is not routable/handled.
   */
  async handle (event: IncomingEvent): Promise<unknown> {
    const { key, payload } = this.extractor(event)
    if (key === undefined) { return undefined }

    const handler = this.router.tryResolve(key)
    if (handler === undefined) { return undefined }

    return handler(payload, event)
  }
}
