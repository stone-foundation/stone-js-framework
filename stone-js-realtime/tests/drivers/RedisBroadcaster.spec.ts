import { RedisBroadcaster } from '../../src/drivers/RedisBroadcaster'
import { MemoryConnectionStore } from '../../src/drivers/MemoryConnectionStore'

const h = vi.hoisted(() => {
  const sub: any = { on: vi.fn(), subscribe: vi.fn() }
  const pub: any = { publish: vi.fn(), duplicate: vi.fn(() => sub) }
  const Ctor = vi.fn(() => pub)
  return { pub, sub, Ctor }
})

vi.mock('ioredis', () => ({ default: h.Ctor }))

const flush = async (): Promise<void> => { await new Promise((resolve) => setTimeout(resolve, 5)) }
const messageHandler = (): ((channel: string, raw: string) => void) =>
  h.sub.on.mock.calls.find((call: any[]) => call[0] === 'message')[1]

describe('RedisBroadcaster', () => {
  beforeEach(() => {
    h.pub.publish.mockReset()
    h.pub.duplicate.mockClear().mockReturnValue(h.sub)
    h.sub.on.mockReset()
    h.sub.subscribe.mockReset()
    h.Ctor.mockClear()
  })

  it('defaults its name/prefix and honours custom ones', () => {
    expect(RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: h.pub }).name).toBe('redis')
    expect(RedisBroadcaster.create({ driver: 'redis', client: h.pub } as any).name).toBe('redis')
    expect(RedisBroadcaster.create({ name: 'rt', driver: 'redis', client: h.pub }).name).toBe('rt')
  })

  it('broadcast publishes a JSON message on the prefixed channel', async () => {
    const broadcaster = RedisBroadcaster.create({ name: 'redis', driver: 'redis', prefix: 'rt', client: h.pub })
    await broadcaster.broadcast('room', 'ping', { n: 1 })
    expect(h.pub.publish).toHaveBeenCalledWith('rt:room', JSON.stringify({ channel: 'room', event: 'ping', payload: { n: 1 } }))
  })

  it('to().emit() delegates to broadcast', async () => {
    const broadcaster = RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: h.pub })
    await broadcaster.to('room').emit('hi')
    expect(h.pub.publish).toHaveBeenCalledWith('realtime:room', expect.stringContaining('"event":"hi"'))
  })

  it('on subscribes once and delivers incoming messages to local and wildcard listeners', async () => {
    const broadcaster = RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: h.pub })
    const onRoom = vi.fn()
    const onAll = vi.fn()
    broadcaster.on('room', onRoom)
    broadcaster.on('room', vi.fn()) // second subscribe on the same channel must not re-subscribe
    broadcaster.on('*', onAll)
    await flush()

    expect(h.sub.subscribe).toHaveBeenCalledWith('realtime:room')
    expect(h.sub.subscribe).toHaveBeenCalledTimes(2) // 'room' once, '*' once

    messageHandler()('realtime:room', JSON.stringify({ channel: 'room', event: 'ping', payload: 1 }))
    expect(onRoom).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: 1 })
    expect(onAll).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: 1 })
  })

  it('on() returns an unsubscribe that stops delivery', async () => {
    const broadcaster = RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: h.pub })
    const listener = vi.fn()
    const off = broadcaster.on('room', listener)
    await flush()
    off()
    messageHandler()('realtime:room', JSON.stringify({ channel: 'room', event: 'x', payload: 0 }))
    expect(listener).not.toHaveBeenCalled()
  })

  it('delivers to wildcard-only listeners when a channel has none of its own', async () => {
    const broadcaster = RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: h.pub })
    const onAll = vi.fn()
    broadcaster.on('*', onAll)
    await flush()
    messageHandler()('realtime:room', JSON.stringify({ channel: 'room', event: 'e', payload: 1 }))
    expect(onAll).toHaveBeenCalledWith({ channel: 'room', event: 'e', payload: 1 })
  })

  it('deliver tolerates malformed JSON and unprefixed channels', async () => {
    const broadcaster = RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: h.pub })
    const listener = vi.fn()
    broadcaster.on('room', listener)
    await flush()
    const handler = messageHandler()
    expect(() => handler('realtime:room', 'not json')).not.toThrow()
    handler('room', JSON.stringify({ channel: 'room', event: 'y', payload: 2 })) // unprefixed channel branch
    expect(listener).toHaveBeenCalledWith({ channel: 'room', event: 'y', payload: 2 })
  })

  it('builds a client from url / options / empty, or reuses the provided one', async () => {
    await RedisBroadcaster.create({ name: 'redis', driver: 'redis', url: 'redis://x' }).broadcast('c', 'e')
    expect(h.Ctor).toHaveBeenCalledWith('redis://x')
    await RedisBroadcaster.create({ name: 'redis', driver: 'redis', options: { host: 'h' } }).broadcast('c', 'e')
    expect(h.Ctor).toHaveBeenCalledWith({ host: 'h' })
    await RedisBroadcaster.create({ name: 'redis', driver: 'redis' }).broadcast('c', 'e')
    expect(h.Ctor).toHaveBeenCalledWith({})

    h.Ctor.mockClear()
    await RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: h.pub }).broadcast('c', 'e')
    expect(h.Ctor).not.toHaveBeenCalled()
  })

  it('reuses the publisher as subscriber when the client cannot duplicate', async () => {
    const plain: any = { publish: vi.fn(), subscribe: vi.fn(), on: vi.fn() }
    const broadcaster = RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: plain })
    broadcaster.on('room', vi.fn())
    await flush()
    expect(plain.subscribe).toHaveBeenCalledWith('realtime:room')
    expect(plain.on).toHaveBeenCalledWith('message', expect.any(Function))
  })

  it('members delegates to the connection store', async () => {
    const store = MemoryConnectionStore.create()
    await store.add({ id: 'a', info: { user: 'Ana' } })
    await store.subscribe('a', 'room')
    const broadcaster = RedisBroadcaster.create({ name: 'redis', driver: 'redis', client: h.pub }, store)
    expect(await broadcaster.members('room')).toEqual([{ connectionId: 'a', info: { user: 'Ana' } }])
  })
})

describe('RedisBroadcaster without ioredis', () => {
  it('throws a helpful RealtimeError instructing to install ioredis', async () => {
    vi.resetModules()
    vi.doMock('ioredis', () => { throw new Error('Cannot find module ioredis') })
    const { RedisBroadcaster: Fresh } = await import('../../src/drivers/RedisBroadcaster')
    const { RealtimeError } = await import('../../src/errors/RealtimeError')
    await expect(Fresh.create({ name: 'redis', driver: 'redis' }).broadcast('c', 'e')).rejects.toThrow(RealtimeError)
    await expect(Fresh.create({ name: 'redis', driver: 'redis' }).broadcast('c', 'e')).rejects.toThrow(/ioredis/)
    vi.doUnmock('ioredis')
  })
})
