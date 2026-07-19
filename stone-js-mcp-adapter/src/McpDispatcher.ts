import { McpTool, McpOptions } from './declarations'
import { IBlueprint, IncomingEvent } from '@stone-js/core'

/**
 * The kernel event handler for the MCP platform.
 *
 * Every MCP tool call arrives as an `IncomingEvent` carrying the tool name and arguments; this
 * dispatcher looks the tool up in `stone.mcp.tools` and runs its handler — so tool calls flow
 * through the same kernel (middleware, DI, hooks) as any other Stone.js event.
 */
export class McpDispatcher {
  private readonly blueprint: IBlueprint

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Route the event to the matching tool's handler.
   *
   * @param event - The incoming event (metadata: `_mcpTool`, `_mcpArgs`).
   * @returns The tool's result.
   * @throws {Error} When the tool is unknown.
   */
  async handle (event: IncomingEvent): Promise<unknown> {
    const name = event.get<string>('_mcpTool', '')
    const args = event.get<Record<string, unknown>>('_mcpArgs', {})
    const tools = this.blueprint.get<McpOptions>('stone.mcp', {}).tools ?? []
    const tool = tools.find((candidate: McpTool) => candidate.name === name)

    if (tool === undefined) {
      throw new Error(`Unknown MCP tool: ${name}`)
    }

    return tool.handler(args, event)
  }
}
