import { McpAdapter } from './McpAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for the MCP adapter.
 *
 * @param blueprint - The application blueprint.
 * @returns A `McpAdapter` instance.
 */
export const mcpAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return McpAdapter.create(blueprint)
}
