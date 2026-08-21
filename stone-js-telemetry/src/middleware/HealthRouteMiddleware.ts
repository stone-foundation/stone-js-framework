import { DEFAULT_HEALTH_PATH, HealthHandler } from '../HealthHandler'
import { HealthOptions, TelemetryOptions } from '../declarations'
import { BlueprintContext, IBlueprint, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Publish the health probe as a route, when there is a router to publish it on.
 *
 * A blueprint middleware rather than a decorator on a handler, for the same reason `@stone-js/openapi`
 * does it: the endpoint belongs to the module, not to the application, and an application should get it
 * by enabling telemetry rather than by writing a controller. `path: false` serves nothing, for a
 * deployment where the probe is answered elsewhere.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export const HealthRouteMiddleware = async (
  context: BlueprintContext<IBlueprint>,
  next: NextMiddleware<BlueprintContext<IBlueprint>, IBlueprint>
): Promise<IBlueprint> => {
  const blueprint = await next(context)
  const health = blueprint.get<TelemetryOptions>('stone.telemetry', {}).health ?? {}

  if (health.path === false) { return blueprint }

  blueprint.add('stone.router.definitions', [
    {
      path: pathOf(health),
      method: 'GET',
      name: 'telemetry.health',
      // Documented as a probe, not as part of the API surface: a contract describing `/health` tells a
      // consumer nothing they can use.
      contract: false,
      handler: { module: HealthHandler, action: 'handle', isClass: true }
    }
  ])

  return blueprint
}

/**
 * Where the probe answers.
 *
 * @param health - The health options.
 * @returns The path.
 */
function pathOf (health: HealthOptions): string {
  return typeof health.path === 'string' && health.path.length > 0 ? health.path : DEFAULT_HEALTH_PATH
}

/**
 * Meta blueprint middleware for the health probe.
 */
export const MetaHealthRouteMiddleware: MetaMiddleware<BlueprintContext<IBlueprint>, IBlueprint> = {
  module: HealthRouteMiddleware,
  priority: 5
}
