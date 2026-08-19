import { isSchemaLike, metadataKeyFor, readSource, toValidationRules } from '../src/sources'

describe('isSchemaLike', () => {
  it('recognises a schema by what it can do, not by what it is', () => {
    // This is what lets `validation: Schema` and `validation: { body: Schema }` share one option
    // without ambiguity, across every engine Stone.js accepts.
    expect(isSchemaLike({ validate: () => {} })).toBe(true)        // native
    expect(isSchemaLike({ parse: () => {}, safeParse: () => {} })).toBe(true) // zod-like
    expect(isSchemaLike({ '~standard': {} })).toBe(true)           // standard schema
    expect(isSchemaLike(() => {})).toBe(true)
  })

  it('treats anything else as a map of sources', () => {
    expect(isSchemaLike({ body: { validate: () => {} } })).toBe(false)
    expect(isSchemaLike(null)).toBe(false)
    expect(isSchemaLike('createUser')).toBe(false)
  })
})

describe('toValidationRules', () => {
  it('reads a bare schema as the body', () => {
    const schema = { validate: () => ({ success: true as const, value: 1 }) }
    expect(toValidationRules(schema)).toEqual({ body: schema })
  })

  it('leaves a map alone', () => {
    const rules = { query: { validate: () => ({ success: true as const, value: 1 }) } }
    expect(toValidationRules(rules)).toBe(rules)
  })
})

describe('readSource', () => {
  it('reads whole sources, not one field of them', () => {
    // `event.get('body')` asks for a field NAMED body inside the body, a different question.
    const event: any = { body: { a: 1 }, params: { id: '7' }, get: () => 'wrong' }
    expect(readSource(event, 'body')).toEqual({ a: 1 })
    expect(readSource(event, 'params')).toEqual({ id: '7' })
  })

  it('prefers an explicit body accessor when the context exposes one', () => {
    const event: any = { body: { a: 1 }, getBody: () => ({ a: 2 }), get: () => undefined }
    expect(readSource(event, 'body')).toEqual({ a: 2 })
  })

  it('normalises a URLSearchParams query into what a schema can parse', () => {
    const event: any = { query: new URLSearchParams('page=2&q=x'), get: () => undefined }
    expect(readSource(event, 'query')).toEqual({ page: '2', q: 'x' })
  })

  it('falls back to the event for any other source, so other contexts validate too', () => {
    // A CLI argument set or a message attribute is just another source.
    const event: any = { get: (key: string) => (key === 'argv' ? ['--force'] : undefined) }
    expect(readSource(event, 'argv')).toEqual(['--force'])
    expect(readSource({ get: () => undefined } as any, 'query')).toBeUndefined()
    expect(readSource({ get: () => ({ id: 1 }) } as any, 'params')).toEqual({ id: 1 })
  })
})

describe('metadataKeyFor', () => {
  it('is predictable, which is the point', () => {
    expect(metadataKeyFor('body')).toBe('validatedBody')
    expect(metadataKeyFor('query')).toBe('validatedQuery')
    expect(metadataKeyFor('params')).toBe('validatedParams')
  })
})
