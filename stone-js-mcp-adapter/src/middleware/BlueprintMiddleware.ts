import { McpOptions, MCP_PLATFORM } from '../declarations'
import { ClassType, BlueprintContext, IBlueprint, MetaMiddleware, NextMiddleware, OutgoingResponse, OutgoingResponseOptions } from '@stone-js/core'

/** A key-route the app's key-router will register (kept inline to avoid a router dependency). */
interface KeyRouteDefinition {
  key: string
  module: unknown
}

/**
 * Blueprint middleware for the MCP platform. The adapter owns NO routing: its only job is
 * Integration (turn a tool call into an `IncomingEvent`). Here it simply contributes each declared
 * tool as a key-route (`tool.name` -> `tool.handler`) under `stone.keyRouting.definitions`, and sets
 * a response resolver. The app supplies the router with `@KeyRouting()`, whose standard
 * `KeyRoutingEventHandler` becomes the kernel handler and dispatches each tool call through the
 * exact same kernel (middleware, DI, hooks) as any other Stone.js event. Guarded by the running
 * platform, so stacking `@Mcp` with other adapters leaves their routing untouched.
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
    const tools = context.blueprint.get<McpOptions>('stone.mcp', {}).tools ?? []
    const existing = context.blueprint.get<KeyRouteDefinition[]>('stone.keyRouting.definitions', [])
    const definitions: KeyRouteDefinition[] = tools.map((tool) => ({ key: tool.name, module: tool.handler }))

    context.blueprint
      .set('stone.kernel.responseResolver', (options: OutgoingResponseOptions) => OutgoingResponse.create(options))
      .set('stone.keyRouting.definitions', [...existing, ...definitions])
  }

  return await next(context)
}

/**
 * Adapter blueprint middleware for the MCP platform.
 */
export const metaAdapterBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetMcpKernelMiddleware, priority: 6 }
]
