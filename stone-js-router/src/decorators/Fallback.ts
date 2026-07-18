import { Match } from './Match'
import { GET } from '../constants'
import { DecoratorRouteDefinition } from '../declarations'

/**
 * Options for the `Fallback` decorator, extending route definition options.
 *
 * Excludes the `methods` and `fallback` properties from `DecoratorRouteDefinition` as they are predefined.
 */
export interface FallbackOptions extends Omit<DecoratorRouteDefinition, 'methods' | 'fallback'> {}

/**
 * A method decorator for defining a fallback HTTP GET route.
 *
 * @param options - Optional configuration for the route.
 * @returns A method decorator configured for a fallback GET route.
 *
 * @example
 * ```typescript
 * @Fallback()
 * handleFallback() {
 *   return 'Fallback route';
 * }
 * ```
 */
export const Fallback = (options?: FallbackOptions): MethodDecorator => Match('/:__fallback__(.*)*', { ...options, methods: [GET], fallback: true })
