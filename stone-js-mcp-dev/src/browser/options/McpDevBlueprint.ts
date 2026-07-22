import { McpDevOptions } from '../../declarations'
import { McpDevBlueprint } from '../../options/McpDevBlueprint'

/**
 * Browser stub of the MCP dev blueprint.
 *
 * It carries the config bucket but wires **no** blueprint middleware, so importing it into a browser
 * bundle never pulls the Node-only `stone mcp` command, its server (`@modelcontextprotocol/sdk`,
 * stdio) or the filesystem. The `stone mcp` command is a development, Node-only concern; in the
 * browser this keeps the app compiling and inert.
 */
export const mcpDevBlueprint: McpDevBlueprint = { stone: { mcpDev: {} } }

/**
 * Browser stub of `defineMcpDev`: returns the config bucket with no Node wiring.
 *
 * @param options - The MCP dev options.
 * @returns The (inert) blueprint.
 */
export function defineMcpDev (options: McpDevOptions = {}): McpDevBlueprint {
  return { stone: { mcpDev: options } }
}
