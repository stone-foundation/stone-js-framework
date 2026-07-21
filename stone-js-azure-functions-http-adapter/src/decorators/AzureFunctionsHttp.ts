import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { azureFunctionsHttpAdapterBlueprint, AzureFunctionsHttpAdapterAdapterConfig } from '../options/AzureFunctionsHttpAdapterBlueprint'

/**
 * Options for the `@AzureFunctionsHttp` decorator.
 */
export interface AzureFunctionsHttpOptions extends Partial<AzureFunctionsHttpAdapterAdapterConfig> {}

/**
 * Class decorator registering the Azure Functions HTTP adapter on a Stone application.
 *
 * @param options - Adapter options (merged over the defaults).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @AzureFunctionsHttp({ default: true })
 * @StoneApp()
 * class Application {}
 * ```
 */
export const AzureFunctionsHttp = <T extends ClassType = ClassType>(options: AzureFunctionsHttpOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would accumulate options across classes/tests).
    const blueprint = cloneValue(azureFunctionsHttpAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
