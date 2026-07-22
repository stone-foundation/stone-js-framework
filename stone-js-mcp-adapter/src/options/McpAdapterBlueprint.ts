import { mcpAdapterResolver } from '../resolvers'
import { McpExecutionContext, McpOptions, MCP_PLATFORM } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * Adapter configuration for the MCP adapter.
 */
export interface McpAdapterAdapterConfig extends AdapterConfig<
IncomingEvent,
OutgoingResponse,
McpExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {}

/**
 * Application config for the MCP adapter.
 */
export interface McpAdapterConfig extends Partial<AppConfig> {
  mcp: McpOptions
}

/**
 * Blueprint for the MCP adapter.
 */
export interface McpAdapterBlueprint extends StoneBlueprint {
  stone: McpAdapterConfig
}

/**
 * Default blueprint for the MCP adapter.
 *
 * Registers the adapter and wires the kernel (via the blueprint middleware) to route tool calls
 * through the framework's standard key-router: each `stone.mcp.tools` entry becomes a key-route.
 * Not `default` — opt in with `@Mcp({ default: true })` or by making it the only adapter. Declare
 * tools under `stone.mcp.tools` (see `defineMcpTools` / `defineMcp`).
 */
export const mcpAdapterBlueprint: McpAdapterBlueprint = {
  stone: {
    mcp: {},
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        default: false,
        variant: 'server',
        platform: MCP_PLATFORM,
        middleware: [],
        resolver: mcpAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {}
      }
    ]
  } as unknown as McpAdapterConfig
}
