import { MemoryConnectionStore } from '../../src/drivers/MemoryConnectionStore'

describe('MemoryConnectionStore', () => {
  it('adds connections, subscribes them and reports channel members', async () => {
    const store = MemoryConnectionStore.create()
    await store.add({ id: 'a', info: { user: 'Ana' } })
    await store.add({ id: 'b', info: { user: 'Bo' } })

    await store.subscribe('a', 'room')
    await store.subscribe('b', 'room')

    const members = await store.members('room')
    expect(members).toEqual([
      { connectionId: 'a', info: { user: 'Ana' } },
      { connectionId: 'b', info: { user: 'Bo' } }
    ])
    expect((await store.connectionsFor('room')).map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('unsubscribe removes a single membership', async () => {
    const store = MemoryConnectionStore.create()
    await store.add({ id: 'a' })
    await store.subscribe('a', 'room')
    await store.unsubscribe('a', 'room')
    expect(await store.members('room')).toEqual([])
  })

  it('remove clears the connection and all its memberships', async () => {
    const store = MemoryConnectionStore.create()
    await store.add({ id: 'a' })
    await store.subscribe('a', 'room')
    await store.remove('a')
    expect(await store.members('room')).toEqual([])
    expect(await store.connectionsFor('room')).toEqual([])
    // Removing again (unknown id) is a no-op.
    await store.remove('a')
  })

  it('ignores membership ids that no longer resolve to a connection', async () => {
    const store = MemoryConnectionStore.create()
    await store.subscribe('ghost', 'room') // subscribed without add()
    expect(await store.connectionsFor('room')).toEqual([])
  })
})
