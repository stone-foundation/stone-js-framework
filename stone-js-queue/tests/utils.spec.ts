import { makeJob, backoffDelay, resolveModuleDefault } from '../src/utils'

describe('queue utils', () => {
  it('makeJob applies defaults', () => {
    const job = makeJob('send', { a: 1 })
    expect(job.name).toBe('send')
    expect(job.payload).toEqual({ a: 1 })
    expect(job.queue).toBe('default')
    expect(job.attempts).toBe(0)
    expect(job.maxAttempts).toBe(1)
    expect(job.backoff).toBe(0)
    expect(typeof job.id).toBe('string')
    expect(job.availableAt).toBeLessThanOrEqual(Date.now())
  })

  it('makeJob honours options and extra delay', () => {
    const job = makeJob('x', {}, { queue: 'q', delay: 5, maxAttempts: 3, backoff: 2 }, 5)
    expect(job.queue).toBe('q')
    expect(job.maxAttempts).toBe(3)
    expect(job.backoff).toBe(2)
    expect(job.availableAt).toBeGreaterThan(Date.now())
    // maxAttempts is floored at 1
    expect(makeJob('x', {}, { maxAttempts: 0 }).maxAttempts).toBe(1)
  })

  it('backoffDelay grows with attempts', () => {
    expect(backoffDelay({ backoff: 3, attempts: 0 } as any)).toBe(3)
    expect(backoffDelay({ backoff: 3, attempts: 2 } as any)).toBe(6)
  })

  it('resolveModuleDefault returns .default or the module itself', () => {
    expect(resolveModuleDefault({ default: 'X' })).toBe('X')
    expect(resolveModuleDefault('Y')).toBe('Y')
  })
})
