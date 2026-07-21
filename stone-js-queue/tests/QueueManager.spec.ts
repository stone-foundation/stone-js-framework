import { QueueManager } from '../src/QueueManager'
import { QueueError } from '../src/errors/QueueError'
import { MemoryQueue } from '../src/drivers/MemoryQueue'

describe('QueueManager', () => {
  afterEach(() => { QueueManager.setInstance(undefined) })

  it('throws when resolving an unregistered connection', () => {
    expect(() => QueueManager.create().connection()).toThrow(QueueError)
  })

  it('builds a factory connection once and reuses it', () => {
    const mgr = QueueManager.create('memory')
    const factory = vi.fn(() => MemoryQueue.create({ name: 'memory' }))
    mgr.registerFactory('memory', factory)
    expect(mgr.connection()).toBe(mgr.connection())
    expect(factory).toHaveBeenCalledTimes(1)
    expect(mgr.has('memory')).toBe(true)
    expect(mgr.has('nope')).toBe(false)
  })

  it('registers an instance, sets the default, and dispatches through it', async () => {
    const conn = MemoryQueue.create({ name: 'x' })
    const mgr = QueueManager.create().register('x', conn).setDefaultConnection('x')
    expect(mgr.connection()).toBe(conn)
    const id = await mgr.dispatch('job', { a: 1 })
    expect(await conn.size()).toBe(1)
    expect(typeof id).toBe('string')
  })

  it('publishes and clears a process-wide instance', () => {
    const mgr = QueueManager.create()
    QueueManager.setInstance(mgr)
    expect(QueueManager.getInstance()).toBe(mgr)
    QueueManager.setInstance(undefined)
    expect(QueueManager.getInstance()).toBeUndefined()
  })
})
