import { cloneValue } from '@stone-js/config'
import { AuthzConfig, authzBlueprint } from '../options/AuthzBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Authz` decorator: the `stone.authz` bucket, every key optional.
 */
export interface AuthzDecoratorOptions extends AuthzConfig {}

/**
 * Class decorator: decide what an authenticated caller may do, declaratively.
 *
 * `@Authz()` registers the authorization service provider (so `constructor ({ authz })` works
 * anywhere) and the kernel middleware that builds the caller's abilities for the request. It answers
 * what a caller may do; `@Auth()` answers who the caller is, and the two are usually enabled together.
 *
 * The declarative half of the pair; `authzBlueprint` handed to `defineStoneApp` is the imperative one.
 *
 * @param options - The authz configuration. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Authz } from '@stone-js/authz'
 *
 * @Authz({ resolveAbility: ({ user }) => buildAbilityFor(user) })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const Authz = <T extends ClassType = ClassType>(options: AuthzDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // The blueprint is the single source of truth for what the module declares; the decorator only
    // overrides what it can, its options bucket. Cloning is what lets it: two decorated applications
    // get their own copy instead of sharing the exported constant.
    const blueprint = cloneValue(authzBlueprint)

    blueprint.stone.authz = { ...blueprint.stone.authz, ...options }

    addBlueprint(target, context, blueprint)
  })
}
