import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { alibabaFcHttpAdapterBlueprint, AlibabaFcHttpAdapterAdapterConfig } from '../options/AlibabaFcHttpAdapterBlueprint'

/**
 * Options for the `@AlibabaFcHttp` decorator.
 */
export interface AlibabaFcHttpOptions extends Partial<AlibabaFcHttpAdapterAdapterConfig> {}

/**
 * Class decorator registering the Alibaba FC HTTP adapter on a Stone application.
 *
 * @param options - Adapter options (merged over the defaults).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @AlibabaFcHttp({ default: true })
 * @StoneApp()
 * class Application {}
 * ```
 */
export const AlibabaFcHttp = <T extends ClassType = ClassType>(options: AlibabaFcHttpOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would accumulate options across classes/tests).
    const blueprint = cloneValue(alibabaFcHttpAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
