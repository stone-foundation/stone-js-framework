import { RedisQueue } from '../../src/drivers/RedisQueue'
import { QueueError } from '../../src/errors/QueueError'

vi.mock('ioredis', () => { throw new Error('Cannot find module ioredis') })

describe('RedisQueue without ioredis', () => {
  it('throws a helpful QueueError instructing to install ioredis', async () => {
    await expect(RedisQueue.create({ name: 'redis', driver: 'redis' }).size('default')).rejects.toThrow(/ioredis/)
    await expect(RedisQueue.create({ name: 'redis', driver: 'redis' }).size('default')).rejects.toThrow(QueueError)
  })
})
