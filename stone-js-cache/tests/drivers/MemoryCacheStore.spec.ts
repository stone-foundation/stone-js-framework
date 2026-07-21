import { MemoryCacheStore } from '../../src/drivers/MemoryCacheStore'

const store = (over: any = {}): MemoryCacheStore => MemoryCacheStore.create(over)

describe('MemoryCacheStore', () => {
  it('defaults its name and honours a custom one', () => {
    expect(store().name).toBe('memory')
    expect(store({ name: 'ephemeral' }).name).toBe('ephemeral')
  })

  it('sets and gets values, applying the key prefix', async () => {
    const s = store({ prefix: 'app' })
    await s.set('k', { a: 1 })
    expect(await s.get('k')).toEqual({ a: 1 })
    expect(await s.get('missing')).toBeUndefined()
  })

  it('has reflects presence', async () => {
    const s = store()
    expect(await s.has('k')).toBe(false)
    await s.set('k', 1)
    expect(await s.has('k')).toBe(true)
  })

  it('delete removes and reports whether something was removed', async () => {
    const s = store()
    await s.set('k', 1)
    expect(await s.delete('k')).toBe(true)
    expect(await s.delete('k')).toBe(false)
  })

  it('clear empties the store and tags', async () => {
    const s = store()
    await s.set('a', 1, { tags: ['t'] })
    await s.clear()
    expect(await s.get('a')).toBeUndefined()
  })

  it('pull returns then deletes', async () => {
    const s = store()
    await s.set('k', 'v')
    expect(await s.pull('k')).toBe('v')
    expect(await s.has('k')).toBe(false)
  })

  it('add writes only when absent', async () => {
    const s = store()
    expect(await s.add('k', 1)).toBe(true)
    expect(await s.add('k', 2)).toBe(false)
    expect(await s.get('k')).toBe(1)
  })

  it('increment/decrement count from zero and preserve nothing weird', async () => {
    const s = store()
    expect(await s.increment('n')).toBe(1)
    expect(await s.increment('n', 4)).toBe(5)
    expect(await s.decrement('n', 2)).toBe(3)
  })

  it('increment resets a non-numeric or expired value to zero', async () => {
    const s = store()
    await s.set('n', 'not-a-number')
    expect(await s.increment('n')).toBe(1)
  })

  it('remember caches the factory result and reuses it', async () => {
    const s = store()
    const factory = vi.fn(async () => 'computed')
    expect(await s.remember('k', factory)).toBe('computed')
    expect(await s.remember('k', factory)).toBe('computed')
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('remember shares a single in-flight execution under concurrency (stampede protection)', async () => {
    const s = store()
    let resolveGate: (v: string) => void = () => {}
    const gate = new Promise<string>((resolve) => { resolveGate = resolve })
    const factory = vi.fn(() => gate)

    const a = s.remember('k', factory)
    const b = s.remember('k', factory)
    resolveGate('once')

    expect(await a).toBe('once')
    expect(await b).toBe('once')
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('invalidateTags drops every key in the given tags only', async () => {
    const s = store()
    await s.set('a', 1, { tags: ['users'] })
    await s.set('b', 2, { tags: ['users', 'reports'] })
    await s.set('c', 3, { tags: ['reports'] })

    await s.invalidateTags(['users'])

    expect(await s.get('a')).toBeUndefined()
    expect(await s.get('b')).toBeUndefined()
    expect(await s.get('c')).toBe(3)
    // Invalidating an unknown tag is a no-op.
    await s.invalidateTags(['nope'])
  })

  describe('TTL', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('expires values after their TTL', async () => {
      const s = store()
      await s.set('k', 'v', { ttl: 1 })
      expect(await s.get('k')).toBe('v')
      vi.advanceTimersByTime(1500)
      expect(await s.get('k')).toBeUndefined()
    })

    it('applies the store default TTL and keeps values without expiry', async () => {
      const s = store({ ttl: 1 })
      await s.set('k', 'v')
      vi.advanceTimersByTime(1500)
      expect(await s.get('k')).toBeUndefined()

      const forever = store()
      await forever.set('k', 'v')
      vi.advanceTimersByTime(10_000_000)
      expect(await forever.get('k')).toBe('v')
    })

    it('increment on an expired counter restarts at zero (no stale expiry)', async () => {
      const s = store()
      await s.set('n', 5, { ttl: 1 })
      vi.advanceTimersByTime(1500)
      expect(await s.increment('n')).toBe(1)
    })
  })
})
