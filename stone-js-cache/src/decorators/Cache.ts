import { cloneValue } from '@stone-js/config'
import { StoreConfig } from '../declarations'
import { cacheBlueprint } from '../options/CacheBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Cache` decorator: a single store's configuration (the `driver` is required).
 */
export interface CacheOptions extends Partial<StoreConfig> {
  driver: StoreConfig['driver']
}

/**
 * Class decorator: enable caching with a single store, declaratively.
 *
 * `@Cache({ driver: 'memory' })` registers the {@link CacheServiceProvider} and sets that store as
 * the default. For multiple stores or richer setups, configure `stone.cache` via `@Configuration()`
 * (or the imperative `cacheBlueprint` / `defineCache`) instead.
 *
 * @param options - The store configuration (driver required).
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Cache } from '@stone-js/cache'
 *
 * @Cache({ driver: 'memory' })
 * @StoneApp({ name: 'app' })
 * export class Application {}
 * ```
 */
export const Cache = <T extends ClassType = ClassType>(options: CacheOptions): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(cacheBlueprint)
    const name = options.name ?? String(options.driver)

    blueprint.stone.cache.default = name
    blueprint.stone.cache.stores = [{ ...options, name }]

    addBlueprint(target, context, blueprint)
  })
}
