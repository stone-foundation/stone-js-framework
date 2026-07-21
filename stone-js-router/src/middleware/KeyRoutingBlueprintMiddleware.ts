import { KeyRoutingError } from '../errors/KeyRoutingError'
import { KeyRoutingEventHandler } from '../KeyRoutingEventHandler'
import { BlueprintContext, IBlueprint, ClassType, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Blueprint middleware: make the light key-router the kernel event handler.
 *
 * Mirrors `SetRouterEventHandlerMiddleware`. Since both the full router and the light router claim
 * `stone.kernel.eventHandler`, they are mutually exclusive: this throws when the full `@Routing`
 * blueprint (`stone.router`) is also present.
 *
 * @param context - The blueprint context.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 * @throws {KeyRoutingError} When `@Routing()` and `@KeyRouting()` are used together.
 */
export const SetKeyRoutingEventHandlerMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get('stone.router') !== undefined) {
    throw new KeyRoutingError('`@KeyRouting()` and `@Routing()` are mutually exclusive: both provide the kernel event handler. Use one.')
  }

  context.blueprint.set('stone.kernel.eventHandler', { module: KeyRoutingEventHandler, isClass: true })

  return await next(context)
}

/**
 * Light-router blueprint middleware pipes, ordered by priority (lower runs first).
 */
export const metaKeyRoutingBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetKeyRoutingEventHandlerMiddleware, priority: 5 }
]
