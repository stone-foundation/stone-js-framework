import { cloneValue } from '@stone-js/config'
import { ResourcesConfig, resourcesBlueprint } from '../options/ResourcesBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Resources` decorator: the `stone.resources` bucket, every key optional.
 */
export interface ResourcesDecoratorOptions extends ResourcesConfig {}

/**
 * Class decorator: shape what routes return, declaratively.
 *
 * `@Resources()` installs the route middleware that applies whatever a route declared under
 * `resource`, so a handler returns its domain model and only what the resource allows leaves the
 * application.
 *
 * @param options - The resources configuration. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Resources } from '@stone-js/resources'
 *
 * @Resources({ registry: { user: userResource } })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const Resources = <T extends ClassType = ClassType>(options: ResourcesDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // The blueprint is the single source of truth for what the module declares; the decorator only
    // overrides what it can, its options bucket.
    const blueprint = cloneValue(resourcesBlueprint)

    blueprint.stone.resources = { ...blueprint.stone.resources, ...options }

    addBlueprint(target, context, blueprint)
  })
}
