import { MemoryBroadcaster } from '../../src/drivers/MemoryBroadcaster'
import { MemoryConnectionStore } from '../../src/drivers/MemoryConnectionStore'

/**
 * A broadcaster nobody else fans out to.
 *
 * Subscriptions and connections live in the driver, filed under its name: two tests sharing a name
 * would receive each other's broadcasts.
 */
let broadcasters = 0
const ownName = (): string => `test-${++broadcasters}`

describe('MemoryBroadcaster', () => {
  it('defaults its name and honours a custom one', () => {
    // Built without a name, because this test is about the default one.
    expect(MemoryBroadcaster.create().name).toBe('memory')
    expect(MemoryBroadcaster.create({ name: 'local' }).name).toBe('local')
  })

  it('delivers a broadcast to channel listeners and to `*` wildcard listeners', async () => {
    const broadcaster = MemoryBroadcaster.create({ name: ownName() })
    const onRoom = vi.fn()
    const onAll = vi.fn()
    broadcaster.on('room', onRoom)
    broadcaster.on('*', onAll)

    await broadcaster.broadcast('room', 'ping', { n: 1 })

    expect(onRoom).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: { n: 1 } })
    expect(onAll).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: { n: 1 } })
  })

  it('pushes to held connections that are members of the channel', async () => {
    const store = MemoryConnectionStore.create(ownName())
    const send = vi.fn()
    await store.add({ id: 'a', send })
    await store.add({ id: 'b' }) // no send()
    await store.subscribe('a', 'room')
    await store.subscribe('b', 'room')

    const broadcaster = MemoryBroadcaster.create({ name: ownName() }, store)
    await broadcaster.broadcast('room', 'ping', 42)

    expect(send).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: 42 })
  })

  it('supports the fluent to().emit() form', async () => {
    const broadcaster = MemoryBroadcaster.create({ name: ownName() })
    const listener = vi.fn()
    broadcaster.on('room', listener)
    await broadcaster.to('room').emit('hi')
    expect(listener).toHaveBeenCalledWith({ channel: 'room', event: 'hi', payload: undefined })
  })

  it('on() returns an unsubscribe that stops delivery', async () => {
    const broadcaster = MemoryBroadcaster.create({ name: ownName() })
    const listener = vi.fn()
    const off = broadcaster.on('room', listener)
    off()
    await broadcaster.broadcast('room', 'ping')
    expect(listener).not.toHaveBeenCalled()
  })

  it('reports presence members from its store', async () => {
    const store = MemoryConnectionStore.create(ownName())
    await store.add({ id: 'a', info: { user: 'Ana' } })
    await store.subscribe('a', 'room')
    const broadcaster = MemoryBroadcaster.create({ name: ownName() }, store)
    expect(await broadcaster.members('room')).toEqual([{ connectionId: 'a', info: { user: 'Ana' } }])
  })
})

describe('subscriptions and presence that outlive the event that made them', () => {
  it('reach a listener registered by a previous instance', async () => {
    // The failure this pins: the container is rebuilt for every event, so the broadcaster was too,
    // and a broadcast reached only the listeners registered during that same event. An adapter that
    // subscribed while starting received nothing from then on, silently.
    const heard: unknown[] = []
    const subscribing = MemoryBroadcaster.create({ name: 'rooms' })

    subscribing.on('room', (message) => { heard.push(message.payload) })

    const broadcasting = MemoryBroadcaster.create({ name: 'rooms' })

    await broadcasting.broadcast('room', 'ping', 42)

    expect(heard).toEqual([42])

    subscribing.clear()
  })

  it('keeps a connection joined for the next instance to find', async () => {
    const joining = MemoryConnectionStore.create('presence')
    await joining.add({ id: 'a', info: { user: 'Ana' } })
    await joining.subscribe('a', 'room')

    const reading = MemoryConnectionStore.create('presence')

    expect(await reading.members('room')).toEqual([{ connectionId: 'a', info: { user: 'Ana' } }])

    reading.clear()
  })

  it('stays apart from another driver of the same kind', async () => {
    // Two broadcasters both backed by memory fan out to their own subscribers, exactly as two Redis
    // broadcasters with different prefixes do.
    const heard: string[] = []
    const first = MemoryBroadcaster.create({ name: 'first' })
    const second = MemoryBroadcaster.create({ name: 'second' })

    first.on('room', () => { heard.push('first') })

    await second.broadcast('room', 'ping')

    expect(heard).toEqual([])

    first.clear()
    second.clear()
  })
})
