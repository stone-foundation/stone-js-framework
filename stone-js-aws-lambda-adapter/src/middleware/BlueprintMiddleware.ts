import { AWS_LAMBDA_PLATFORM } from '../constants'
import { ClassType, BlueprintContext, IBlueprint, OutgoingResponse, OutgoingResponseOptions, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Middleware to dynamically set response resolver for adapter.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetAwsLambdaResponseResolverMiddleware(context, next)
 * ```
 */
export const SetAwsLambdaResponseResolverMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === AWS_LAMBDA_PLATFORM) {
    context.blueprint.set('stone.kernel.responseResolver', (options: OutgoingResponseOptions) => OutgoingResponse.create(options))
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
  { module: SetAwsLambdaResponseResolverMiddleware, priority: 6 }
]
