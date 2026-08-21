import { API_RESOURCE_KEY } from './constants'
import { resourcesBlueprint } from '../options/ResourcesBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Declare a class as an API resource.
 *
 * Three statements in one, which is why nothing has to be wired by hand:
 *
 * 1. **It is a service.** The container builds it, as a singleton, which means its constructor is
 *    auto-wired like any other class: whatever it destructures is resolved for it, from the checker
 *    it holds its contract against to the repository its `data()` needs to complete a model. Nothing
 *    reads dependencies conditionally, because the container has them.
 * 2. **It is reachable by name.** The alias is bound in the container as `resource:<name>`, prefixed
 *    on purpose: an application is free to bind its own `user` service, and a resource named `user`
 *    must not compete for that name.
 * 3. **It activates the module.** The blueprint comes with the decorator, so a resource declared this
 *    way is registered and projected without a second gesture, and `resource: 'user'` on a route
 *    resolves to this class.
 *
 * @param alias - The name a route refers to it by. Defaults to the class name.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @ApiResource('user')
 * export class UserResource extends Resource<User> {
 *   constructor (private readonly posts: PostRepository) { super() }
 *   schema (): unknown { return z.object({ id: z.number(), name: z.string() }) }
 * }
 * ```
 */
export const ApiResource = <T extends ClassType = ClassType>(alias?: string): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const name = alias ?? target.name

    setMetadata(context, API_RESOURCE_KEY, { alias: name })
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true, alias: `resource:${name}` })

    addBlueprint(target, context, resourcesBlueprint, {
      stone: {
        resources: {
          registry: { [name]: target }
        }
      }
    })
  })
}
