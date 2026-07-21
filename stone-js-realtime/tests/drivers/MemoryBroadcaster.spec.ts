import { MemoryBroadcaster } from '../../src/drivers/MemoryBroadcaster'
import { MemoryConnectionStore } from '../../src/drivers/MemoryConnectionStore'

describe('MemoryBroadcaster', () => {
  it('defaults its name and honours a custom one', () => {
    expect(MemoryBroadcaster.create().name).toBe('memory')
    expect(MemoryBroadcaster.create({ name: 'local' }).name).toBe('local')
  })

  it('delivers a broadcast to channel listeners and to `*` wildcard listeners', async () => {
    const broadcaster = MemoryBroadcaster.create()
    const onRoom = vi.fn()
    const onAll = vi.fn()
    broadcaster.on('room', onRoom)
    broadcaster.on('*', onAll)

    await broadcaster.broadcast('room', 'ping', { n: 1 })

    expect(onRoom).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: { n: 1 } })
    expect(onAll).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: { n: 1 } })
  })

  it('pushes to held connections that are members of the channel', async () => {
    const store = MemoryConnectionStore.create()
    const send = vi.fn()
    await store.add({ id: 'a', send })
    await store.add({ id: 'b' }) // no send()
    await store.subscribe('a', 'room')
    await store.subscribe('b', 'room')

    const broadcaster = MemoryBroadcaster.create({ name: 'memory' }, store)
    await broadcaster.broadcast('room', 'ping', 42)

    expect(send).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: 42 })
  })

  it('supports the fluent to().emit() form', async () => {
    const broadcaster = MemoryBroadcaster.create()
    const listener = vi.fn()
    broadcaster.on('room', listener)
    await broadcaster.to('room').emit('hi')
    expect(listener).toHaveBeenCalledWith({ channel: 'room', event: 'hi', payload: undefined })
  })

  it('on() returns an unsubscribe that stops delivery', async () => {
    const broadcaster = MemoryBroadcaster.create()
    const listener = vi.fn()
    const off = broadcaster.on('room', listener)
    off()
    await broadcaster.broadcast('room', 'ping')
    expect(listener).not.toHaveBeenCalled()
  })

  it('reports presence members from its store', async () => {
    const store = MemoryConnectionStore.create()
    await store.add({ id: 'a', info: { user: 'Ana' } })
    await store.subscribe('a', 'room')
    const broadcaster = MemoryBroadcaster.create({}, store)
    expect(await broadcaster.members('room')).toEqual([{ connectionId: 'a', info: { user: 'Ana' } }])
  })
})
