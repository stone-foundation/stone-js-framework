import { ApiGatewayWsBroadcaster } from '../src/ApiGatewayWsBroadcaster'
import { ApiGatewayWsAdapterError } from '../src/errors/ApiGatewayWsAdapterError'

const fakeStore = (): any => ({
  add: vi.fn(), remove: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn(),
  connectionsFor: vi.fn().mockResolvedValue([{ id: 'a' }, { id: 'b' }]),
  members: vi.fn().mockResolvedValue([{ connectionId: 'a' }])
})

describe('ApiGatewayWsBroadcaster', () => {
  it('defaults its name and honours a custom one', () => {
    expect(ApiGatewayWsBroadcaster.create().name).toBe('apigw-ws')
    expect(ApiGatewayWsBroadcaster.create({ name: 'ws' }).name).toBe('ws')
  })

  it('broadcast posts to each channel member and notifies local + wildcard listeners', async () => {
    const store = fakeStore()
    const post = vi.fn().mockResolvedValue(undefined)
    const management = vi.fn(() => ({ postToConnection: post }))
    const broadcaster = ApiGatewayWsBroadcaster.create({ store, management })
    const onRoom = vi.fn()
    const onAll = vi.fn()
    broadcaster.on('room', onRoom)
    broadcaster.on('*', onAll)

    broadcaster.useEndpoint('https://api/prod')
    await broadcaster.broadcast('room', 'ping', { n: 1 })

    const data = JSON.stringify({ channel: 'room', event: 'ping', payload: { n: 1 } })
    expect(management).toHaveBeenCalledWith('https://api/prod')
    expect(post).toHaveBeenCalledWith('a', data)
    expect(post).toHaveBeenCalledWith('b', data)
    expect(onRoom).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: { n: 1 } })
    expect(onAll).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: { n: 1 } })
  })

  it('to().emit delegates to broadcast', async () => {
    const store = fakeStore()
    const post = vi.fn().mockResolvedValue(undefined)
    const broadcaster = ApiGatewayWsBroadcaster.create({ store, management: () => ({ postToConnection: post }) })
    broadcaster.useEndpoint('https://api/prod')
    await broadcaster.to('room').emit('hi')
    expect(post).toHaveBeenCalledWith('a', expect.stringContaining('"event":"hi"'))
  })

  it('on() returns an unsubscribe that stops local delivery', async () => {
    const broadcaster = ApiGatewayWsBroadcaster.create({ store: fakeStore(), management: () => ({ postToConnection: vi.fn() }) })
    const listener = vi.fn()
    const off = broadcaster.on('room', listener)
    off()
    broadcaster.useEndpoint('https://api/prod')
    await broadcaster.broadcast('room', 'ping')
    expect(listener).not.toHaveBeenCalled()
  })

  it('members delegates to the store', async () => {
    const store = fakeStore()
    const broadcaster = ApiGatewayWsBroadcaster.create({ store })
    expect(await broadcaster.members('room')).toEqual([{ connectionId: 'a' }])
  })

  it('reuses the client across endpoints unless it changes', async () => {
    const management = vi.fn(() => ({ postToConnection: vi.fn().mockResolvedValue(undefined) }))
    const broadcaster = ApiGatewayWsBroadcaster.create({ store: fakeStore(), management })
    broadcaster.useEndpoint('https://api/prod')
    await broadcaster.broadcast('room', 'a')
    broadcaster.useEndpoint('https://api/prod') // same endpoint: no rebuild
    await broadcaster.broadcast('room', 'b')
    expect(management).toHaveBeenCalledTimes(1)
    broadcaster.useEndpoint('https://api/dev') // changed: rebuild
    await broadcaster.broadcast('room', 'c')
    expect(management).toHaveBeenCalledTimes(2)
  })

  it('uses a default management client factory when none is injected', async () => {
    const store = { ...fakeStore(), connectionsFor: vi.fn().mockResolvedValue([]) }
    const broadcaster = ApiGatewayWsBroadcaster.create({ store }) // no `management`: exercises the default factory
    broadcaster.useEndpoint('https://api/prod')
    await expect(broadcaster.broadcast('room', 'ping')).resolves.toBeUndefined()
  })

  it('throws when broadcasting before an endpoint is set', async () => {
    const broadcaster = ApiGatewayWsBroadcaster.create({ store: fakeStore() })
    await expect(broadcaster.broadcast('room', 'ping')).rejects.toThrow(ApiGatewayWsAdapterError)
  })
})
