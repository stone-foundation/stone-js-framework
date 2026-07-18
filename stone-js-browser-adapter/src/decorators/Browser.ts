import { cloneValue, deepMerge } from '@stone-js/config'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'
import { browserAdapterBlueprint, BrowserAdapterAdapterConfig } from '../options/BrowserAdapterBlueprint'

/**
 * Configuration options for the `Browser` decorator.
 * These options extend the default Browser adapter configuration.
 */
export interface BrowserOptions extends Partial<BrowserAdapterAdapterConfig> {}

/**
 * A Stone.js decorator that integrates the Browser Adapter with a class.
 *
 * This decorator modifies the class to seamlessly enable Browser as the
 * execution environment for a Stone.js application. By applying this decorator,
 * the class is automatically configured with the necessary blueprint for Browser.
 *
 * @template T - The type of the class being decorated. Defaults to `ClassType`.
 * @param options - Optional configuration to customize the Browser Adapter.
 *
 * @returns A class decorator that applies the Browser adapter configuration.
 *
 * @example
 * ```typescript
 * import { Browser } from '@stone-js/browser-adapter';
 *
 * @Browser({
 *   alias: 'MyBrowser',
 * })
 * class App {
 *   // Your application logic here
 * }
 * ```
 */
export const Browser = <T extends ClassType = ClassType>(options: BrowserOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // Clone the module-level default before merging so decorating a class never mutates the shared
    // singleton (which leaked options between classes and duplicated events/middleware on reuse).
    const blueprint = cloneValue(browserAdapterBlueprint)

    if (blueprint.stone?.adapters?.[0] !== undefined) {
      blueprint.stone.adapters[0] = deepMerge(blueprint.stone.adapters[0], options)
    }

    addBlueprint(target, context, blueprint)
  })
}
