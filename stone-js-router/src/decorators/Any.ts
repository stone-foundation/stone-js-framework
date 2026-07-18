import { Match } from './Match'
import { DecoratorRouteDefinition } from '../declarations'
import { DELETE, GET, OPTIONS, PATCH, POST, PUT } from '../constants'

/**
 * Options for the `Any` decorator, extending route definition options.
 *
 * Excludes the `methods` property from `DecoratorRouteDefinition` as it is predefined.
 */
export interface AnyOptions extends Omit<DecoratorRouteDefinition, 'methods'> {}

/**
 * A method decorator for defining a route that responds to any HTTP method.
 *
 * @param path - The route path for the endpoint.
 * @param options - Optional configuration for the route.
 * @returns A method decorator configured for all HTTP methods.
 *
 * @example
 * ```typescript
 * @Any('/resource')
 * handleAnyMethod() {
 *   return 'Handled any HTTP method';
 * }
 * ```
 */
export const Any = (path: string | string[], options?: AnyOptions): MethodDecorator => Match(path, { ...options, methods: [GET, POST, PUT, PATCH, DELETE, OPTIONS] })
