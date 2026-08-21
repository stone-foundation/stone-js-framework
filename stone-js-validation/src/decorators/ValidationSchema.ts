import { VALIDATION_SCHEMA_KEY } from './constants'
import { validationBlueprint } from '../options/ValidationBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Declare a class as a rule set.
 *
 * Three statements in one, which is why nothing has to be wired by hand:
 *
 * 1. **It is a service.** The container builds it, as a singleton, so its constructor is auto-wired
 *    like any other class: a repository, a client, a translator, whatever it destructures is resolved
 *    for it. That is what lets a rule set depend on the application instead of on constants.
 * 2. **It is reachable by name.** The alias is bound as `schema:<name>`, prefixed on purpose: an
 *    application is free to bind its own service under a plain word, and a declaration named after a
 *    domain concept must not compete for that name.
 * 3. **It activates the module.** The blueprint comes with the decorator, so declaring this is the
 *    whole setup, and a route naming it resolves to this class.
 *
 * @param alias - The name a route refers to it by. Defaults to the class name.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @ValidationSchema('createUser')
 * export class CreateUser {
 *   constructor (private readonly users: UserRepository) {}
 *   rules (): RouteValidationRules { return { body: { email: { rules: 'email' } } } }
 * }
 * ```
 */
export const ValidationSchema = <T extends ClassType = ClassType>(alias?: string): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const name = alias ?? target.name

    setMetadata(context, VALIDATION_SCHEMA_KEY, { alias: name })
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true, alias: `schema:${name}` })

    addBlueprint(target, context, validationBlueprint, {
      stone: {
        validation: {
          schemas: { [name]: target }
        }
      }
    })
  })
}
