import { Match } from './Match'
import { POST } from '../constants'
import { DecoratorRouteDefinition } from '../declarations'

/**
 * Options for the `Post` decorator, extending route definition options.
 *
 * Excludes the `methods` property from `DecoratorRouteDefinition` as it is predefined.
 */
export interface PostOptions extends Omit<DecoratorRouteDefinition, 'methods'> {}

/**
 * A method decorator for defining HTTP POST routes.
 *
 * @param path - The route path for the POST endpoint.
 * @param options - Optional configuration for the route.
 * @returns A method decorator configured for a POST route.
 *
 * @example
 * ```typescript
 * @Post('/create')
 * createResource() {
 *   return 'Resource created';
 * }
 * ```
 */
export const Post = (path: string | string[], options?: PostOptions): MethodDecorator => Match(path, { ...options, methods: [POST] })
