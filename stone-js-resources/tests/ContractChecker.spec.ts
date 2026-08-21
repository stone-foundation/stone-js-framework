import { z } from 'zod'
import { ContractChecker } from '../src/ContractChecker'

const checker = ContractChecker.create()

describe('reading a schema, whatever dialect wrote it', () => {
  it('runs a Standard Schema, which is a specification rather than a library', async () => {
    // Zod 3.24+, Valibot, ArkType and others implement it, so accepting it is not accepting one vendor.
    const standard = {
      '~standard': {
        validate: (data: any) => (typeof data?.id === 'number'
          ? { value: { id: data.id } }
          : { issues: [{ message: 'id must be a number', path: ['id'] }] })
      }
    }

    expect(checker.check(standard, { id: 1, secret: 'x' })).toEqual({ success: true, value: { id: 1 } })
    expect(checker.check(standard, {}).success).toBe(false)
  })

  it('runs the safeParse shape, and returns the parsed value as the projection', async () => {
    const schema = z.object({ id: z.number() })

    expect(checker.check(schema, { id: 1, extra: 'stripped' })).toEqual({ success: true, value: { id: 1 } })
  })

  it('runs a native validate result unchanged', async () => {
    const schema = { validate: (d: any) => ({ success: true, value: { seen: d } }) }

    expect(checker.check(schema, 'x')).toEqual({ success: true, value: { seen: 'x' } })
  })

  it('runs a throwing parse, and reports what it threw', async () => {
    const schema = { parse: (d: any) => { if (d === 'bad') { throw new Error('nope') } return d } }

    expect(checker.check(schema, 'ok')).toEqual({ success: true, value: 'ok' })
    expect(checker.check(schema, 'bad')).toMatchObject({ success: false, issues: [{ message: 'nope' }] })
  })

  it('normalises the path, whichever dialect reported it', async () => {
    // Standard Schema may carry segment objects rather than plain keys; a message saying `user.name`
    // is worth more than one saying `[object Object]`.
    const standard = {
      '~standard': { validate: () => ({ issues: [{ message: 'required', path: [{ key: 'user' }, { key: 'name' }] }] }) }
    }

    expect(checker.check(standard, {}).issues?.[0].path).toEqual(['user', 'name'])
  })

  it('reports a failure with an empty path as the root', async () => {
    const schema = { validate: () => ({ success: false, issues: [{ message: 'wrong shape' }] }) }

    expect(checker.check(schema, {}).issues?.[0]).toEqual({ message: 'wrong shape', path: [] })
  })

  it('refuses a value it cannot run', async () => {
    // Reporting success here would mean projecting unchecked data while claiming it was checked.
    expect(() => checker.check({ notASchema: true }, {})).toThrow(/must be runnable/)
    expect(() => checker.check(undefined, {})).toThrow(/must be runnable/)
  })

  it('refuses an asynchronous schema rather than serialising a promise', async () => {
    // A promise is not a result, and treating it as one is how `[object Promise]` reaches a body.
    const asyncSchema = { '~standard': { validate: async () => ({ value: {} }) } }

    expect(() => checker.check(asyncSchema, {})).toThrow(/validates asynchronously/)
  })
})
