import { Match } from './Match'
import { PATCH } from '../constants'
import { DecoratorRouteDefinition } from '../declarations'

/**
 * Options for the `Patch` decorator, extending route definition options.
 *
 * Excludes the `methods` property from `DecoratorRouteDefinition` as it is predefined.
 */
export interface PatchOptions extends Omit<DecoratorRouteDefinition, 'methods'> {}

/**
 * A method decorator for defining HTTP PATCH routes.
 *
 * @param path - The route path for the PATCH endpoint.
 * @param options - Optional configuration for the route.
 * @returns A method decorator configured for a PATCH route.
 *
 * @example
 * ```typescript
 * @Patch('/update-partial')
 * updatePartialResource() {
 *   return 'Resource partially updated';
 * }
 * ```
 */
export const Patch = (path: string | string[], options?: PatchOptions): MethodDecorator => Match(path, { ...options, methods: [PATCH] })
