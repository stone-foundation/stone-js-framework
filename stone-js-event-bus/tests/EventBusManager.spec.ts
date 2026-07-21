import { EventBusManager } from '../src/EventBusManager'
import { MemoryEventBus } from '../src/drivers/MemoryEventBus'
import { EventBusError } from '../src/errors/EventBusError'

describe('EventBusManager', () => {
  afterEach(() => { EventBusManager.setInstance(undefined) })

  it('resolves a registered connection', () => {
    const manager = EventBusManager.create('local')
    const conn = MemoryEventBus.create('local')
    manager.register('local', conn)
    expect(manager.connection()).toBe(conn)
    expect(manager.connection('local')).toBe(conn)
  })

  it('builds a factory lazily and only once', () => {
    const manager = EventBusManager.create()
    const factory = vi.fn(() => MemoryEventBus.create('local'))
    manager.registerFactory('local', factory)
    expect(manager.connection('local')).toBe(manager.connection('local'))
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('reports registration and honours setDefaultConnection', () => {
    const manager = EventBusManager.create()
    expect(manager.has('cloud')).toBe(false)
    manager.registerFactory('cloud', () => MemoryEventBus.create('cloud'))
    manager.setDefaultConnection('cloud')
    expect(manager.has('cloud')).toBe(true)
    expect(manager.connection().name).toBe('cloud')
  })

  it('throws for an unknown connection', () => {
    expect(() => EventBusManager.create().connection('nope')).toThrow(EventBusError)
  })

  it('emit fans out to the default targets', async () => {
    const local = MemoryEventBus.create('local')
    const cloud = MemoryEventBus.create('cloud')
    const manager = EventBusManager.create('local', ['local', 'cloud']).register('local', local).register('cloud', cloud)
    await manager.emit('order.shipped', { id: 1 })
    expect(local.events).toEqual([{ name: 'order.shipped', payload: { id: 1 } }])
    expect(cloud.events).toEqual([{ name: 'order.shipped', payload: { id: 1 } }])
  })

  it('emit honours explicit targets and setDefaultTargets', async () => {
    const local = MemoryEventBus.create('local')
    const cloud = MemoryEventBus.create('cloud')
    const manager = EventBusManager.create('local', ['local']).register('local', local).register('cloud', cloud)
    await manager.emit('e', 1, { targets: ['cloud'] })
    expect(local.events).toEqual([])
    expect(cloud.events).toEqual([{ name: 'e', payload: 1 }])

    manager.setDefaultTargets(['local', 'cloud'])
    await manager.emit('f', 2)
    expect(local.events).toEqual([{ name: 'f', payload: 2 }])
  })

  it('exposes a process-wide default instance', () => {
    expect(EventBusManager.getInstance()).toBeUndefined()
    const manager = EventBusManager.create()
    EventBusManager.setInstance(manager)
    expect(EventBusManager.getInstance()).toBe(manager)
  })
})
