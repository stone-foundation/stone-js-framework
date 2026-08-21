import { DEFAULT_HEALTH_PATH, HealthHandler } from '../HealthHandler'
import { DEFAULT_VERSION_PATH, VersionHandler } from '../VersionHandler'
import { TelemetryOptions } from '../declarations'
import { BlueprintContext, IBlueprint, MetaMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Publish the two operational endpoints as routes, when there is a router to publish them on.
 *
 * `/health` answers a verdict to a platform that cannot read; `/version` answers a fact to a person
 * mid-investigation. Two questions, two endpoints, and neither belongs in an application's controllers:
 * a blueprint middleware publishes them, for the same reason `@stone-js/openapi` publishes its own.
 * Either `path: false` serves nothing, for a deployment that answers that question elsewhere.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export const TelemetryRoutesMiddleware = async (
  context: BlueprintContext<IBlueprint>,
  next: NextMiddleware<BlueprintContext<IBlueprint>, IBlueprint>
): Promise<IBlueprint> => {
  const blueprint = await next(context)
  const telemetry = blueprint.get<TelemetryOptions>('stone.telemetry', {})
  const health = telemetry.health ?? {}
  const version = telemetry.version ?? {}

  if (health.path !== false) {
    blueprint.add('stone.router.definitions', [
      {
        path: pathOf(health.path, DEFAULT_HEALTH_PATH),
        method: 'GET',
        name: 'telemetry.health',
        // Kept out of the API surface, like the one below: a contract describing `/health` tells a
        // consumer nothing they can use.
        contract: false,
        handler: { module: HealthHandler, action: 'handle', isClass: true }
      }
    ])
  }

  if (version.path !== false) {
    blueprint.add('stone.router.definitions', [
      {
        path: pathOf(version.path, DEFAULT_VERSION_PATH),
        method: 'GET',
        name: 'telemetry.version',
        contract: false,
        handler: { module: VersionHandler, action: 'handle', isClass: true }
      }
    ])
  }

  return blueprint
}

/**
 * Where an endpoint answers: what was declared, or the default.
 *
 * @param declared - What the application declared.
 * @param fallback - The default path.
 * @returns The path.
 */
function pathOf (declared: string | false | undefined, fallback: string): string {
  return typeof declared === 'string' && declared.length > 0 ? declared : fallback
}

/**
 * Meta blueprint middleware for the operational endpoints.
 */
export const MetaTelemetryRoutesMiddleware: MetaMiddleware<BlueprintContext<IBlueprint>, IBlueprint> = {
  module: TelemetryRoutesMiddleware,
  priority: 5
}
