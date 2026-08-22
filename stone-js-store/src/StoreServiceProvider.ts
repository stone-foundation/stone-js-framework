import { makeStore } from './defineStore'
import { StoreConfig } from './options/StoreBlueprint'
import { IStore, SnapshotLike } from './declarations'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * The container alias a store is resolved under.
 *
 * `store.<name>`, so a component can ask for exactly the one it needs: `useContainer().make('store.tasks')`.
 *
 * @param name - The store name.
 * @returns The alias.
 */
export function storeAlias (name: string): string {
  return `store.${name}`
}

/**
 * Registers every declared store in the container, and hydrates it when the client is picking up
 * server-rendered markup.
 *
 * Two things make this worth being first-party rather than a third-party store plus glue:
 *
 * - **Hydration is not glue.** The framework already ships a keyed, XSS-safe snapshot channel; a store
 *   registered here reads its state out of it at registration time, which is *before* the first render.
 *   Hydrating in an effect afterwards is what produces the flash of empty state every hand-rolled
 *   integration suffers from.
 * - **Request isolation is the default.** A store declared `perRequest` (the default) is bound as a
 *   plain binding on the per-event container, so two visitors rendering at once cannot see each
 *   other's state. A module-level singleton silently shares it, and nothing in development reveals it.
 */
export class StoreServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register and hydrate every declared store.
   */
  register (): Promiseable<void> {
    const options = this.container
      .make<IBlueprint>('blueprint')
      .get<StoreConfig>('stone.store', {})

    const hydrated = this.hydratedStates(options.snapshotKey ?? 'stores')

    for (const definition of options.stores ?? []) {
      const build = (): IStore<any> => {
        // The container is what auto-wires a class store's constructor and what a factory receives;
        // a plain data definition ignores it.
        const store = makeStore(definition, this.container)
        const state = hydrated[definition.name]
        // Adopted before anything can read the store, so the first render already has real state.
        if (state !== undefined) { store.hydrate(state) }
        return store
      }

      // A per-request store is rebuilt for each resolution on the ephemeral container; a shared one is
      // a singleton. Both are declared the same way, which is the point.
      if (definition.perRequest === false) {
        this.container.singletonIf(storeAlias(definition.name), build)
      } else {
        this.container.bindingIf?.(storeAlias(definition.name), build) ?? this.container.singletonIf(storeAlias(definition.name), build)
      }
    }
  }

  /**
   * The states the server put in the snapshot, if any.
   *
   * Duck-typed: `@stone-js/use-view` owns the snapshot transport, and this module never imports it, so
   * the store stays free of any view engine. A Vue or Svelte layer registering the same `snapshot`
   * binding gets hydration with nothing to add here.
   *
   * @param key - The snapshot key the states live under.
   * @returns The states by store name.
   */
  private hydratedStates (key: string): Record<string, any> {
    if (this.container.has?.('snapshot') === undefined || !this.container.has('snapshot')) { return {} }

    const snapshot = this.container.make<SnapshotLike>('snapshot')

    return snapshot?.get?.<Record<string, any>>(key, {}) ?? {}
  }
}
