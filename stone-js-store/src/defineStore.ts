import { StateStore } from './StateStore'
import { IStore } from './declarations'

/**
 * What a store declares about itself.
 */
export interface StoreDefinition<State extends Record<string, any> = Record<string, any>> {
  /** The name it is resolved under, in the container and in the snapshot. */
  name: string
  /** The state it starts from. */
  state: State
  /**
   * Whether the server keeps one instance per request. Default `true`, and the default matters.
   *
   * A store held as a module-level singleton leaks one visitor's state into the next visitor's page
   * during server rendering. It is the most common SSR state bug there is, and it is invisible in
   * development because there is only ever one request at a time. The kernel already gives an
   * ephemeral container per event, so honouring it costs nothing and closes the hole by default.
   * Set `false` only for state that is genuinely process-wide, like a feature-flag cache.
   */
  perRequest?: boolean
}

/**
 * Declare a store, imperatively.
 *
 * The counterpart of the `@Store()` decorator: same declaration, same registration, no decorators
 * required. Both end up in `stone.store.stores`, which is what the provider registers.
 *
 * @param definition - What the store declares.
 * @returns The definition, ready to be handed to the blueprint.
 *
 * @example
 * ```typescript
 * export const tasksStore = defineStore({ name: 'tasks', state: { items: [], filter: 'all' } })
 * ```
 */
export function defineStore<State extends Record<string, any>> (
  definition: StoreDefinition<State>
): StoreDefinition<State> {
  return definition
}

/**
 * Build a store from its definition.
 *
 * @param definition - What the store declares.
 * @returns A new store.
 */
export function makeStore<State extends Record<string, any>> (definition: StoreDefinition<State>): IStore<State> {
  return StateStore.create(definition.state)
}
