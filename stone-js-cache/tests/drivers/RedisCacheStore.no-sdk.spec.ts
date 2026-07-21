import { RedisCacheStore } from '../../src/drivers/RedisCacheStore'
import { CacheError } from '../../src/errors/CacheError'

// Simulate ioredis not being installed.
vi.mock('ioredis', () => { throw new Error('Cannot find module ioredis') })

describe('RedisCacheStore without ioredis', () => {
  it('throws a helpful CacheError instructing to install ioredis', async () => {
    const store = RedisCacheStore.create({ name: 'redis', driver: 'redis' })
    await expect(store.get('k')).rejects.toThrow(/ioredis/)
    await expect(store.get('k')).rejects.toThrow(CacheError)
  })
})
