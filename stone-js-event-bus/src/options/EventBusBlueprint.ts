import { EventBusConfig, BusHandlerMeta } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { EventBusServiceProvider } from '../EventBusServiceProvider'
import { metaBusBlueprintMiddleware } from '../middleware/BlueprintMiddleware'

/**
 * The `stone.eventBus` configuration bucket.
 */
export interface EventBusModuleConfig extends EventBusConfig {}

/**
 * Application config augmented with the event-bus bucket.
 */
export interface EventBusAppConfig extends Partial<AppConfig> {
  eventBus: EventBusModuleConfig
}

/**
 * Blueprint for the event-bus module.
 */
export interface EventBusBlueprint extends StoneBlueprint {
  stone: EventBusAppConfig
}

/**
 * Opt-in blueprint: import and register it to enable the event bus.
 *
 * It contributes the {@link EventBusServiceProvider} (binds `eventBus`, `eventBusManager`,
 * `eventBusRouter`) and the blueprint middleware that makes the bus the kernel event handler when
 * the listener side is enabled. `stone.providers` is an array, so this merges.
 */
export const eventBusBlueprint: EventBusBlueprint = {
  stone: {
    eventBus: {},
    blueprint: {
      middleware: metaBusBlueprintMiddleware
    },
    providers: [
      EventBusServiceProvider
    ]
  }
}

/**
 * Build an event-bus configuration fragment imperatively (for `defineConfig`/meta-modules).
 *
 * @param config - The event-bus configuration.
 * @returns A partial app config carrying the `eventBus` bucket.
 */
export function defineEventBus (config: EventBusModuleConfig): { eventBus: EventBusModuleConfig } {
  return { eventBus: config }
}

/**
 * Build a bus-handler meta-module for imperative registration under `stone.eventBus.handlers`.
 *
 * @param name - The event name (omit when the class carries `@OnBusEvent` methods).
 * @param handler - The handler function, instance, class or factory.
 * @param options - Whether it is a class/factory and which method to call.
 * @returns A bus-handler meta-module.
 *
 * @example
 * ```typescript
 * defineEventBus({ handlers: [ defineBusHandler('order.shipped', OnShipped, { isClass: true }) ] })
 * ```
 */
export function defineBusHandler (
  name: string | undefined,
  handler: unknown,
  options: { isClass?: boolean, isFactory?: boolean, action?: string } = {}
): BusHandlerMeta {
  return { name, module: handler, ...options }
}
