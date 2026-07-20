import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { fetchAdapterBlueprint, FetchAdapterAdapterConfig } from '../options/FetchAdapterBlueprint'

/**
 * Options for the `@Fetch` decorator.
 */
export interface FetchOptions extends Partial<FetchAdapterAdapterConfig> {}

/**
 * Class decorator registering the Web-standard (Fetch) adapter on a Stone application.
 *
 * @param options - Adapter options (merged over the defaults).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @Fetch({ default: true })
 * @StoneApp()
 * class Application {}
 * ```
 */
export const Fetch = <T extends ClassType = ClassType>(options: FetchOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would accumulate options across classes/tests).
    const blueprint = cloneValue(fetchAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
