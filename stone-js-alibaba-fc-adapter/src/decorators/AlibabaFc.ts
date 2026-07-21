import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { alibabaFcAdapterBlueprint, AlibabaFcAdapterAdapterConfig } from '../options/AlibabaFcAdapterBlueprint'

/**
 * Configuration options for the `AlibabaFc` decorator.
 * These options extend the default Alibaba FC adapter configuration.
 */
export interface AlibabaFcOptions extends Partial<AlibabaFcAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the Alibaba FC Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable Alibaba FC as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for Alibaba FC.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the Alibaba FC Adapter.
 *
 * @returns A class decorator that applies the Alibaba FC adapter configuration.
 *
 * @example
 * ```typescript
 * import { AlibabaFc } from '@stone-js/alibaba-fc-adapter';
 *
 * @AlibabaFc({
 *   alias: 'MyAlibabaFc',
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const AlibabaFc = <T extends ClassType = ClassType>(options: AlibabaFcOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would leak options across classes and tests).
    const blueprint = cloneValue(alibabaFcAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
