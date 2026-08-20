import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { useReactNativeBlueprint, UseReactNativeConfig } from '../options/UseReactNativeBlueprint'

/**
 * Options for the `UseReactNative` decorator.
 */
export interface UseReactNativeOptions extends UseReactNativeConfig {}

/**
 * Render this application's pages as native screens.
 *
 * One of the two ways this renderer is enabled, the declarative one; the other is handing
 * `useReactNativeBlueprint` to the application manifest. Pair it with `@ReactNative()` from
 * `@stone-js/react-native-adapter`, which is what brings the events in.
 *
 * @template T - The type of the decorated class.
 * @param options - Optional configuration.
 * @returns A class decorator applying the renderer's configuration.
 *
 * @example
 * ```typescript
 * import { Routing } from '@stone-js/router'
 * import { ReactNative } from '@stone-js/react-native-adapter'
 * import { UseReactNative } from '@stone-js/use-react-native'
 *
 * @Routing()
 * @ReactNative()
 * @UseReactNative()
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const UseReactNative = <T extends ClassType = ClassType>(options: UseReactNativeOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the
    // shared singleton, which would leak options between classes.
    const blueprint = cloneValue(useReactNativeBlueprint)

    blueprint.stone.useReactNative = deepMerge(blueprint.stone.useReactNative, options)

    addBlueprint(target, context, blueprint)
  })
}
