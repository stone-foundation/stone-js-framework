import { VALIDATION_SCHEMA_KEY } from './constants'
import { setClassMetadata } from '@stone-js/core'

/**
 * Class decorator: register a schema class under a name.
 *
 * ```ts
 * @ValidationSchema('createUser')
 * export class CreateUserSchema implements IValidationSchema { rules () { … } }
 * ```
 *
 * Routes and handlers then refer to it by name (`@Validate('createUser')`), so schemas live in their
 * own files, organised however the application likes, and nothing has to be imported at the route.
 * The class is resolved by the container, so its constructor receives services and `rules()` can use
 * them.
 *
 * @param alias - The name the schema is registered under. Defaults to the class name, which the
 * discovery middleware fills in, since it is the one holding the class.
 * @returns A class decorator.
 */
export const ValidationSchema = (alias?: string): ClassDecorator => {
  return setClassMetadata(VALIDATION_SCHEMA_KEY, { alias })
}
