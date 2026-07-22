import { McpDevOptions } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { metaMcpDevBlueprintMiddleware } from '../middleware/BlueprintMiddleware'

/**
 * MCP dev configuration bucket (`stone.mcpDev`).
 */
export interface McpDevConfig extends McpDevOptions {}

/**
 * Application config augmented with the MCP dev bucket.
 */
export interface McpDevAppConfig extends Partial<AppConfig> {
  mcpDev: Partial<McpDevConfig>
}

/**
 * Blueprint for the MCP dev module.
 */
export interface McpDevBlueprint extends StoneBlueprint {
  stone: McpDevAppConfig
}

/**
 * Opt-in blueprint: import and register it to add the `stone mcp` command.
 *
 * It contributes a blueprint middleware that registers the command on the Node CLI adapter. Add
 * your own tools and the server name/instructions under `stone.mcpDev` (or via `@McpDev()` /
 * `defineMcpDev()`).
 */
export const mcpDevBlueprint: McpDevBlueprint = {
  stone: {
    blueprint: {
      middleware: metaMcpDevBlueprintMiddleware
    },
    mcpDev: {
      tools: []
    }
  }
}

/**
 * Imperative helper: build an MCP dev blueprint with the given options.
 *
 * @param options - The MCP dev options (server name, instructions, your tools, report tools).
 * @returns The blueprint to register in your app.
 */
export function defineMcpDev (options: McpDevOptions = {}): McpDevBlueprint {
  return {
    stone: {
      blueprint: {
        middleware: metaMcpDevBlueprintMiddleware
      },
      mcpDev: options
    }
  }
}
