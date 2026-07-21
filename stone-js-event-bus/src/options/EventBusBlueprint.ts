import { EventBusConfig } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { EventBusServiceProvider } from '../EventBusServiceProvider'

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
 * Blueprint for the event-bus module (emit side).
 */
export interface EventBusBlueprint extends StoneBlueprint {
  stone: EventBusAppConfig
}

/**
 * Opt-in blueprint: import and register it (or use `@EventBus()`) to enable the emit side.
 *
 * It contributes the {@link EventBusServiceProvider}, which binds `eventBus` and `eventBusManager`.
 * The listener side is the light key-router from `@stone-js/router` (`@BusListener()`).
 * `stone.providers` is an array, so this merges.
 */
export const eventBusBlueprint: EventBusBlueprint = {
  stone: {
    eventBus: {},
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
