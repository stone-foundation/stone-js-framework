import { Match } from './Match'
import { DELETE } from '../constants'
import { DecoratorRouteDefinition } from '../declarations'

/**
 * Options for the `Delete` decorator, extending route definition options.
 *
 * Excludes the `methods` property from `DecoratorRouteDefinition` as it is predefined.
 */
export interface DeleteOptions extends Omit<DecoratorRouteDefinition, 'methods'> {}

/**
 * A method decorator for defining HTTP DELETE routes.
 *
 * @param path - The route path for the DELETE endpoint.
 * @param options - Optional configuration for the route.
 * @returns A method decorator configured for a DELETE route.
 *
 * @example
 * ```typescript
 * @Delete('/resource/:id')
 * deleteResource() {
 *   return 'Resource deleted';
 * }
 * ```
 */
export const Delete = (path: string | string[], options?: DeleteOptions): MethodDecorator => Match(path, { ...options, methods: [DELETE] })
