import { z } from 'zod'
import { validate } from '../src/middleware/validate'
import { validateEvent } from '../src/validateEvent'
import { ValidationError } from '../src/errors/ValidationError'

const makeEvent = (data: Record<string, unknown>): any => ({ get: (key: string) => data[key] })

describe('validateEvent', () => {
  it('passes when every input is valid', () => {
    const event = makeEvent({ name: 'Bob', age: 30 })
    expect(() => validateEvent(event, { name: z.string().min(2), age: z.number().positive() })).not.toThrow()
  })

  it('throws a single ValidationError with all issues, paths prefixed by key', () => {
    const event = makeEvent({ name: 'a', age: -1 })
    try {
      validateEvent(event, { name: z.string().min(2), age: z.number().positive() })
      expect.unreachable()
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationError)
      const paths = error.issues.map((i: any) => i.path.join('.'))
      expect(paths).toContain('name')
      expect(paths).toContain('age')
    }
  })

  it('prefixes nested paths with the event key', () => {
    const event = makeEvent({ body: { email: 'nope' } })
    try {
      validateEvent(event, { body: z.object({ email: z.string().email() }) })
      expect.unreachable()
    } catch (error: any) {
      expect(error.issues[0].path).toEqual(['body', 'email'])
    }
  })

  it('uses a provided validator', () => {
    const spy = { validate: vi.fn(() => ({ success: true, value: 1 })) } as any
    validateEvent(makeEvent({ a: 1 }), { a: z.number() }, spy)
    expect(spy.validate).toHaveBeenCalledOnce()
  })
})

describe('validate() middleware', () => {
  it('calls next when validation passes', async () => {
    const next = vi.fn(async () => 'ok' as any)
    const mw = validate({ name: z.string() })
    const res = await mw(makeEvent({ name: 'Bob' }), next as any)
    expect(res).toBe('ok')
    expect(next).toHaveBeenCalledOnce()
  })

  it('throws and does not call next when validation fails', async () => {
    const next = vi.fn(async () => 'ok' as any)
    const mw = validate({ name: z.string().min(5) })
    await expect(mw(makeEvent({ name: 'ab' }), next as any)).rejects.toThrow(ValidationError)
    expect(next).not.toHaveBeenCalled()
  })
})
