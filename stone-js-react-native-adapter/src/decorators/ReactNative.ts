import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { reactNativeAdapterBlueprint, ReactNativeAdapterAdapterConfig } from '../options/ReactNativeAdapterBlueprint'

/**
 * Options for the `ReactNative` decorator.
 */
export interface ReactNativeOptions extends Partial<ReactNativeAdapterAdapterConfig> {}

/**
 * Run a Stone.js application as a native mobile application.
 *
 * One of the two ways this module is enabled, the declarative one; the other is handing
 * `reactNativeAdapterBlueprint` to the application manifest.
 *
 * @template T - The type of the decorated class.
 * @param options - Optional configuration for the adapter.
 * @returns A class decorator applying the React Native adapter configuration.
 *
 * @example
 * ```typescript
 * import { ReactNative } from '@stone-js/react-native-adapter'
 *
 * @ReactNative({ default: true })
 * @StoneApp({ name: 'my-app' })
 * class Application {}
 * ```
 */
export const ReactNative = <T extends ClassType = ClassType>(options: ReactNativeOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the
    // shared singleton, which would leak options between classes and duplicate middleware.
    const blueprint = cloneValue(reactNativeAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
