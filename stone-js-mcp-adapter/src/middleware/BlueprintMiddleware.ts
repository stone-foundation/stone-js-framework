import { MCP_PLATFORM } from '../declarations'
import { McpDispatcher } from '../McpDispatcher'
import { ClassType, BlueprintContext, IBlueprint, MetaMiddleware, NextMiddleware, OutgoingResponse, OutgoingResponseOptions } from '@stone-js/core'

/**
 * Blueprint middleware that wires the kernel for the MCP platform: the {@link McpDispatcher}
 * becomes the event handler (routing tool calls to their handlers) and a response resolver wraps
 * handler results into an `OutgoingResponse`.
 *
 * @param context - The blueprint context.
 * @param next - The next pipe.
 * @returns The updated blueprint.
 */
export const SetMcpKernelMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === MCP_PLATFORM) {
    context.blueprint
      .set('stone.kernel.eventHandler', { module: McpDispatcher, isClass: true })
      .set('stone.kernel.responseResolver', (options: OutgoingResponseOptions) => OutgoingResponse.create(options))
  }

  return await next(context)
}

/**
 * Adapter blueprint middleware for the MCP platform.
 */
export const metaAdapterBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetMcpKernelMiddleware, priority: 6 }
]
