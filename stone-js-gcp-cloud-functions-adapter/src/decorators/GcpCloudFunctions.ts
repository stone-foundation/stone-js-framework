import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { gcpCloudFunctionsAdapterBlueprint, GcpCloudFunctionsAdapterAdapterConfig } from '../options/GcpCloudFunctionsAdapterBlueprint'

/**
 * Configuration options for the `GcpCloudFunctions` decorator.
 * These options extend the default GCP Cloud Functions adapter configuration.
 */
export interface GcpCloudFunctionsOptions extends Partial<GcpCloudFunctionsAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the GCP Cloud Functions Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable GCP Cloud Functions as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for GCP Cloud Functions.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the GCP Cloud Functions Adapter.
 *
 * @returns A class decorator that applies the GCP Cloud Functions adapter configuration.
 *
 * @example
 * ```typescript
 * import { GcpCloudFunctions } from '@stone-js/gcp-cloud-functions-adapter';
 *
 * @GcpCloudFunctions({
 *   alias: 'MyGcpCloudFunctions',
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const GcpCloudFunctions = <T extends ClassType = ClassType>(options: GcpCloudFunctionsOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would leak options across classes and tests).
    const blueprint = cloneValue(gcpCloudFunctionsAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
