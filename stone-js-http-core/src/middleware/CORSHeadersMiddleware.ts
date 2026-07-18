import { MetaHandleCorsMiddleware } from './HandleCorsMiddleware'
import { EnsureCorsHeadersHook } from '../hooks/EnsureCorsHeadersHook'
import { BlueprintContext, IBlueprint, ClassType, NextMiddleware } from '@stone-js/core'

/**
 * Blueprint Middleware for setting Cross-Origin Resource Sharing (CORS) headers in the HTTP response.
 *
 * This middleware adds the necessary headers to the HTTP response
 * to allow clients from different origins to access the server's resources.
 *
 * And also ensures that CORS headers are applied even when the middleware is not executed.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next function in the pipeline.
 * @returns The updated blueprint.
 *
 * @example
 * ```typescript
 * CORSHeadersMiddleware({ modules, blueprint }, next);
 * ```
 */
export const CORSHeadersMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  context
    .blueprint
    .add('stone.kernel.middleware', [MetaHandleCorsMiddleware])
    .add('stone.lifecycleHooks.onBuildingRawResponse', [EnsureCorsHeadersHook])

  return await next(context)
}

/**
 * Represents the metadata for the CORSHeadersMiddleware.
 */
export const MetaCORSHeadersMiddleware = { module: CORSHeadersMiddleware, priority: 5 }
