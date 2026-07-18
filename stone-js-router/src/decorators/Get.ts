import { Match } from './Match'
import { GET } from '../constants'
import { DecoratorRouteDefinition } from '../declarations'

/**
 * Options for configuring the `Get` decorator.
 * Extends `DecoratorRouteDefinition` but excludes the `methods` property,
 * as it is predefined as `'GET'` by the decorator.
 */
export interface GetOptions extends Omit<DecoratorRouteDefinition, 'methods'> {}

/**
 * Decorator to mark a class method as a `GET` route action.
 * Uses the `Match` decorator internally to register the route with the HTTP `GET` method.
 *
 * @param options - Configuration options for the route definition, excluding the `methods` property.
 * @returns A method decorator to be applied to a class method.
 *
 * @example
 * ```typescript
 * import { Get } from '@stone-js/router';
 *
 * class UserController {
 *   @Get({ path: '/users', name: 'getUsers' })
 *   getUsers() {
 *     return 'List of users';
 *   }
 * }
 * ```
 */
export const Get = (path: string | string[], options?: GetOptions): MethodDecorator => Match(path, { ...options, methods: [GET] })
