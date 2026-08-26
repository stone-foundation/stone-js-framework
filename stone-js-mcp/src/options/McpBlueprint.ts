import { McpConfig } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { MetaMcpRouteMiddleware } from '../middleware/McpRouteMiddleware'

/** Application config augmented with the MCP bucket. */
export interface McpAppConfig extends Partial<AppConfig> {
  mcp: McpConfig
}

/** Blueprint for the MCP module. */
export interface McpBlueprint extends StoneBlueprint {
  stone: McpAppConfig
}

/**
 * Opt-in blueprint: register it to expose your routes as tools.
 *
 * The imperative half of the pair; `@Mcp()` is the declarative one. One route appears, `/mcp` by
 * default, and nothing else changes. No route becomes a tool until it says `mcp`.
 *
 * @example
 * ```ts
 * import { defineConfig, defineStoneApp } from '@stone-js/core'
 * import { mcpBlueprint } from '@stone-js/mcp'
 *
 * export const App = defineStoneApp({ name: 'app' }, [mcpBlueprint])
 *
 * export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.mcp', {
 *   instructions: 'Tools for managing notes. Always read before you write.',
 *   route: { auth: true }
 * }))
 * ```
 */
export const mcpBlueprint: McpBlueprint = {
  stone: {
    mcp: {},
    blueprint: {
      middleware: [
        MetaMcpRouteMiddleware
      ]
    }
  }
}
