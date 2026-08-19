import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { KeyRoutingConfig, KeyRouteDefinition } from '../keyRoutingDeclarations'
import { KeyRoutingServiceProvider } from '../KeyRoutingServiceProvider'
import { metaKeyRoutingBlueprintMiddleware } from '../middleware/KeyRoutingBlueprintMiddleware'

/**
 * The `stone.keyRouting` configuration bucket.
 */
export interface KeyRoutingModuleConfig extends KeyRoutingConfig {}

/**
 * Application config augmented with the key-routing bucket.
 */
export interface KeyRoutingAppConfig extends Partial<AppConfig> {
  keyRouting: KeyRoutingModuleConfig
}

/**
 * Blueprint for the light key-router.
 */
export interface KeyRoutingBlueprint extends StoneBlueprint {
  stone: KeyRoutingAppConfig
}

/**
 * Opt-in blueprint: register it (via `@KeyRouting()` or directly) to enable the light key-router.
 *
 * It contributes the {@link KeyRoutingServiceProvider} (binds `keyRouter`) and the blueprint
 * middleware that makes the light router the kernel event handler. Mutually exclusive with the full
 * `@Routing()`.
 */
export const keyRoutingBlueprint: KeyRoutingBlueprint = {
  stone: {
    keyRouting: {},
    blueprint: {
      middleware: metaKeyRoutingBlueprintMiddleware
    },
    providers: [
      KeyRoutingServiceProvider
    ]
  }
}

/**
 * Build a key-route definition for `stone.keyRouting.definitions`.
 *
 * @param key - The routing key.
 * @param handler - The handler function, instance, class or factory.
 * @param options - Whether it is a class/factory and which method to call.
 * @returns A key-route definition.
 *
 * @example
 * ```typescript
 * defineKeyRouting({ definitions: [ defineKeyRoute('order.shipped', OnShipped, { isClass: true }) ] })
 * ```
 */
export function defineKeyRoute (
  key: string,
  handler: unknown,
  options: { isClass?: boolean, isFactory?: boolean, action?: string } = {}
): KeyRouteDefinition {
  return { key, module: handler, ...options }
}
