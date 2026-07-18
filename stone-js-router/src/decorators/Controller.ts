import { EventHandler } from './EventHandler'
import { DecoratorGroupRouteDefinition } from '../declarations'

/**
 * Options for the `Controller` decorator, extending group route definition options.
 */
export interface ControllerOptions extends DecoratorGroupRouteDefinition {}

/**
 * A class decorator for defining a controller with a common base path.
 * Configures the class as a singleton service.
 *
 * @param path - The base path for the controller's routes.
 * @param options - Optional configuration for the controller.
 * @returns A class decorator configured for routing and singleton service.
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * class UserController {
 *   // Controller logic
 * }
 * ```
 */
export const Controller = (path: string = '/', options?: ControllerOptions): ClassDecorator => EventHandler(path, options)
