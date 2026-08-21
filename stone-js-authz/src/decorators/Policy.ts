import { POLICY_KEY } from './constants'
import { authzBlueprint } from '../options/AuthzBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Declare a class as a policy.
 *
 * Three statements in one, which is why nothing has to be wired by hand:
 *
 * 1. **It is a service.** The container builds it, as a singleton, so its constructor is auto-wired
 *    like any other class: a repository, a client, a translator, whatever it destructures is resolved
 *    for it. That is what lets a policy depend on the application instead of on constants.
 * 2. **It is reachable by name.** The alias is bound as `policy:<name>`, prefixed on purpose: an
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
 * @Policy('post')
 * export class PostPolicy {
 *   constructor (private readonly teams: TeamRepository) {}
 *   update (user: User, post: Post): boolean { return post.authorId === user.id }
 * }
 * ```
 */
export const Policy = <T extends ClassType = ClassType>(alias?: string): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const name = alias ?? target.name

    setMetadata(context, POLICY_KEY, { alias: name })
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true, alias: `policy:${name}` })

    addBlueprint(target, context, authzBlueprint, {
      stone: {
        authz: {
          policies: { [name]: target }
        }
      }
    })
  })
}
