import { IResource } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { MetaResourceRouteMiddleware } from '../middleware/ResourceRouteMiddleware'

/**
 * Resources configuration bucket (`stone.resources`).
 */
export interface ResourcesConfig {
  /**
   * Named resources a route can refer to by name, instead of importing them at the route.
   *
   * ```ts
   * blueprint.set('stone.resources.registry', { user: userResource })
   * // then, on the route: { resource: 'user' }
   * ```
   *
   * Naming a resource that is not registered fails loudly at request time rather than returning the
   * model unshaped, because an unshaped model is exactly what a resource exists to prevent.
   */
  registry?: Record<string, IResource<any, any>>
}

/**
 * Application config augmented with the resources bucket.
 */
export interface ResourcesAppConfig extends Partial<AppConfig> {
  resources: ResourcesConfig
}

/**
 * Blueprint for the resources module.
 */
export interface ResourcesBlueprint extends StoneBlueprint {
  stone: ResourcesAppConfig
}

/**
 * Opt-in blueprint: register it to shape what routes return.
 *
 * It contributes the route middleware that applies whatever a route declared under `resource`.
 * `stone.router.middleware` is an array, so this merges with the rest of the app. The middleware is
 * a no-op on routes that declare nothing.
 *
 * @example
 * ```typescript
 * import { resourcesBlueprint } from '@stone-js/resources'
 *
 * export const Application = defineStoneApp({ name: 'my-app' }, [resourcesBlueprint])
 * ```
 */
export const resourcesBlueprint: ResourcesBlueprint = {
  stone: {
    resources: {},
    router: {
      middleware: [
        MetaResourceRouteMiddleware
      ]
    }
  }
}
