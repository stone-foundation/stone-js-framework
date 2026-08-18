import { CacheConfig } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { CacheServiceProvider } from '../CacheServiceProvider'

/**
 * The `stone.cache` configuration bucket.
 */
export interface CacheModuleConfig extends CacheConfig {}

/**
 * Application config augmented with the cache bucket.
 */
export interface CacheAppConfig extends Partial<AppConfig> {
  cache: CacheModuleConfig
}

/**
 * Blueprint for the cache module.
 */
export interface CacheBlueprint extends StoneBlueprint {
  stone: CacheAppConfig
}

/**
 * Opt-in blueprint: import and register it to enable caching.
 *
 * It contributes the {@link CacheServiceProvider}, which binds `cacheManager` (the multi-store
 * manager) and `cache` (the default store) into the container. Configure stores under `stone.cache`
 * (or use the `@Cache()` decorator for a single store). `stone.providers` is an array, so this
 * merges with the rest of the app.
 */
export const cacheBlueprint: CacheBlueprint = {
  stone: {
    cache: {},
    providers: [
      CacheServiceProvider
    ]
  }
}
