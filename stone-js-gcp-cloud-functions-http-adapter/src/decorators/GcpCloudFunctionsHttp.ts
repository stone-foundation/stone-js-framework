import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { gcpCloudFunctionsHttpAdapterBlueprint, GcpCloudFunctionsHttpAdapterAdapterConfig } from '../options/GcpCloudFunctionsHttpAdapterBlueprint'

/**
 * Interface for configuring the `GcpCloudFunctionsHttp` decorator.
 *
 * This interface extends `GcpCloudFunctionsHttpAdapterConfig` and allows partial customization
 * of the GCP Cloud Functions HTTP adapter blueprint configuration.
 */
export interface GcpCloudFunctionsHttpOptions extends Partial<GcpCloudFunctionsHttpAdapterAdapterConfig> {}

/**
 * A class decorator for registering a GCP Cloud Functions HTTP adapter in the Stone.js framework.
 *
 * The decorator modifies the `gcpCloudFunctionsHttpAdapterBlueprint` by merging the provided options
 * with the default configuration. It also registers the blueprint to the target class using
 * the `addBlueprint` utility.
 *
 * @template T - The type of the class being decorated, defaulting to `ClassType`.
 *
 * @param options - An object containing configuration options for the GCP Cloud Functions HTTP adapter.
 *
 * @returns A class decorator function.
 *
 * @example
 * ```typescript
 * import { GcpCloudFunctionsHttp } from '@stone-js/gcp-cloud-functions-http-adapter';
 *
 * @GcpCloudFunctionsHttp({
 *   url: 'http://localhost:3000',
 *   default: true,
 * })
 * class MyHttpService {
 *   // Service implementation
 * }
 * ```
 */
export const GcpCloudFunctionsHttp = <T extends ClassType = ClassType>(options: GcpCloudFunctionsHttpOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would accumulate options across classes/tests).
    const blueprint = cloneValue(gcpCloudFunctionsHttpAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
