import { cloneValue } from '@stone-js/config'
import { RateLimitConfig } from '../declarations'
import { rateLimitBlueprint } from '../options/RateLimitBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/** Options for the `@RateLimit` activation. */
export interface RateLimitDecoratorOptions extends RateLimitConfig {}

/**
 * Enable rate limiting on the application.
 *
 * The declarative half of the module's activation; `rateLimitBlueprint` is the imperative half, and
 * neither can do what the other cannot. Nothing is limited until a route says so: this only puts the
 * enforcement in place.
 *
 * @param options - What to configure, if anything.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @RateLimit({ trustedAddressHeaders: ['cloudfront-viewer-address'] })
 * @Routing()
 * @StoneApp()
 * export class Application {}
 * ```
 */
export const RateLimit = <T extends ClassType = ClassType>(options: RateLimitDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(rateLimitBlueprint)

    // The blueprint is the single source of truth for what the module declares; the decorator
    // overrides only what it can, its own options bucket.
    blueprint.stone.rateLimit = { ...blueprint.stone.rateLimit, ...options }

    addBlueprint(target, context, blueprint)
  })
}
