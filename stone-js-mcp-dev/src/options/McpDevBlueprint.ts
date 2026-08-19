import { McpDevOptions } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { PublishAppContextHook } from '../hooks/PublishAppContextHook'
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
    // The app half of this module: whichever platform the application runs as, it leaves its resolved
    // configuration where the MCP server can read it. The command half registers itself on the
    // console platform; one activation covers both, because they are two halves of one job.
    lifecycleHooks: {
      onStart: [PublishAppContextHook]
    },
    mcpDev: {
      tools: []
    }
  } as unknown as McpDevAppConfig
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
      lifecycleHooks: {
        onStart: [PublishAppContextHook]
      },
      mcpDev: options
    } as unknown as McpDevAppConfig
  }
}
