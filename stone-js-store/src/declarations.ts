/**
 * A listener notified after every committed change.
 */
export type StoreListener<State> = (state: State, previous: State) => void

/**
 * Reads a value out of the state. Kept pure: it is called on every change.
 */
export type StoreSelector<State, Value> = (state: State) => Value

/**
 * How the next state is produced: a value, or a function of the current one.
 */
export type StoreUpdate<State> = Partial<State> | ((state: State) => Partial<State>)

/**
 * Compares two selected values to decide whether subscribers must be told.
 */
export type StoreEquality<Value> = (a: Value, b: Value) => boolean

/**
 * The store contract, deliberately small and free of any view engine.
 *
 * Four operations answer every need a view has: read, write, watch, and derive. Anything larger
 * belongs to the application, not to a store.
 */
export interface IStore<State> {
  /** The current state. */
  getState: () => State
  /** Commit a change. Merges a partial state, like a component's setState. */
  setState: (update: StoreUpdate<State>) => void
  /** Replace the state wholesale, bypassing the merge. */
  replaceState: (state: State) => void
  /** Watch every change. Returns the function that stops watching. */
  subscribe: (listener: StoreListener<State>) => () => void
  /** Read a derived value now. */
  select: <Value>(selector: StoreSelector<State, Value>) => Value
  /** Watch a derived value, notified only when it actually changes. */
  watch: <Value>(
    selector: StoreSelector<State, Value>,
    listener: (value: Value, previous: Value) => void,
    equals?: StoreEquality<Value>
  ) => () => void
  /** Put the state back to what it was created with. */
  reset: () => void
  /** The state as it will be handed to the client, for SSR. */
  dehydrate: () => State
  /** Adopt a state produced on the server. */
  hydrate: (state: State) => void
}

/**
 * A duck-typed snapshot: whatever the view layer registered in the container under `snapshot`.
 *
 * Duck-typed on purpose. `@stone-js/use-view` owns the snapshot transport and its XSS-safe
 * serializer; this module never imports it, so the store stays free of any view engine while still
 * hydrating from the very channel the framework already uses. A Vue or Svelte layer that registers
 * the same binding gets hydration with no change here.
 */
export interface SnapshotLike {
  get: <T = unknown>(key: string, fallback?: T) => T | undefined
  set?: (key: string, value: unknown) => unknown
  add?: (key: string, value: unknown) => unknown
}
