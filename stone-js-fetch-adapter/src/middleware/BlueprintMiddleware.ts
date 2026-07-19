import { FETCH_PLATFORM } from '../constants'
import { OutgoingHttpResponse, OutgoingHttpResponseOptions } from '@stone-js/http-core'
import { ClassType, BlueprintContext, IBlueprint, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Blueprint middleware that installs the kernel response resolver for the Fetch platform.
 *
 * The kernel needs a resolver to turn a handler's return value into an `OutgoingHttpResponse`.
 * (Binary file responses are deferred to a later release; JSON/text/bytes are covered.)
 *
 * @param context - The blueprint context.
 * @param next - The next pipe.
 * @returns The updated blueprint.
 */
export const SetFetchResponseResolverMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === FETCH_PLATFORM) {
    context.blueprint.set(
      'stone.kernel.responseResolver',
      (options: OutgoingHttpResponseOptions) => OutgoingHttpResponse.create(options)
    )
  }

  return await next(context)
}

/**
 * Adapter blueprint middleware for the Fetch platform.
 */
export const metaAdapterBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetFetchResponseResolverMiddleware, priority: 6 }
]
