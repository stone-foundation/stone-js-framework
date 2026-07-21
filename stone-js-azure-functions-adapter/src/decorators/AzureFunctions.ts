import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { azureFunctionsAdapterBlueprint, AzureFunctionsAdapterAdapterConfig } from '../options/AzureFunctionsAdapterBlueprint'

/**
 * Configuration options for the `AzureFunctions` decorator.
 * These options extend the default Azure Functions adapter configuration.
 */
export interface AzureFunctionsOptions extends Partial<AzureFunctionsAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the Azure Functions Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable Azure Functions as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for Azure Functions.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the Azure Functions Adapter.
 *
 * @returns A class decorator that applies the Azure Functions adapter configuration.
 *
 * @example
 * ```typescript
 * import { AzureFunctions } from '@stone-js/azure-functions-adapter';
 *
 * @AzureFunctions({
 *   alias: 'MyAzureFunctions',
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const AzureFunctions = <T extends ClassType = ClassType>(options: AzureFunctionsOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would leak options across classes and tests).
    const blueprint = cloneValue(azureFunctionsAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
