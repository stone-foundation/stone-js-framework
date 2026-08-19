import { StoreDefinition } from '../defineStore'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { StoreServiceProvider } from '../StoreServiceProvider'

/**
 * Store configuration bucket (`stone.store`).
 */
export interface StoreConfig {
  /**
   * The stores an application declares, by name.
   *
   * Filled by `@Store()` and by handing `defineStore(...)` definitions here.
   */
  stores?: StoreDefinition[]

  /**
   * The snapshot key the hydrated states live under. Default `'stores'`.
   */
  snapshotKey?: string
}

/**
 * Application config augmented with the store bucket.
 */
export interface StoreAppConfig extends Partial<AppConfig> {
  store: StoreConfig
}

/**
 * Blueprint for the store module.
 */
export interface StoreBlueprint extends StoneBlueprint {
  stone: StoreAppConfig
}

/**
 * Opt-in blueprint: register it to give the application a store.
 *
 * The imperative half of the pair; `@Store()` is the declarative one. It contributes the service
 * provider that registers every declared store in the container, so a component reaches one with
 * `useContainer()` and a service takes it through its constructor. Nothing here knows about a view
 * engine.
 *
 * @example
 * ```typescript
 * import { defineStore, storeBlueprint } from '@stone-js/store'
 *
 * export const Application = defineStoneApp({ name: 'my-app' }, [storeBlueprint])
 *
 * export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.store.stores', [
 *   defineStore({ name: 'tasks', state: { items: [] } })
 * ]))
 * ```
 */
export const storeBlueprint: StoreBlueprint = {
  stone: {
    store: {
      stores: []
    },
    providers: [
      StoreServiceProvider
    ]
  }
}
