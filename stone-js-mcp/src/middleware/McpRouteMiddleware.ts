import { McpHandler } from '../McpHandler'
import { McpConfig } from '../declarations'
import { DEFAULT_MCP_PATH, MCP_ROUTE_NAME } from '../constants'
import { BlueprintContext, IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'

/**
 * Build-phase middleware: registers the endpoint, with its path taken from configuration.
 *
 * A middleware rather than a static route on the blueprint, because the path is configurable and a
 * blueprint constant is evaluated before the application has said anything. Reading configuration is
 * only safe once everything has been collected, which is why this runs after `next`.
 *
 * The route is added to `stone.router.definitions`, the array the router scans, so nothing here
 * depends on the router package.
 *
 * `stone.mcp.route` is spread onto the definition, so the endpoint is protected the way any other
 * route is: `auth`, `authz`, `rateLimit`, `middleware`. This module invents no options of its own
 * for that, because a second permission model is a second thing to keep in step with the first.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export const McpRouteMiddleware = async (
  context: BlueprintContext<IBlueprint>,
  next: NextMiddleware<BlueprintContext<IBlueprint>, IBlueprint>
): Promise<IBlueprint> => {
  const blueprint = await next(context)
  const options = blueprint.get<McpConfig>('stone.mcp', {})

  blueprint.add('stone.router.definitions', [
    {
      name: MCP_ROUTE_NAME,
      ...options.route,
      path: options.path ?? DEFAULT_MCP_PATH,
      method: 'POST',
      handler: { module: McpHandler, action: 'handle', isClass: true }
    }
  ])

  return blueprint
}

/**
 * Meta blueprint middleware for the MCP module.
 */
export const MetaMcpRouteMiddleware: MetaMiddleware<BlueprintContext<IBlueprint>, IBlueprint> = {
  module: McpRouteMiddleware,
  priority: 5
}
