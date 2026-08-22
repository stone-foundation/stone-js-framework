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
 * A store written as a class: a feature's state and the actions that move it, together.
 *
 * The container builds it, so its constructor is auto-wired like any other class. That is what a data
 * definition cannot express and the reason the class form exists: a `competition` module has its
 * client, its service and its store, and the store's actions call the client.
 */
export type StoreClass<State extends Record<string, any> = Record<string, any>> =
  new (...args: any[]) => IStore<State>

/** A store built by a factory. It receives the container, and returns the store. */
export type StoreFactory<State extends Record<string, any> = Record<string, any>> =
  (container: any) => IStore<State>

/**
 * A registered store, in any of the three forms the framework accepts everywhere else.
 *
 * The data definition plays the plain role: state with no behaviour. The class and the factory carry
 * behaviour, and both are built through the container, so a store can hold the services its actions
 * need. `stone.store.stores` accepts any mix of the three.
 */
export interface MetaStore<State extends Record<string, any> = Record<string, any>> {
  /** The name it is resolved under, in the container and in the snapshot. */
  name: string
  /** The class or the factory to build. */
  module: StoreClass<State> | StoreFactory<State>
  /** Whether `module` is a class to construct. */
  isClass?: boolean
  /** Whether `module` is a factory to call with the container. */
  isFactory?: boolean
  /** Same semantics as {@link StoreDefinition.perRequest}, same default. */
  perRequest?: boolean
}

/** Anything `stone.store.stores` accepts. */
export type StoreRegistration<State extends Record<string, any> = Record<string, any>> =
  StoreDefinition<State> | MetaStore<State>

/** Options for the class and factory forms of {@link defineStore}. */
export interface DefineStoreOptions {
  /** The name it is resolved under. Defaults to the class name for a class; required for a factory. */
  name?: string
  /** Whether the module is a factory rather than a class. */
  isFactory?: boolean
  /** Same semantics as {@link StoreDefinition.perRequest}, same default. */
  perRequest?: boolean
}

/**
 * Declare a store, imperatively.
 *
 * Three forms, mirroring the rest of the framework. A data definition for state with no behaviour, a
 * class for a feature whose store carries actions, and a factory for full control over construction.
 * The class and factory forms are the imperative counterpart of `@FeatureStore()`: same declaration,
 * same registration, no decorators required. Everything ends up in `stone.store.stores`, which is
 * what the provider registers.
 *
 * @param definition - A data definition, a store class, or a store factory.
 * @param options - The name and lifetime, for the class and factory forms.
 * @returns The registration, ready to be handed to the blueprint.
 *
 * @example
 * ```typescript
 * // Data: state with no behaviour.
 * export const tasksStore = defineStore({ name: 'tasks', state: { items: [], filter: 'all' } })
 *
 * // Class: the container builds it, so its actions can use injected services.
 * export const competitionStore = defineStore(CompetitionStore, { name: 'competition' })
 *
 * // Factory: full control, the container in hand.
 * export const liveStore = defineStore(
 *   (container) => StateStore.create({ scores: container.make('feed').initial() }),
 *   { name: 'live', isFactory: true }
 * )
 * ```
 */
export function defineStore<State extends Record<string, any>> (
  definition: StoreDefinition<State>
): StoreDefinition<State>
export function defineStore<State extends Record<string, any>> (
  definition: StoreClass<State> | StoreFactory<State>,
  options: DefineStoreOptions
): MetaStore<State>
export function defineStore<State extends Record<string, any>> (
  definition: StoreDefinition<State> | StoreClass<State> | StoreFactory<State>,
  options: DefineStoreOptions = {}
): StoreRegistration<State> {
  if (typeof definition !== 'function') { return definition }

  const name = options.name ?? (definition as StoreClass<State>).name

  if (name === undefined || name === '') {
    throw new TypeError('A class or factory store needs a name: pass `{ name }`, since an anonymous function has none to fall back on.')
  }

  return {
    name,
    module: definition,
    isClass: options.isFactory !== true,
    isFactory: options.isFactory === true,
    perRequest: options.perRequest
  }
}

/**
 * Whether a registration carries a module to build, rather than plain state.
 *
 * @param registration - The registration.
 * @returns True for the class and factory forms.
 */
export function isMetaStore<State extends Record<string, any>> (
  registration: StoreRegistration<State>
): registration is MetaStore<State> {
  return typeof (registration as MetaStore<State>).module === 'function'
}

/**
 * Build a store from its registration, whichever form it was declared in.
 *
 * A class is constructed with the container, which is what auto-wires the services its actions use; a
 * factory is called with it; a data definition needs nothing. The container is only required by the
 * forms that use it, so building a plain store stays dependency-free.
 *
 * @param registration - The registration.
 * @param container - The container, for the class and factory forms.
 * @returns A new store.
 */
export function makeStore<State extends Record<string, any>> (
  registration: StoreRegistration<State>,
  container?: any
): IStore<State> {
  if (!isMetaStore(registration)) {
    return StateStore.create(registration.state)
  }

  return registration.isFactory === true
    ? (registration.module as StoreFactory<State>)(container)
    : new (registration.module as StoreClass<State>)(container)
}
