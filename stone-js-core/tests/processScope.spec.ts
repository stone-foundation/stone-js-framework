import { clearProcessScope, hasPerProcess, perProcess, setPerProcess } from '../src/processScope'

describe('what a module needs exactly one of', () => {
  beforeEach(() => { clearProcessScope() })

  it('builds once, however many times it is asked for', () => {
    // The whole point: a provider runs again for every event, and this must not build again with it.
    let built = 0
    const build = (): object => { built++; return { id: built } }

    const first = perProcess('key', build)
    const second = perProcess('key', build)

    expect(second).toBe(first)
    expect(built).toBe(1)
  })

  it('keeps the state the value holds', () => {
    // Stated as the failure it prevents: a counter that starts again on every event counts nothing,
    // and a store that empties on every event returns nothing.
    perProcess('counter', () => ({ hits: 0 }))

    perProcess<{ hits: number }>('counter', () => ({ hits: 0 })).hits++
    perProcess<{ hits: number }>('counter', () => ({ hits: 0 })).hits++

    expect(perProcess<{ hits: number }>('counter', () => ({ hits: 0 })).hits).toBe(2)
  })

  it('holds one value per key', () => {
    expect(perProcess('a', () => 1)).toBe(1)
    expect(perProcess('b', () => 2)).toBe(2)
  })

  it('takes a class as a key, which is how a module names its own', () => {
    class QueueManager {}

    const manager = perProcess(QueueManager, () => new QueueManager())

    expect(perProcess(QueueManager, () => new QueueManager())).toBe(manager)
  })

  it('holds a falsy value like any other', () => {
    // `Map.has` rather than a truthiness check, so 0, '' and false are values, not absences that
    // rebuild on every call.
    let built = 0

    perProcess('zero', () => { built++; return 0 })
    perProcess('zero', () => { built++; return 0 })

    expect(built).toBe(1)
  })

  it('says whether it holds something', () => {
    expect(hasPerProcess('k')).toBe(false)

    perProcess('k', () => 'v')

    expect(hasPerProcess('k')).toBe(true)
  })

  it('lets a test put a value in place of the real one', () => {
    setPerProcess('k', 'stubbed')

    expect(perProcess('k', () => 'real')).toBe('stubbed')
  })

  it('drops a key so the next call builds again', () => {
    perProcess('k', () => 'first')
    setPerProcess('k')

    expect(perProcess('k', () => 'second')).toBe('second')
  })

  it('drops everything, which is what a suite needs between tests', () => {
    perProcess('a', () => 1)
    perProcess('b', () => 2)

    clearProcessScope()

    expect(hasPerProcess('a')).toBe(false)
    expect(hasPerProcess('b')).toBe(false)
  })
})
