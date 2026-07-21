import { RealtimeManager } from '../src/RealtimeManager'
import { RealtimeError } from '../src/errors/RealtimeError'
import { MemoryBroadcaster } from '../src/drivers/MemoryBroadcaster'

describe('RealtimeManager', () => {
  afterEach(() => { RealtimeManager.setInstance(undefined) })

  it('resolves a registered instance', () => {
    const manager = RealtimeManager.create('memory')
    const broadcaster = MemoryBroadcaster.create({ name: 'memory' })
    manager.register('memory', broadcaster)
    expect(manager.connection()).toBe(broadcaster)
    expect(manager.connection('memory')).toBe(broadcaster)
  })

  it('builds a factory lazily and only once', () => {
    const manager = RealtimeManager.create('memory')
    const factory = vi.fn(() => MemoryBroadcaster.create({ name: 'memory' }))
    manager.registerFactory('memory', factory)
    const first = manager.connection('memory')
    const second = manager.connection('memory')
    expect(first).toBe(second)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('honours setDefaultConnection', () => {
    const manager = RealtimeManager.create('memory')
    manager.registerFactory('redis', () => MemoryBroadcaster.create({ name: 'redis' }))
    manager.setDefaultConnection('redis')
    expect(manager.connection().name).toBe('redis')
  })

  it('reports registration with has()', () => {
    const manager = RealtimeManager.create()
    expect(manager.has('memory')).toBe(false)
    manager.registerFactory('memory', () => MemoryBroadcaster.create())
    expect(manager.has('memory')).toBe(true)
    manager.register('x', MemoryBroadcaster.create())
    expect(manager.has('x')).toBe(true)
  })

  it('throws for an unknown connection', () => {
    expect(() => RealtimeManager.create().connection('nope')).toThrow(RealtimeError)
  })

  it('exposes a process-wide default instance', () => {
    expect(RealtimeManager.getInstance()).toBeUndefined()
    const manager = RealtimeManager.create()
    RealtimeManager.setInstance(manager)
    expect(RealtimeManager.getInstance()).toBe(manager)
  })
})
