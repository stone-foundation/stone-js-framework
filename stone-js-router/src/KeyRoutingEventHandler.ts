import { KeyRouter } from './KeyRouter'
import { KeyRoutingError } from './errors/KeyRoutingError'
import { IBlueprint, IEventHandler, IncomingEvent } from '@stone-js/core'
import { DEFAULT_KEY_SOURCE, defaultExtractor, KeyRoutingConfig, KeyRoutingExtractor } from './keyRoutingDeclarations'

/**
 * Options for the {@link KeyRoutingEventHandler}.
 */
export interface KeyRoutingEventHandlerOptions {
  blueprint: IBlueprint
  keyRouter: KeyRouter
}

/**
 * The light kernel event handler: routes an event by a key instead of a path.
 *
 * The small sibling of {@link RouterEventHandler}. Installed as `stone.kernel.eventHandler` by
 * `@KeyRouting()`, it plugs onto any adapter that runs the kernel: it extracts a routing key from a
 * configurable property of the incoming event and dispatches through the key-router to the matching
 * handler (a bus event, a realtime gateway method, a CLI command...). It never imports the full
 * `Router`, so bundlers tree-shake the heavy router away when only `@KeyRouting()` is used.
 */
export class KeyRoutingEventHandler implements IEventHandler<IncomingEvent> {
  private readonly router: KeyRouter
  private readonly strict: boolean
  private readonly extractor: KeyRoutingExtractor

  /**
   * Create a KeyRoutingEventHandler.
   *
   * @param options - The handler options.
   * @returns A new handler.
   */
  static create (options: KeyRoutingEventHandlerOptions): KeyRoutingEventHandler {
    return new this(options)
  }

  /**
   * @param options - The handler options (injected by the container).
   */
  constructor ({ blueprint, keyRouter }: KeyRoutingEventHandlerOptions) {
    this.router = keyRouter
    const config = blueprint.get<KeyRoutingConfig>('stone.keyRouting', {})
    this.strict = config.strict === true
    this.extractor = config.extractor ?? defaultExtractor(config.source ?? DEFAULT_KEY_SOURCE)
  }

  /**
   * Route an incoming event to its keyed handler.
   *
   * @param event - The incoming event.
   * @returns The handler's result, or `undefined` when unmatched (unless `strict`).
   * @throws {KeyRoutingError} When `strict` and the key is missing or unmatched.
   */
  async handle (event: IncomingEvent): Promise<unknown> {
    const { key, payload } = this.extractor(event)

    if (key === undefined) {
      if (this.strict) { throw new KeyRoutingError('No routing key found on the incoming event.') }
      return undefined
    }

    const handler = this.router.tryResolve(key)
    if (handler === undefined) {
      if (this.strict) { throw new KeyRoutingError(`No handler registered for key "${key}".`) }
      return undefined
    }

    return handler(payload, event)
  }
}
