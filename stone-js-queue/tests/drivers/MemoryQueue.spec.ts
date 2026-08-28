import { MemoryQueue } from '../../src/drivers/MemoryQueue'

/**
 * A connection nobody else works in.
 *
 * The jobs live in the connection, filed under its name, so a test that reused a name would inherit
 * the previous one's queue. A test naming one on purpose still gets exactly that name.
 */
let connections = 0
const queue = (over: any = {}): MemoryQueue => MemoryQueue.create({ name: `test-${++connections}`, ...over })

describe('MemoryQueue', () => {
  it('defaults its name and honours a custom one', () => {
    // Built directly rather than through the helper above: this test is about the default name, and
    // the helper's whole job is to supply one.
    expect(MemoryQueue.create().name).toBe('memory')
    expect(MemoryQueue.create({ name: 'jobs' }).name).toBe('jobs')
  })

  it('dispatches, reserves (incrementing attempts), and acks', async () => {
    const q = queue()
    const id = await q.dispatch('send', { to: 'a' })
    expect(typeof id).toBe('string')
    expect(await q.size()).toBe(1)

    const job = await q.reserve()
    expect(job?.id).toBe(id)
    expect(job?.name).toBe('send')
    expect(job?.attempts).toBe(1)
    // reserved → not handed out again
    expect(await q.reserve()).toBeUndefined()

    await q.ack(job!)
    expect(await q.size()).toBe(0)
  })

  it('release returns a job for retry', async () => {
    const q = queue()
    await q.dispatch('x', {})
    const job = await q.reserve()
    await q.release(job!)
    expect(await q.size()).toBe(1)
    expect((await q.reserve())?.id).toBe(job?.id)
  })

  it('fail moves a job to the dead-letter list', async () => {
    const q = queue()
    await q.dispatch('x', {})
    const job = await q.reserve()
    await q.fail(job!, new Error('boom'))
    expect(await q.size()).toBe(0)
    expect(q.failedJobs().map((j) => j.id)).toEqual([job?.id])
  })

  it('ack/fail tolerate a job whose queue never existed', async () => {
    const q = queue()
    const ghost = { id: 'z', name: 'x', payload: {}, queue: 'ghost', attempts: 0, maxAttempts: 1, backoff: 0, availableAt: 0 }
    await expect(q.ack(ghost)).resolves.toBeUndefined()
    expect(await q.size()).toBe(0)
  })

  it('isolates named queues and reports total size', async () => {
    const q = queue()
    await q.dispatch('a', {}, { queue: 'emails' })
    await q.dispatch('b', {}, { queue: 'reports' })
    expect(await q.size('emails')).toBe(1)
    expect(await q.size('reports')).toBe(1)
    expect(await q.size()).toBe(2)
    expect(await q.reserve('emails')).toBeDefined()
    expect(await q.reserve('emails')).toBeUndefined()
  })

  it('clears one queue or all', async () => {
    const q = queue()
    await q.dispatch('a', {}, { queue: 'one' })
    await q.dispatch('b', {}, { queue: 'two' })
    await q.clear('one')
    expect(await q.size('one')).toBe(0)
    expect(await q.size('two')).toBe(1)
    await q.clear()
    expect(await q.size()).toBe(0)
  })

  describe('delay', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('holds a delayed job until it is due', async () => {
      const q = queue()
      await q.dispatch('x', {}, { delay: 5 })
      expect(await q.size()).toBe(0)
      expect(await q.reserve()).toBeUndefined()
      vi.advanceTimersByTime(5000)
      expect(await q.size()).toBe(1)
      expect(await q.reserve()).toBeDefined()
    })

    it('later() enqueues with a delay', async () => {
      const q = queue()
      await q.later(3, 'x', {})
      expect(await q.reserve()).toBeUndefined()
      vi.advanceTimersByTime(3000)
      expect(await q.reserve()).toBeDefined()
    })

    it('release with a delay defers the retry', async () => {
      const q = queue()
      await q.dispatch('x', {})
      const job = await q.reserve()
      await q.release(job!, 2)
      expect(await q.reserve()).toBeUndefined()
      vi.advanceTimersByTime(2000)
      expect(await q.reserve()).toBeDefined()
    })
  })
})

describe('work that outlives the event that dispatched it', () => {
  it('is still there for the next connection under the same name', async () => {
    // The failure this pins, measured on the published 0.8.18 before the fix: the jobs lived in the
    // instance, and the container is rebuilt for every event, so `size()` answered 1 from the
    // instance that dispatched and 0 from the next one. The worker reserved nothing, every job was
    // dropped, and nothing said so. `@stone-js/notifications` hands its deliveries to a queue as
    // soon as one is registered, so a notification reported as queued was never delivered.
    const dispatching = MemoryQueue.create({ name: 'orders' })

    await dispatching.dispatch('send-receipt', { orderId: 'A-1' })

    const working = MemoryQueue.create({ name: 'orders' })

    expect(await working.size()).toBe(1)
    expect((await working.reserve())?.name).toBe('send-receipt')

    await working.clear()
  })

  it('stays apart from work filed under another name', async () => {
    // Two connections both backed by memory are two queues, exactly as two Redis connections with
    // different prefixes are. Sharing one backing would let an application's queues drain each other.
    const orders = MemoryQueue.create({ name: 'orders-b' })
    const mail = MemoryQueue.create({ name: 'mail-b' })

    await orders.dispatch('send-receipt', {})

    expect(await orders.size()).toBe(1)
    expect(await mail.size()).toBe(0)

    await orders.clear()
    await mail.clear()
  })
})
