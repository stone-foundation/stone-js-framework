import { RedisCacheStore } from '../../src/drivers/RedisCacheStore'

const h = vi.hoisted(() => {
  const client: any = {
    get: vi.fn(),
    set: vi.fn(),
    exists: vi.fn(),
    del: vi.fn(),
    sadd: vi.fn(),
    smembers: vi.fn(),
    incrby: vi.fn(),
    decrby: vi.fn(),
    scan: vi.fn()
  }
  const Ctor = vi.fn(() => client)
  return { client, Ctor }
})

vi.mock('ioredis', () => ({ default: h.Ctor }))

const store = (over: any = {}): RedisCacheStore =>
  RedisCacheStore.create({ name: 'redis', driver: 'redis', client: h.client, ...over })

describe('RedisCacheStore', () => {
  beforeEach(() => {
    for (const fn of Object.values(h.client)) { (fn as any).mockReset() }
    h.Ctor.mockClear()
  })

  it('defaults its name and honours a custom one', () => {
    expect(store().name).toBe('redis')
    expect(store({ name: 'sessions' }).name).toBe('sessions')
    // No name at all falls back to 'redis'.
    expect(RedisCacheStore.create({ driver: 'redis', client: h.client } as any).name).toBe('redis')
  })

  it('builds a client from a url, inline options, or empty options; or reuses a provided client', async () => {
    h.client.get.mockResolvedValue(null)

    await store({ client: undefined, url: 'redis://localhost:6379' }).get('k')
    expect(h.Ctor).toHaveBeenCalledWith('redis://localhost:6379')

    await store({ client: undefined, options: { host: 'h' } }).get('k')
    expect(h.Ctor).toHaveBeenCalledWith({ host: 'h' })

    await store({ client: undefined }).get('k')
    expect(h.Ctor).toHaveBeenCalledWith({}) // no url, no options → empty options

    // Provided client → constructor not used.
    h.Ctor.mockClear()
    await store().get('k')
    expect(h.Ctor).not.toHaveBeenCalled()
  })

  it('get deserializes JSON, returns undefined on null, and tolerates non-JSON', async () => {
    h.client.get.mockResolvedValueOnce('{"a":1}')
    expect(await store().get('k')).toEqual({ a: 1 })
    h.client.get.mockResolvedValueOnce(null)
    expect(await store().get('k')).toBeUndefined()
    h.client.get.mockResolvedValueOnce('raw-not-json{')
    expect(await store().get('k')).toBe('raw-not-json{')
  })

  it('set writes JSON with/without EX and registers tags, applying the prefix', async () => {
    h.client.set.mockResolvedValue('OK')
    await store({ prefix: 'app' }).set('k', { a: 1 }, { ttl: 60, tags: ['t'] })
    expect(h.client.set).toHaveBeenCalledWith('app:k', '{"a":1}', 'EX', 60)
    expect(h.client.sadd).toHaveBeenCalledWith('app:tag:t', 'app:k')

    await store().set('k', 1)
    expect(h.client.set).toHaveBeenLastCalledWith('k', '1')
  })

  it('has / delete map to exists / del', async () => {
    h.client.exists.mockResolvedValueOnce(1)
    expect(await store().has('k')).toBe(true)
    h.client.exists.mockResolvedValueOnce(0)
    expect(await store().has('k')).toBe(false)
    h.client.del.mockResolvedValueOnce(1)
    expect(await store().delete('k')).toBe(true)
    h.client.del.mockResolvedValueOnce(0)
    expect(await store().delete('k')).toBe(false)
  })

  it('clear scans and deletes in batches until the cursor wraps', async () => {
    h.client.scan.mockResolvedValueOnce(['5', ['a', 'b']]).mockResolvedValueOnce(['0', []])
    h.client.del.mockResolvedValue(2)
    await store({ prefix: 'app' }).clear()
    expect(h.client.scan).toHaveBeenNthCalledWith(1, '0', 'MATCH', 'app:*', 'COUNT', 100)
    expect(h.client.del).toHaveBeenCalledWith('a', 'b')
  })

  it('pull returns then deletes', async () => {
    h.client.get.mockResolvedValue('"v"')
    h.client.del.mockResolvedValue(1)
    expect(await store().pull('k')).toBe('v')
    expect(h.client.del).toHaveBeenCalledWith('k')
  })

  it('add uses NX and reports success, wiring tags only on success', async () => {
    h.client.set.mockResolvedValueOnce('OK')
    expect(await store().add('k', 1, { ttl: 30, tags: ['t'] })).toBe(true)
    expect(h.client.set).toHaveBeenCalledWith('k', '1', 'EX', 30, 'NX')
    expect(h.client.sadd).toHaveBeenCalled()

    h.client.set.mockResolvedValueOnce('OK')
    expect(await store().add('k', 1)).toBe(true) // success, no tags → tag loop skipped
    expect(h.client.set).toHaveBeenLastCalledWith('k', '1', 'NX')

    h.client.set.mockResolvedValueOnce(null)
    expect(await store().add('k', 1)).toBe(false)
  })

  it('increment / decrement map to incrby / decrby', async () => {
    h.client.incrby.mockResolvedValue(5)
    expect(await store().increment('n', 5)).toBe(5)
    h.client.decrby.mockResolvedValue(3)
    expect(await store().decrement('n', 2)).toBe(3)
  })

  it('remember returns the hit, else computes and stores', async () => {
    h.client.get.mockResolvedValueOnce('"hit"')
    expect(await store().remember('k', async () => 'x')).toBe('hit')

    h.client.get.mockResolvedValueOnce(null)
    h.client.set.mockResolvedValue('OK')
    const factory = vi.fn(async () => 'computed')
    expect(await store().remember('k', factory)).toBe('computed')
    expect(h.client.set).toHaveBeenCalled()
  })

  it('invalidateTags deletes tagged keys and the tag set (and just the set when empty)', async () => {
    h.client.smembers.mockResolvedValueOnce(['app:a', 'app:b']).mockResolvedValueOnce([])
    h.client.del.mockResolvedValue(1)
    await store({ prefix: 'app' }).invalidateTags(['users', 'empty'])
    expect(h.client.del).toHaveBeenCalledWith('app:a', 'app:b')
    expect(h.client.del).toHaveBeenCalledWith('app:tag:users')
    expect(h.client.del).toHaveBeenCalledWith('app:tag:empty')
  })
})
