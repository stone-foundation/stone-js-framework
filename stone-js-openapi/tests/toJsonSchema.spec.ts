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

describe('a schema engine newer than the converter', () => {
  it('documents a Zod 4 schema instead of documenting nothing', async () => {
    // Verified against the real library, not a stand-in: the external converter reads Zod 3's `_def`,
    // a Zod 4 schema still has a `_def` holding something else, and the conversion returned `{}`. An
    // empty object is a valid JSON Schema meaning "anything", which is why nothing ever failed: every
    // body and every response silently became unconstrained.
    const { z } = await import('zod4')
    const schema = z.object({ id: z.number(), name: z.string() })

    const json: any = toJsonSchema(schema as any)

    expect(json.type).toBe('object')
    expect(Object.keys(json.properties)).toEqual(['id', 'name'])
    expect(json.required).toEqual(['id', 'name'])
  })

  it('asks for the dialect the document declares', async () => {
    // The document says OpenAPI 3.0, where a nullable string is `nullable: true` and not an `anyOf`
    // with a null branch. Tools reject the wrong dialect.
    const { z } = await import('zod4')

    const json: any = toJsonSchema(z.object({ tag: z.string().nullable() }) as any)

    expect(json.properties.tag).toMatchObject({ type: 'string', nullable: true })
    expect(json.$schema).toBeUndefined()
  })

  it('accepts any schema that can describe itself', async () => {
    // The contract is a method, not a library: an engine nobody has written yet documents itself the
    // same way.
    const own = { toJSONSchema: () => ({ type: 'string', $schema: 'https://example.test/draft' }) }

    expect(toJsonSchema(own as any)).toEqual({ type: 'string' })
  })

  it('still converts a Zod 3 schema through the converter', async () => {
    const { z } = await import('zod')

    const json: any = toJsonSchema(z.object({ id: z.number() }) as any)

    expect(json.type).toBe('object')
    expect(json.properties.id.type).toBe('number')
  })
})
