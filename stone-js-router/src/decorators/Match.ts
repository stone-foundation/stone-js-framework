import { MATCH_KEY } from './constants'
import { DecoratorRouteDefinition } from '../declarations'
import { methodDecoratorLegacyWrapper, addMetadata } from '@stone-js/core'

/**
 * Options for configuring the `Match` decorator.
 * Defines properties for the route, such as path, method, middleware, etc.
 */
export interface MatchOptions extends DecoratorRouteDefinition {}

/**
 * Decorator to mark a class method as a route action.
 * Automatically registers the method with route definitions using metadata.
 *
 * @param options - Partial configuration for the route definition.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { Match } from '@stone-js/router';
 *
 * class UserController {
 *   @Match({ path: '/users', method: 'GET', name: 'getUsers' })
 *   getUsers() {
 *     return 'List of users';
 *   }
 * }
 * ```
 */
export const Match = <T extends Function = Function>(path: string | string[], options?: MatchOptions): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    addMetadata(context as ClassMethodDecoratorContext, MATCH_KEY, { ...options, path, handler: { action: context.name } })
  })
}
