import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { tencentScfAdapterBlueprint, TencentScfAdapterAdapterConfig } from '../options/TencentScfAdapterBlueprint'

/**
 * Configuration options for the `TencentScf` decorator.
 * These options extend the default Tencent SCF adapter configuration.
 */
export interface TencentScfOptions extends Partial<TencentScfAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the Tencent SCF Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable Tencent SCF as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for Tencent SCF.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the Tencent SCF Adapter.
 *
 * @returns A class decorator that applies the Tencent SCF adapter configuration.
 *
 * @example
 * ```typescript
 * import { TencentScf } from '@stone-js/tencent-scf-adapter';
 *
 * @TencentScf({
 *   alias: 'MyTencentScf',
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const TencentScf = <T extends ClassType = ClassType>(options: TencentScfOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which would leak options across classes and tests).
    const blueprint = cloneValue(tencentScfAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
