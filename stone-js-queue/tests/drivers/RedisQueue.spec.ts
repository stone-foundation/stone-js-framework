import { RedisQueue } from '../../src/drivers/RedisQueue'
import { Job } from '../../src/declarations'

const h = vi.hoisted(() => {
  const client: any = {
    rpoplpush: vi.fn(), get: vi.fn(), set: vi.fn(), del: vi.fn(), lrem: vi.fn(),
    lpush: vi.fn(), zadd: vi.fn(), zrangebyscore: vi.fn(), zrem: vi.fn(),
    llen: vi.fn(), smembers: vi.fn(), sadd: vi.fn(), srem: vi.fn(), scan: vi.fn()
  }
  const Ctor = vi.fn(() => client)
  return { client, Ctor }
})

vi.mock('ioredis', () => ({ default: h.Ctor }))

const queue = (over: any = {}): RedisQueue =>
  RedisQueue.create({ name: 'redis', driver: 'redis', prefix: 'q', client: h.client, ...over })

const job = (over: Partial<Job> = {}): Job => ({
  id: 'j1', name: 'x', payload: {}, queue: 'default', attempts: 0, maxAttempts: 1, backoff: 0, availableAt: 0, ...over
})

describe('RedisQueue', () => {
  beforeEach(() => {
    for (const fn of Object.values(h.client)) { (fn as any).mockReset() }
    h.Ctor.mockClear()
  })

  it('defaults its name and honours a custom one', () => {
    expect(queue().name).toBe('redis')
    expect(queue({ name: 'jobs' }).name).toBe('jobs')
    expect(RedisQueue.create({ driver: 'redis', client: h.client } as any).name).toBe('redis')
  })

  it('builds a client from url / options / empty, or reuses the provided one', async () => {
    h.client.rpoplpush.mockResolvedValue(null)
    h.client.zrangebyscore.mockResolvedValue([])

    await queue({ client: undefined, url: 'redis://x' }).reserve()
    expect(h.Ctor).toHaveBeenCalledWith('redis://x')
    await queue({ client: undefined, options: { host: 'h' } }).reserve()
    expect(h.Ctor).toHaveBeenCalledWith({ host: 'h' })
    await queue({ client: undefined }).reserve()
    expect(h.Ctor).toHaveBeenCalledWith({})

    h.Ctor.mockClear()
    await queue().reserve()
    expect(h.Ctor).not.toHaveBeenCalled()
  })

  it('dispatch stores the job and pushes its id to the ready list', async () => {
    const id = await queue().dispatch('send', { to: 'a' })
    expect(typeof id).toBe('string')
    expect(h.client.sadd).toHaveBeenCalledWith('q:queues', 'default')
    expect(h.client.set).toHaveBeenCalledWith(`q:job:${id}`, expect.stringContaining('"name":"send"'))
    expect(h.client.lpush).toHaveBeenCalledWith('q:default', id)
    expect(h.client.zadd).not.toHaveBeenCalled()
  })

  it('dispatch with a delay stores the id on the delayed set; later() too', async () => {
    await queue().dispatch('x', {}, { delay: 30 })
    expect(h.client.zadd).toHaveBeenCalledWith('q:default:delayed', expect.any(Number), expect.any(String))
    h.client.zadd.mockClear()
    await queue().later(10, 'x', {})
    expect(h.client.zadd).toHaveBeenCalled()
  })

  it('reserve migrates due jobs, moves one to processing, and increments attempts', async () => {
    h.client.zrangebyscore.mockResolvedValue(['late'])
    h.client.zrem.mockResolvedValue(1)
    h.client.rpoplpush.mockResolvedValue('j1')
    h.client.get.mockResolvedValue(JSON.stringify(job({ id: 'j1', attempts: 0 })))

    const reserved = await queue().reserve()
    expect(h.client.lpush).toHaveBeenCalledWith('q:default', 'late') // migrated
    expect(h.client.rpoplpush).toHaveBeenCalledWith('q:default', 'q:default:processing')
    expect(reserved?.attempts).toBe(1)
    expect(h.client.set).toHaveBeenCalledWith('q:job:j1', expect.stringContaining('"attempts":1'))
  })

  it('reserve skips migration when zrem loses the race, and returns undefined when empty', async () => {
    h.client.zrangebyscore.mockResolvedValue(['late'])
    h.client.zrem.mockResolvedValue(0) // someone else took it
    h.client.rpoplpush.mockResolvedValue(null)
    expect(await queue().reserve()).toBeUndefined()
    expect(h.client.lpush).not.toHaveBeenCalled()
  })

  it('reserve drops a job whose data disappeared', async () => {
    h.client.zrangebyscore.mockResolvedValue([])
    h.client.rpoplpush.mockResolvedValue('gone')
    h.client.get.mockResolvedValue(null)
    expect(await queue().reserve()).toBeUndefined()
    expect(h.client.lrem).toHaveBeenCalledWith('q:default:processing', 1, 'gone')
  })

  it('ack removes the job from processing and deletes its data', async () => {
    await queue().ack(job({ id: 'j1', queue: 'default' }))
    expect(h.client.lrem).toHaveBeenCalledWith('q:default:processing', 1, 'j1')
    expect(h.client.del).toHaveBeenCalledWith('q:job:j1')
  })

  it('release requeues immediately or after a delay', async () => {
    await queue().release(job({ id: 'j1' }))
    expect(h.client.lpush).toHaveBeenCalledWith('q:default', 'j1')
    h.client.lpush.mockClear()
    await queue().release(job({ id: 'j1' }), 5)
    expect(h.client.zadd).toHaveBeenCalledWith('q:default:delayed', expect.any(Number), 'j1')
    expect(h.client.lpush).not.toHaveBeenCalled()
  })

  it('fail removes the job and pushes it to the failed list', async () => {
    await queue().fail(job({ id: 'j1' }), new Error('boom'))
    expect(h.client.del).toHaveBeenCalledWith('q:job:j1')
    expect(h.client.lpush).toHaveBeenCalledWith('q:failed', expect.stringContaining('"id":"j1"'))
  })

  it('size reads a queue length, or sums across known queues', async () => {
    h.client.llen.mockResolvedValue(4)
    expect(await queue().size('default')).toBe(4)

    h.client.smembers.mockResolvedValue(['a', 'b'])
    h.client.llen.mockResolvedValue(2)
    expect(await queue().size()).toBe(4)
  })

  it('clear deletes one queue, or scans and deletes everything', async () => {
    await queue().clear('default')
    expect(h.client.del).toHaveBeenCalledWith('q:default', 'q:default:processing', 'q:default:delayed')
    expect(h.client.srem).toHaveBeenCalledWith('q:queues', 'default')

    h.client.scan.mockResolvedValueOnce(['0', ['q:a', 'q:b']])
    await queue().clear()
    expect(h.client.scan).toHaveBeenCalledWith('0', 'MATCH', 'q:*', 'COUNT', 100)
    expect(h.client.del).toHaveBeenCalledWith('q:a', 'q:b')
  })
})
