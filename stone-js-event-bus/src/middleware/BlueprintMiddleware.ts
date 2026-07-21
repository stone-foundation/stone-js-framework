import { BusEventHandler } from '../BusEventHandler'
import { ClassType, BlueprintContext, IBlueprint, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Blueprint middleware: make the bus the kernel event handler when the listener side is enabled.
 *
 * Mirrors how `@stone-js/router` injects its `RouterEventHandler`. It only takes over when
 * `stone.eventBus.listen` is configured (via `@BusListener()` or config), so a plain emit-only app
 * keeps its own handler untouched.
 *
 * @param context - The blueprint context.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetBusEventHandlerMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get('stone.eventBus.listen') !== undefined) {
    context.blueprint.set('stone.kernel.eventHandler', { module: BusEventHandler, isClass: true })
  }

  return await next(context)
}

/**
 * Bus blueprint middleware pipes, ordered by priority (lower runs first).
 */
export const metaBusBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetBusEventHandlerMiddleware, priority: 6 }
]
