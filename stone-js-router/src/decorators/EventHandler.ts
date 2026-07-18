import { GROUP_KEY } from './constants'
import { DecoratorGroupRouteDefinition } from '../declarations'
import { classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Options for the `EventHandler` decorator, extending group route definition options.
 */
export interface EventHandlerOptions extends DecoratorGroupRouteDefinition {}

/**
 * A class decorator for defining an event handler group.
 *
 * @param path - The base path for the group of routes.
 * @param options - Optional configuration for the route group.
 * @returns A class decorator configured for a group of routes.
 *
 * @example
 * ```typescript
 * @EventHandler('/users')
 * class UserHandler {
 *   // Grouped route handlers
 * }
 * ```
 */
export const EventHandler = <T extends ClassType = ClassType>(path: string = '/', options?: EventHandlerOptions): ClassDecorator => {
  return classDecoratorLegacyWrapper((_target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true })
    setMetadata(context, GROUP_KEY, { ...options, path, handler: { action: 'handle', isClass: true } })
  })
}
