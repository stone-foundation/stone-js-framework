import { sameValue, StateStore } from '../src/StateStore'

interface Tasks { items: string[], filter: string }

const make = (): StateStore<Tasks> => StateStore.create<Tasks>({ items: [], filter: 'all' })

describe('StateStore', () => {
  it('reads, merges and replaces', () => {
    const store = make()

    expect(store.getState()).toEqual({ items: [], filter: 'all' })

    store.setState({ filter: 'done' })
    expect(store.getState()).toEqual({ items: [], filter: 'done' })   // merged, not replaced

    store.setState((state) => ({ items: [...state.items, 'write tests'] }))
    expect(store.getState()).toEqual({ items: ['write tests'], filter: 'done' })

    store.replaceState({ items: [], filter: 'all' })
    expect(store.getState()).toEqual({ items: [], filter: 'all' })    // replaced wholesale
  })

  it('does not let a caller mutate it through the object it passed in', () => {
    // Handing the initial state in and then mutating it must not reach inside the store.
    const initial: Tasks = { items: [], filter: 'all' }
    const store = StateStore.create(initial)

    initial.items.push('smuggled')

    expect(store.getState().items).toEqual([])
  })

  it('notifies subscribers with the new and the previous state, and stops when told', () => {
    const store = make()
    const seen: Array<[string, string]> = []
    const stop = store.subscribe((state, previous) => seen.push([state.filter, previous.filter]))

    store.setState({ filter: 'open' })
    store.setState({ filter: 'done' })
    stop()
    store.setState({ filter: 'all' })

    expect(seen).toEqual([['open', 'all'], ['done', 'open']])
  })

  it('survives a listener that unsubscribes while being notified', () => {
    // Mutating the listener set during iteration is a classic way to skip a listener; the copy avoids it.
    const store = make()
    const calls: string[] = []
    const stopA = store.subscribe(() => { calls.push('a'); stopA() })
    store.subscribe(() => calls.push('b'))

    store.setState({ filter: 'x' })
    store.setState({ filter: 'y' })

    expect(calls).toEqual(['a', 'b', 'b'])
  })

  it('watches a derived value and stays quiet when it did not change', () => {
    // The most common misuse in every store library: a component subscribed to a value that is
    // recomputed but equal re-renders for nothing. `watch` compares before telling anyone.
    const store = make()
    const counts: number[] = []
    store.watch((state) => state.items.length, (length) => counts.push(length))

    store.setState({ filter: 'done' })            // the length did not change
    store.setState({ items: ['a'] })              // it did
    store.setState({ filter: 'open' })            // it did not

    expect(counts).toEqual([1])
  })

  it('accepts a custom comparison, which is how a fresh object stops looping', () => {
    const store = make()
    const seen: string[][] = []
    store.watch(
      (state) => [...state.items],                                  // a new array every call
      (items) => seen.push(items),
      (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
    )

    store.setState({ filter: 'done' })            // same items, new array: must NOT notify
    store.setState({ items: ['a'] })

    expect(seen).toEqual([['a']])
  })

  it('resets to what it was created with, not to what it became', () => {
    const store = make()
    store.setState({ items: ['a'], filter: 'done' })

    store.reset()

    expect(store.getState()).toEqual({ items: [], filter: 'all' })
  })

  it('selects a value now', () => {
    const store = make()
    store.setState({ items: ['a', 'b'] })

    expect(store.select((state) => state.items.length)).toBe(2)
  })

  it('hydrates over the initial state, so an older snapshot still lands usable', () => {
    // A snapshot written before a key existed must not produce an incomplete state.
    const store = make()

    store.hydrate({ items: ['from server'] } as Tasks)

    expect(store.getState()).toEqual({ items: ['from server'], filter: 'all' })
    expect(store.dehydrate()).toEqual(store.getState())
  })

  it('tells nobody when the state is committed unchanged', () => {
    const store = make()
    const listener = vi.fn()
    store.subscribe(listener)

    store.replaceState(store.getState())

    expect(listener).not.toHaveBeenCalled()
  })
})

describe('sameValue', () => {
  it('is reference equality, which is why a fresh object never equals itself', () => {
    expect(sameValue(1, 1)).toBe(true)
    expect(sameValue({ a: 1 }, { a: 1 })).toBe(false)
  })
})
