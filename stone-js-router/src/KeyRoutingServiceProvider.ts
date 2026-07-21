import { KEY_ROUTING_KEY } from './decorators/OnKey'
import { KeyRouter, collectKeyHandlers } from '@stone-js/key-router'
import { ClassType, IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'
import { KeyHandlerDefinition, KeyRouteDefinition, KeyRoutingConfig } from './keyRoutingDeclarations'

/**
 * Wires the light key-router into the container.
 *
 * Builds a {@link KeyRouter} from `stone.keyRouting.definitions` (explicit key-routes) and
 * `stone.keyRouting.handlers` (classes with `@OnKey` methods, scanned), resolving classes/factories
 * with dependency injection, then binds it as `keyRouter`. The {@link KeyRoutingEventHandler}
 * dispatches through it.
 */
export class KeyRoutingServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the light key-router.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<KeyRoutingConfig>('stone.keyRouting', {})

    const router = KeyRouter.create()
    for (const definition of config.definitions ?? []) {
      this.registerDefinition(router, definition)
    }
    for (const handler of config.handlers ?? []) {
      this.registerHandler(router, handler)
    }

    this.container
      .instanceIf(KeyRouter, router)
      .alias(KeyRouter, ['keyRouter'])
  }

  /**
   * Register one explicit key-route, resolving classes/factories via the container.
   *
   * @param router - The key-router.
   * @param definition - The key-route definition.
   */
  private registerDefinition (router: KeyRouter, definition: KeyRouteDefinition): void {
    const isResolvable = definition.isClass === true || definition.isFactory === true
    const handler = isResolvable ? this.container.make(definition.module as any) : definition.module
    router.register(definition.key, handler as any, definition.action ?? 'handle')
  }

  /**
   * Register one handler class's `@OnKey` methods, resolving the class via the container.
   *
   * @param router - The key-router.
   * @param meta - The handler-class definition.
   */
  private registerHandler (router: KeyRouter, meta: KeyHandlerDefinition): void {
    const isResolvable = meta.isClass === true || meta.isFactory === true
    const handler = isResolvable ? this.container.make(meta.module as any) : meta.module

    for (const { key, action } of collectKeyHandlers(meta.module as ClassType, KEY_ROUTING_KEY)) {
      router.register(key, handler as any, action)
    }
  }
}
