import { API_RESOURCE_KEY } from './constants'
import { setClassMetadata } from '@stone-js/core'

/**
 * Class decorator: register a resource class under a name.
 *
 * ```ts
 * @ApiResource('user')
 * export class UserResource extends Resource<User> {
 *   toArray (user: User) { return { id: user.id, name: user.name } }
 * }
 * ```
 *
 * Routes and handlers then refer to it by name (`@Returns('user')`, or `{ resource: 'user' }`), so
 * resources live in their own files, organised however the application likes, and nothing has to be
 * imported at the route. The class is resolved by the container, so its constructor receives services
 * and `toArray` can use them: a resource that formats dates for the caller's locale needs i18n, and
 * this is how it gets it.
 *
 * @param alias - The name the resource is registered under. Defaults to the class name, which the
 * discovery middleware fills in, since it is the one holding the class.
 * @returns A class decorator.
 */
export const ApiResource = (alias?: string): ClassDecorator => {
  return setClassMetadata(API_RESOURCE_KEY, { alias })
}
