import { Match } from './Match'
import { PUT } from '../constants'
import { DecoratorRouteDefinition } from '../declarations'

/**
 * Options for the `Put` decorator, extending route definition options.
 *
 * Excludes the `methods` property from `DecoratorRouteDefinition` as it is predefined.
 */
export interface PutOptions extends Omit<DecoratorRouteDefinition, 'methods'> {}

/**
 * A method decorator for defining HTTP PUT routes.
 *
 * @param path - The route path for the PUT endpoint.
 * @param options - Optional configuration for the route.
 * @returns A method decorator configured for a PUT route.
 *
 * @example
 * ```typescript
 * @Put('/update')
 * updateResource() {
 *   return 'Resource updated';
 * }
 * ```
 */
export const Put = (path: string | string[], options?: PutOptions): MethodDecorator => Match(path, { ...options, methods: [PUT] })
