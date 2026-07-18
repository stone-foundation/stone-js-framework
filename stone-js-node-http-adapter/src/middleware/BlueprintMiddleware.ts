import { File } from '@stone-js/filesystem'
import { NODE_HTTP_PLATFORM } from '../constants'
import { BinaryFileResponse, OutgoingHttpResponse, OutgoingHttpResponseOptions } from '@stone-js/http-core'
import { ClassType, IBlueprint, BlueprintContext, AdapterConfig, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Middleware to dynamically set response resolver for adapter.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetNodeHttpResponseResolverMiddleware(context, next)
 * ```
 */
export const SetNodeHttpResponseResolverMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === NODE_HTTP_PLATFORM) {
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
 * Middleware to dynamically set node http adapter as the default adapter.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetNodeHttpDefaultAdapterMiddleware(context, next)
 * ```
 */
export const SetNodeHttpDefaultAdapterMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  const hasDefaultAdapter = context.blueprint.get<AdapterConfig[]>('stone.adapters', []).some((adapter) => adapter.default === true)
  if (!hasDefaultAdapter) {
    context.blueprint.get<AdapterConfig[]>('stone.adapters', []).forEach((adapter) => {
      if (adapter.platform === NODE_HTTP_PLATFORM) {
        adapter.default = true
      }
    })
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
  { module: SetNodeHttpDefaultAdapterMiddleware, priority: 0 },
  { module: SetNodeHttpResponseResolverMiddleware, priority: 6 }
]
