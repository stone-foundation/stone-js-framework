import { Worker } from '../src/Worker'
import { JobRegistry } from '../src/JobRegistry'
import { QueueManager } from '../src/QueueManager'
import { MemoryQueue } from '../src/drivers/MemoryQueue'

const setup = (): { conn: MemoryQueue, manager: QueueManager, registry: JobRegistry, worker: Worker } => {
  const conn = MemoryQueue.create({ name: 'memory' })
  const manager = QueueManager.create('memory').register('memory', conn)
  const registry = JobRegistry.create()
  const worker = Worker.create(manager, registry)
  return { conn, manager, registry, worker }
}

describe('Worker', () => {
  it('processNext returns false on an empty queue', async () => {
    const { worker } = setup()
    expect(await worker.processNext()).toBe(false)
  })

  it('runs the handler with the payload and acks on success', async () => {
    const { conn, registry, worker } = setup()
    const handle = vi.fn(async () => {})
    registry.register('send', handle)
    await conn.dispatch('send', { to: 'a' })

    expect(await worker.processNext()).toBe(true)
    expect(handle).toHaveBeenCalledWith({ to: 'a' }, expect.objectContaining({ name: 'send' }))
    expect(await conn.size()).toBe(0)
  })

  it('retries with release until attempts are exhausted, then dead-letters', async () => {
    const { conn, registry, worker } = setup()
    registry.register('x', async () => { throw new Error('boom') })
    await conn.dispatch('x', {}, { maxAttempts: 2 })

    await worker.processNext() // attempt 1 → release (backoff 0 → immediately ready)
    expect(await conn.size()).toBe(1)
    await worker.processNext() // attempt 2 → exhausted → fail
    expect(await conn.size()).toBe(0)
    expect(conn.failedJobs()).toHaveLength(1)
  })

  it('dead-letters a non-Error rejection and an unregistered job', async () => {
    const { conn, registry, worker } = setup()
    registry.register('str', async () => { throw 'oops' }) // eslint-disable-line @typescript-eslint/no-throw-literal
    await conn.dispatch('str', {}, { maxAttempts: 1 })
    await worker.processNext()
    expect(conn.failedJobs()).toHaveLength(1)

    await conn.dispatch('unregistered', {}, { maxAttempts: 1 })
    await worker.processNext() // resolve() throws → caught → fail
    expect(conn.failedJobs()).toHaveLength(2)
  })

  it('drain processes every ready job in one pass', async () => {
    const { conn, registry, worker } = setup()
    registry.register('x', async () => {})
    await conn.dispatch('x', {})
    await conn.dispatch('x', {})
    await conn.dispatch('x', {})
    expect(await worker.drain()).toBe(3)
    expect(await conn.size()).toBe(0)
  })

  it('sleep resolves after the given delay', async () => {
    const { worker } = setup()
    await expect((worker as any).sleep(1)).resolves.toBeUndefined()
  })

  it('run consumes until stopped', async () => {
    const { conn, registry, worker } = setup()
    const handle = vi.fn(async () => {})
    registry.register('x', handle)
    await conn.dispatch('x', {})

    // Stop the loop the first time it would sleep (i.e. once the queue drains).
    vi.spyOn(worker as any, 'sleep').mockImplementation(async () => { worker.stop() })

    expect(worker.isRunning()).toBe(false)
    await worker.run() // default queues + default sleep interval

    expect(handle).toHaveBeenCalledTimes(1)
    expect(worker.isRunning()).toBe(false)
  })
})
