import { z } from 'zod'
import { Validator } from '../src/Validator'
import { fromZod, isZodLike } from '../src/adapters/zod'
import { resolveSchema } from '../src/schema'
import { ValidationError } from '../src/errors/ValidationError'
import { fromStandard, isStandardSchema } from '../src/adapters/standardSchema'
import { ValidationSchema, StandardSchemaV1, ZodLikeSchema } from '../src/declarations'

const UserSchema = z.object({ name: z.string().min(2), age: z.number().int().positive() })

describe('adapters/zod', () => {
  it('adapts a passing zod schema', () => {
    const schema = fromZod(z.string())
    expect(schema.validate('hi')).toEqual({ success: true, value: 'hi' })
  })

  it('normalises zod issues (path, message, code)', () => {
    const result = fromZod(UserSchema).validate({ name: 'a', age: -1 })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.issues).toHaveLength(2)
    expect(result.issues[0].path).toEqual(['name'])
    expect(typeof result.issues[0].message).toBe('string')
    expect(result.issues[0].code).toBeDefined()
  })

  it('stringifies symbol path segments', () => {
    const sym = Symbol('secret')
    const fake: ZodLikeSchema = {
      safeParse: () => ({ success: false, error: { issues: [{ message: 'bad', path: [sym, 0], code: 'custom' }] } })
    }
    const result = fromZod(fake).validate({})
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.issues[0].path).toEqual([String(sym), 0])
  })

  it('detects zod-like schemas', () => {
    expect(isZodLike(z.string())).toBe(true)
    expect(isZodLike({})).toBe(false)
    expect(isZodLike(undefined)).toBe(false)
  })
})

describe('adapters/standardSchema', () => {
  it('adapts a passing standard schema (real zod ~standard)', () => {
    const schema = fromStandard(z.string() as unknown as StandardSchemaV1<string>)
    expect(schema.validate('ok')).toEqual({ success: true, value: 'ok' })
  })

  it('normalises standard issues incl. {key} path objects and symbols', () => {
    const sym = Symbol('k')
    const fake: StandardSchemaV1 = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: () => ({ issues: [{ message: 'nope', path: ['a', { key: 1 }, sym] }] })
      }
    }
    const result = fromStandard(fake).validate({})
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.issues[0].path).toEqual(['a', 1, String(sym)])
  })

  it('handles issues without a path', () => {
    const fake: StandardSchemaV1 = {
      '~standard': { version: 1, vendor: 'test', validate: () => ({ issues: [{ message: 'root' }] }) }
    }
    const result = fromStandard(fake).validate(1)
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.issues[0].path).toEqual([])
  })

  it('throws on asynchronous standard schemas', () => {
    const fake: StandardSchemaV1 = {
      '~standard': { version: 1, vendor: 'test', validate: async () => ({ value: 1 }) }
    }
    expect(() => fromStandard(fake).validate(1)).toThrow(ValidationError)
  })

  it('detects standard schemas', () => {
    expect(isStandardSchema(z.string())).toBe(true)
    expect(isStandardSchema({})).toBe(false)
    expect(isStandardSchema({ '~standard': { version: 2 } })).toBe(false)
  })
})

describe('resolveSchema', () => {
  it('prefers standard schema, then zod, then native', () => {
    const native: ValidationSchema<number> = { validate: (d) => ({ success: true, value: d as number }) }
    expect(resolveSchema(native).validate(5)).toEqual({ success: true, value: 5 })
    expect(resolveSchema(z.string()).validate('x')).toEqual({ success: true, value: 'x' })
    const zodLike: ZodLikeSchema<string> = { safeParse: (d) => ({ success: true, data: d as string }) }
    expect(resolveSchema(zodLike).validate('y')).toEqual({ success: true, value: 'y' })
  })

  it('throws on an unrecognised schema', () => {
    expect(() => resolveSchema({} as any)).toThrow(ValidationError)
  })
})

describe('Validator', () => {
  const validator = Validator.create()

  it('validate returns a normalised result', () => {
    expect(validator.validate(z.number(), 3)).toEqual({ success: true, value: 3 })
    expect(validator.validate(z.number(), 'x').success).toBe(false)
  })

  it('assert returns the value or throws ValidationError with issues', () => {
    expect(validator.assert(UserSchema, { name: 'Bob', age: 30 })).toEqual({ name: 'Bob', age: 30 })
    try {
      validator.assert(UserSchema, { name: '', age: 0 })
      expect.unreachable()
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.issues.length).toBeGreaterThan(0)
    }
  })

  it('isValid returns a boolean', () => {
    expect(validator.isValid(z.string(), 'a')).toBe(true)
    expect(validator.isValid(z.string(), 1)).toBe(false)
  })
})
