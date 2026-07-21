import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { tencentScfHttpAdapterBlueprint, TencentScfHttpAdapterAdapterConfig } from '../options/TencentScfHttpAdapterBlueprint'

/**
 * Configuration options for the `TencentScfHttp` decorator.
 * These options extend the default Tencent SCF HTTP adapter configuration.
 */
export interface TencentScfHttpOptions extends Partial<TencentScfHttpAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the Tencent SCF HTTP Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable Tencent SCF HTTP as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for Tencent SCF HTTP.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the Tencent SCF HTTP Adapter.
 *
 * @returns A class decorator that applies the Tencent SCF HTTP adapter configuration.
 *
 * @example
 * ```typescript
 * import { TencentScfHttp } from '@stone-js/aws-lambda-http-adapter';
 *
 * @TencentScfHttp({
 *   alias: 'MyTencentScfHttpAdapter',
 *   current: true,
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const TencentScfHttp = <T extends ClassType = ClassType>(options: TencentScfHttpOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would leak options across classes and tests). cloneValue recreates plain
    // objects/arrays while keeping functions and class references intact.
    const blueprint = cloneValue(tencentScfHttpAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
