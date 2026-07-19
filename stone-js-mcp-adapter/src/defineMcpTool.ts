import { McpTool } from './declarations'
import { StoneBlueprint } from '@stone-js/core'

/**
 * Identity helper that types a tool definition.
 *
 * @param tool - The tool definition.
 * @returns The same tool, typed.
 */
export function defineMcpTool (tool: McpTool): McpTool {
  return tool
}

/**
 * Builds a blueprint fragment registering MCP tools (`stone.mcp.tools`). Add it to your app's
 * modules to expose the tools to agents.
 *
 * @param tools - The tools to expose.
 * @returns A partial blueprint.
 */
export function defineMcpTools (tools: McpTool[]): Partial<StoneBlueprint> {
  return { stone: { mcp: { tools } } } as unknown as Partial<StoneBlueprint>
}
