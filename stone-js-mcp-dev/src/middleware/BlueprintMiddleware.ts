import { NODE_CONSOLE_PLATFORM } from '../constants'
import { McpCommand, mcpCommandOptions } from '../commands/McpCommand'
import { BlueprintContext, IBlueprint, ClassType, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Middleware that registers the `mcp` command when the app runs on the Node CLI adapter.
 *
 * It mirrors the router's command registration: contribute a `MetaCommandHandler` to
 * `stone.adapter.commands` so the CLI (itself a Stone.js app on the Node CLI adapter) discovers
 * `stone mcp` by introspection, no hard-coding.
 *
 * @param context - The blueprint context.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetMcpCommandsMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === NODE_CONSOLE_PLATFORM) {
    context.blueprint.add('stone.adapter.commands', [{ options: mcpCommandOptions, isClass: true, module: McpCommand }])
  }

  return await next(context)
}

/**
 * The blueprint middleware contributed by the MCP dev module.
 */
export const metaMcpDevBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetMcpCommandsMiddleware, priority: 5 }
]
