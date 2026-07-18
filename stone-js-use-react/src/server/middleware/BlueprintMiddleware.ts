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
import { UseReactServerErrorHandler } from '../UseReactServerErrorHandler'
import { MetaCompressionMiddleware, MetaStaticFileMiddleware } from '@stone-js/http-core'

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
  return next(setUseReactAdapterErrorHandler(UseReactServerErrorHandler, context))
}

/**
 * Blueprint middleware to set StaticFileMiddleware for SSR adapter.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetSSRStaticFileMiddleware(context, next)
 * ```
 */
export const SetSSRStaticFileMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  context.blueprint.add('stone.kernel.middleware', [MetaStaticFileMiddleware])

  return await next(context)
}

/**
 * Blueprint middleware to set CompressionMiddleware for SSR adapter.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetSSRCompressionMiddleware(context, next)
 * ```
 */
export const SetSSRCompressionMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  context.blueprint.add('stone.kernel.middleware', [MetaCompressionMiddleware])

  return await next(context)
}

/**
 * Configuration for react processing middleware.
 *
 * This array defines a list of middleware pipes, each with a `pipe` function and a `priority`.
 * These pipes are executed in the order of their priority values, with lower values running first.
 */
export const metaServerUseReactBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetSSRStaticFileMiddleware, priority: 10 },
  { module: SetUseReactHooksMiddleware, priority: 10 },
  { module: SetSSRCompressionMiddleware, priority: 10 },
  { module: SetReactPageLayoutMiddleware, priority: 10 },
  { module: SetReactViewProvidersMiddleware, priority: 10 },
  { module: SetUseReactEventHandlerMiddleware, priority: 2 },
  { module: SetReactKernelErrorPageMiddleware, priority: 10 },
  { module: SetReactAdapterErrorPageMiddleware, priority: 10 },
  { module: SetReactRouteDefinitionsMiddleware, priority: 10 }
]
