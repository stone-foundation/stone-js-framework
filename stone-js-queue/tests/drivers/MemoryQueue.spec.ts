import { MemoryQueue } from '../../src/drivers/MemoryQueue'

const queue = (over: any = {}): MemoryQueue => MemoryQueue.create(over)

describe('MemoryQueue', () => {
  it('defaults its name and honours a custom one', () => {
    expect(queue().name).toBe('memory')
    expect(queue({ name: 'jobs' }).name).toBe('jobs')
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
