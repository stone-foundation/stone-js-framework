import { Match } from './Match'
import { OPTIONS } from '../constants'
import { DecoratorRouteDefinition } from '../declarations'

/**
 * Options for the `Options` decorator, extending route definition options.
 *
 * Excludes the `methods` property from `DecoratorRouteDefinition` as it is predefined.
 */
export interface OptionsOptions extends Omit<DecoratorRouteDefinition, 'methods'> {}

/**
 * A method decorator for defining HTTP OPTIONS routes.
 *
 * @param path - The route path for the OPTIONS endpoint.
 * @param options - Optional configuration for the route.
 * @returns A method decorator configured for an OPTIONS route.
 *
 * @example
 * ```typescript
 * @Options('/resource')
 * optionsResource() {
 *   return 'Options for resource';
 * }
 * ```
 */
export const Options = (path: string | string[], options?: OptionsOptions): MethodDecorator => Match(path, { ...options, methods: [OPTIONS] })
