import { z } from 'zod'
import { isZodSchema, toJsonSchema } from '../src/toJsonSchema'

describe('isZodSchema', () => {
  it('detects zod schemas and rejects plain objects', () => {
    expect(isZodSchema(z.string())).toBe(true)
    expect(isZodSchema({ type: 'string' })).toBe(false)
    expect(isZodSchema(undefined)).toBe(false)
  })
})

describe('toJsonSchema', () => {
  it('converts a zod schema to JSON Schema', () => {
    const json = toJsonSchema(z.object({ id: z.string() }))
    expect(json.type).toBe('object')
    expect((json.properties as any).id.type).toBe('string')
    expect(json.required).toContain('id')
  })

  it('passes a raw JSON Schema through untouched', () => {
    const raw = { type: 'integer', minimum: 0 }
    expect(toJsonSchema(raw)).toBe(raw)
  })
})
