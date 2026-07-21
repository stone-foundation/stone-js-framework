import { AWS_APIGW_WS_PLATFORM } from '../constants'
import { ClassType, BlueprintContext, IBlueprint, OutgoingResponse, OutgoingResponseOptions, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Blueprint middleware: set the kernel response resolver when this adapter is current.
 *
 * @param context - The blueprint context.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetApiGatewayWsResponseResolverMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === AWS_APIGW_WS_PLATFORM) {
    context.blueprint.set('stone.kernel.responseResolver', (options: OutgoingResponseOptions) => OutgoingResponse.create(options))
  }

  return await next(context)
}

/**
 * Adapter blueprint middleware pipes, ordered by priority (lower runs first).
 */
export const metaAdapterBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetApiGatewayWsResponseResolverMiddleware, priority: 6 }
]
