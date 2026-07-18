import { NODE_CONSOLE_PLATFORM } from '../constants'
import { RouterEventHandler } from '../RouterEventHandler'
import { GROUP_KEY, MATCH_KEY } from '../decorators/constants'
import { RouterCommand, routerCommandOptions } from '../commands/RouterCommand'
import { EventHandlerClass, IIncomingEvent, RouteDefinition } from '../declarations'
import { BlueprintContext, IBlueprint, ClassType, hasMetadata, getMetadata, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Middleware to process and register route definitions from modules.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * RouteDefinitionsMiddleware(context, next)
 * ```
 */
export async function RouteDefinitionsMiddleware<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> (
  context: BlueprintContext<IBlueprint, EventHandlerClass<IncomingEventType, OutgoingResponseType>>,
  next: NextMiddleware<BlueprintContext<IBlueprint, EventHandlerClass<IncomingEventType, OutgoingResponseType>>, IBlueprint>
): Promise<IBlueprint> {
  context
    .modules
    .filter(module => hasMetadata(module, GROUP_KEY))
    .forEach(module => {
      const children = getMetadata<ClassType, Array<RouteDefinition<IncomingEventType, OutgoingResponseType>>>(module, MATCH_KEY, [])
      const parent = getMetadata<ClassType, RouteDefinition<IncomingEventType, OutgoingResponseType>>(module, GROUP_KEY, { path: '/' })
      parent.children = children
      parent.handler = { ...parent.handler, module }
      context.blueprint.add('stone.router.definitions', [parent])
    })

  return await next(context)
}

/**
 * Middleware to set the router as the main event handler for the application.
 *
 * This middleware takes precedence over all other event handlers middleware
 * expect the console event handler middleware when in console mode.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next function in the pipeline.
 * @returns The updated blueprint.
 *
 * @example
 * ```typescript
 * SetRouterEventHandlerMiddleware({ modules, blueprint }, next);
 * ```
 */
export async function SetRouterEventHandlerMiddleware (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> {
  context.blueprint.set('stone.kernel.eventHandler', { module: RouterEventHandler, isClass: true })

  return await next(context)
}

/**
 * Middleware to set router commands for Node CLI adapters.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetRouterCommandsMiddleware(context, next)
 * ```
 */
export const SetRouterCommandsMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === NODE_CONSOLE_PLATFORM) {
    context.blueprint.add('stone.adapter.commands', [{ options: routerCommandOptions, isClass: true, module: RouterCommand }])
  }

  return await next(context)
}

/**
 * Configuration for route processing middleware.
 *
 * This array defines a list of middleware pipes, each with a `pipe` function and a `priority`.
 * These pipes are executed in the order of their priority values, with lower values running first.
 *
 * @example
 * ```typescript
 * const middlewares = routeConfigMiddleware;
 * middlewares.forEach(({ pipe, priority }) => {
 *   // Execute each middleware in order of priority
 * });
 * ```
 */
export const metaRouterBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: RouteDefinitionsMiddleware, priority: 3 },
  { module: SetRouterCommandsMiddleware, priority: 5 },
  { module: SetRouterEventHandlerMiddleware, priority: 5 }
]
