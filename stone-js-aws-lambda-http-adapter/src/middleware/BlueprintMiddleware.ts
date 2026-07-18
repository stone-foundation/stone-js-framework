import { File } from '@stone-js/filesystem'
import { AWS_LAMBDA_HTTP_PLATFORM } from '../constants'
import { ClassType, BlueprintContext, IBlueprint, MetaMiddleware, NextMiddleware } from '@stone-js/core'
import { BinaryFileResponse, OutgoingHttpResponse, OutgoingHttpResponseOptions } from '@stone-js/http-core'

/**
 * Middleware to dynamically set response resolver for adapter.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetAwsLambdaHttpResponseResolverMiddleware(context, next)
 * ```
 */
export const SetAwsLambdaHttpResponseResolverMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === AWS_LAMBDA_HTTP_PLATFORM) {
    context.blueprint.set(
      'stone.kernel.responseResolver',
      (options: OutgoingHttpResponseOptions) => {
        return options.content instanceof File
          ? BinaryFileResponse.file({ ...options, content: undefined, file: options.content })
          : OutgoingHttpResponse.create(options)
      }
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
  { module: SetAwsLambdaHttpResponseResolverMiddleware, priority: 6 }
]
