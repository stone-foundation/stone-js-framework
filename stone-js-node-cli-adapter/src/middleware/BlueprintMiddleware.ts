import {
  ClassType,
  isNotEmpty,
  IBlueprint,
  hasMetadata,
  getMetadata,
  STONE_APP_KEY,
  NextMiddleware,
  MetaMiddleware,
  OutgoingResponse,
  BlueprintContext,
  OutgoingResponseOptions
} from '@stone-js/core'
import { MetaCommandHandler } from '../declarations'
import { NODE_CONSOLE_PLATFORM } from '../constants'
import { COMMAND_KEY } from '../decorators/constants'
import { MetaCommandRouterEventHandler } from '../command/CommandRouterEventHandler'

/**
 * Middleware to process and register modules as command handlers.
 *
 * @param context - The configuration context containing the modules and blueprint.
 * @param next - The next middleware in the pipeline to call.
 * @returns The updated blueprint or a promise resolving to it.
 */
export const SetConsoleCommandMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === NODE_CONSOLE_PLATFORM) {
    context.modules
      .filter(module => hasMetadata(module, COMMAND_KEY))
      .forEach(module => {
        const options = getMetadata<ClassType, MetaCommandHandler>(module, COMMAND_KEY)
        isNotEmpty(options) && context.blueprint.add('stone.adapter.commands', [{ ...options, module }])
      })
  }

  return await next(context)
}

/**
 * Blueprint middleware to set the ConsoleRouter as the main event handler for the application.
 *
 * The SetConsoleRouterEventHandlerMiddleware takes precedence over all other event handlers middleware when in console mode.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next function in the pipeline.
 * @returns The updated blueprint.
 *
 * @example
 * ```typescript
 * SetConsoleRouterEventHandlerMiddleware({ modules, blueprint }, next);
 * ```
 */
export async function SetConsoleRouterEventHandlerMiddleware (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> {
  const blueprint = await next(context)

  if (blueprint.get<string>('stone.adapter.platform') === NODE_CONSOLE_PLATFORM) {
    blueprint.set('stone.kernel.eventHandler', MetaCommandRouterEventHandler)

    const module = context.modules.find(module => hasMetadata(module, STONE_APP_KEY))

    if (isNotEmpty(module?.prototype?.handle)) {
      blueprint.add('stone.adapter.commands', [{ module, options: { name: '*' }, isClass: true }])
    }
  }

  return blueprint
}

/**
 * Middleware to dynamically set response resolver for adapter.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetNodeCliResponseResolverMiddleware(context, next)
 * ```
 */
export const SetNodeCliResponseResolverMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === NODE_CONSOLE_PLATFORM) {
    context.blueprint.set('stone.kernel.skipMiddleware', true)
    context.blueprint.set(
      'stone.kernel.responseResolver',
      (options: OutgoingResponseOptions) => OutgoingResponse.create({ statusCode: 0, ...options })
    )
  }

  return await next(context)
}

/**
 * Configuration for adapter processing middleware.
 *
 * This array defines a list of middleware pipes, each with a `pipe` function and a `priority`.
 * These pipes are executed in the order of their priority values, with lower values running first.
 */
export const metaAdapterBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetConsoleCommandMiddleware, priority: 1 },
  { module: SetConsoleRouterEventHandlerMiddleware, priority: 1 },
  { module: SetNodeCliResponseResolverMiddleware, priority: 6 }
]
