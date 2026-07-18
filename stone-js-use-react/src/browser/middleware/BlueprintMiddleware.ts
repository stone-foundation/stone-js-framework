import {
  ClassType,
  IBlueprint,
  Promiseable,
  NextMiddleware,
  MetaMiddleware,
  BlueprintContext
} from '@stone-js/core'
import {
  SetUseReactHooksMiddleware,
  SetReactPageLayoutMiddleware,
  SetReactViewProvidersMiddleware,
  SetUseReactEventHandlerMiddleware,
  SetReactKernelErrorPageMiddleware,
  SetReactRouteDefinitionsMiddleware
} from '../../middleware/BlueprintMiddleware'
import { setUseReactAdapterErrorHandler } from '../../middleware/utils'
import { MetaBrowserResponseMiddleware } from './BrowserResponseMiddleware'
import { UseReactBrowserErrorHandler } from '../UseReactBrowserErrorHandler'

/**
 * Blueprint middleware to set BrowserResponseMiddleware for the Browser adapter.
 *
 * The MetaBrowserResponseMiddleware is an adapter middleware and is useful
 * for handling outgoing responses and rendering them in the browser.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetBrowserResponseMiddlewareMiddleware(context, next)
 * ```
 */
export const SetBrowserResponseMiddlewareMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  context.blueprint.add('stone.adapter.middleware', [MetaBrowserResponseMiddleware])

  return await next(context)
}

/**
 * Blueprint middleware to process and register adapter error page definitions from modules.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetReactAdapterErrorPageMiddleware(context, next)
 * ```
 */
export const SetReactAdapterErrorPageMiddleware = (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promiseable<IBlueprint> => {
  return next(setUseReactAdapterErrorHandler(UseReactBrowserErrorHandler, context))
}

/**
 * Configuration for react processing middleware.
 *
 * This array defines a list of middleware pipes, each with a `pipe` function and a `priority`.
 * These pipes are executed in the order of their priority values, with lower values running first.
 */
export const metaBrowserUseReactBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetUseReactHooksMiddleware, priority: 10 },
  { module: SetReactPageLayoutMiddleware, priority: 10 },
  { module: SetReactViewProvidersMiddleware, priority: 10 },
  { module: SetUseReactEventHandlerMiddleware, priority: 2 },
  { module: SetReactKernelErrorPageMiddleware, priority: 10 },
  { module: SetReactAdapterErrorPageMiddleware, priority: 10 },
  { module: SetReactRouteDefinitionsMiddleware, priority: 10 },
  { module: SetBrowserResponseMiddlewareMiddleware, priority: 10 }
]
