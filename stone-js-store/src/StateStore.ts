import { cloneValue } from '@stone-js/config'
import {
  IStore, StoreEquality, StoreListener, StoreSelector, StoreUpdate
} from './declarations'

/**
 * Reference equality, the default for a derived value.
 *
 * The failure it exists to make visible: a selector that builds a fresh object every call is never
 * equal to itself, so a component subscribed to it re-renders forever. That is the most common way a
 * store is misused, in every library on the market, so the rule is documented rather than folklore:
 * select values, or memoise what you build.
 */
export function sameValue<Value> (a: Value, b: Value): boolean {
  return a === b
}

/**
 * A store: application state written once, read by any view engine.
 *
 * Named `StateStore` so the bare `Store` name belongs to the activation decorator, the same rule that
 * gives `CacheManager`, `RealtimeManager` and `I18nManager` their suffixes. Nobody writes this name
 * often: stores are declared with `defineStore` or `@Store()`.
 *
 * It knows nothing of React, Vue, Svelte, the DOM or Node. That is what lets the same state layer run
 * during server rendering, in the browser and in React Native, which is the continuum applied to
 * state rather than to requests.
 *
 * Created through {@link defineStore} or the `@Store()` decorator; resolved from the container, so a
 * component reaches it with `useContainer()` and a service takes it through its constructor.
 */
export class StateStore<State extends Record<string, any> = Record<string, any>> implements IStore<State> {
  private state: State
  private readonly initial: State
  private readonly listeners = new Set<StoreListener<State>>()

  /**
   * Create a store.
   *
   * @param initialState - The state to start from, and to return to on `reset`.
   * @returns A new store.
   */
  static create<State extends Record<string, any>> (initialState: State): StateStore<State> {
    return new this(initialState)
  }

  /**
   * @param initialState - The state to start from.
   */
  protected constructor (initialState: State) {
    // Cloned both ways: a caller keeping a reference to the object it passed in must not be able to
    // mutate the store behind its back, and `reset` must return to the original, not to whatever the
    // state has become.
    this.initial = cloneValue(initialState)
    this.state = cloneValue(initialState)
  }

  /**
   * The current state.
   *
   * @returns The state.
   */
  getState (): State {
    return this.state
  }

  /**
   * Commit a change, merging a partial state.
   *
   * @param update - The next partial state, or a function of the current one.
   */
  setState (update: StoreUpdate<State>): void {
    const patch = typeof update === 'function' ? update(this.state) : update
    this.commit({ ...this.state, ...patch })
  }

  /**
   * Replace the state wholesale.
   *
   * @param state - The next state.
   */
  replaceState (state: State): void {
    this.commit(state)
  }

  /**
   * Watch every change.
   *
   * @param listener - Called after each committed change.
   * @returns The function that stops watching.
   */
  subscribe (listener: StoreListener<State>): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /**
   * Read a derived value now.
   *
   * @param selector - Reads the value out of the state.
   * @returns The value.
   */
  select<Value> (selector: StoreSelector<State, Value>): Value {
    return selector(this.state)
  }

  /**
   * Watch a derived value, notified only when it actually changes.
   *
   * @param selector - Reads the value out of the state.
   * @param listener - Called with the new and previous value.
   * @param equals - How to compare, reference equality by default.
   * @returns The function that stops watching.
   */
  watch<Value> (
    selector: StoreSelector<State, Value>,
    listener: (value: Value, previous: Value) => void,
    equals: StoreEquality<Value> = sameValue
  ): () => void {
    let current = selector(this.state)

    return this.subscribe((state) => {
      const next = selector(state)
      if (equals(next, current)) { return }
      const previous = current
      current = next
      listener(next, previous)
    })
  }

  /**
   * Put the state back to what it was created with.
   */
  reset (): void {
    this.commit(cloneValue(this.initial))
  }

  /**
   * The state as it will be handed to the client.
   *
   * @returns The state to serialise.
   */
  dehydrate (): State {
    return this.state
  }

  /**
   * Adopt a state produced on the server.
   *
   * Merged over the initial state rather than replacing it, so a snapshot written by an older release
   * that lacks a newly added key hydrates into a usable state instead of an incomplete one.
   *
   * @param state - The state read from the snapshot.
   */
  hydrate (state: State): void {
    this.commit({ ...this.initial, ...state })
  }

  /**
   * Commit a state and tell every listener, once.
   *
   * @param next - The next state.
   */
  private commit (next: State): void {
    const previous = this.state
    if (next === previous) { return }
    this.state = next
    // Iterated over a copy: a listener that unsubscribes (or subscribes) while being notified must not
    // change what this round notifies, which is how a set-mutation-during-iteration bug hides.
    for (const listener of [...this.listeners]) { listener(next, previous) }
  }
}
