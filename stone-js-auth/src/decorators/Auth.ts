import { cloneValue } from '@stone-js/config'
import { AuthConfig, authBlueprint } from '../options/AuthBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Auth` decorator: the `stone.auth` bucket, every key optional.
 */
export interface AuthDecoratorOptions extends AuthConfig {}

/**
 * Class decorator: authenticate every request, declaratively.
 *
 * `@Auth()` registers the authentication service provider (so `constructor ({ auth })` works
 * anywhere) and the kernel middleware that verifies the credentials carried by each request. Nothing
 * is verified until you give it a signing strategy: a `secret` for HMAC, or a `publicKey` / `jwksUri`
 * for asymmetric tokens.
 *
 * The declarative half of the pair; `authBlueprint` handed to `defineStoneApp` is the imperative one.
 *
 * @param options - The auth configuration. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Auth } from '@stone-js/auth'
 *
 * @Auth({ secret: getString('JWT_SECRET'), issuer: 'https://issuer.example', audience: 'my-api' })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const Auth = <T extends ClassType = ClassType>(options: AuthDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // The blueprint is the single source of truth for what the module declares; the decorator only
    // overrides what it can, its options bucket. Cloning is what lets it: two decorated applications
    // get their own copy instead of sharing the exported constant.
    const blueprint = cloneValue(authBlueprint)

    blueprint.stone.auth = { ...blueprint.stone.auth, ...options }

    addBlueprint(target, context, blueprint)
  })
}
