import { stripUndefined, only, except, applyFields, contextFromEvent } from '../src/helpers'

describe('helpers', () => {
  it('stripUndefined drops undefined values', () => {
    expect(stripUndefined({ a: 1, b: undefined, c: null })).toEqual({ a: 1, c: null })
  })

  it('only keeps the requested keys (ignoring absent ones)', () => {
    expect(only({ a: 1, b: 2, c: 3 }, ['a', 'c', 'z'])).toEqual({ a: 1, c: 3 })
  })

  it('except drops the given keys', () => {
    expect(except({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 })
  })

  it('applyFields strips undefined and narrows to fields when provided', () => {
    expect(applyFields({ a: 1, b: undefined, c: 3 })).toEqual({ a: 1, c: 3 })
    expect(applyFields({ a: 1, b: 2, c: 3 }, ['a', 'b'])).toEqual({ a: 1, b: 2 })
    expect(applyFields({ a: 1 }, [])).toEqual({ a: 1 })
  })

  it('contextFromEvent parses fields/include CSV and merges extra', () => {
    const event = { get: (k: string, fb?: unknown) => ({ fields: 'id, name', include: 'posts' }[k] ?? fb) as any }
    expect(contextFromEvent(event, undefined, { self: true })).toMatchObject({
      self: true, fields: ['id', 'name'], include: ['posts']
    })
  })

  it('contextFromEvent yields undefined for empty params', () => {
    const event: any = { get: (_k: string, fallback?: unknown) => fallback ?? '' }
    const context = contextFromEvent(event)

    expect(context.fields).toBeUndefined()
    expect(context.include).toBeUndefined()
    expect(context.fragment).toBeUndefined()
  })

  it('contextFromEvent carries the event and the principal', () => {
    // A resource deciding what a caller may see needs to know who is asking; before this it had to be
    // told by the handler, which is the plumbing the module exists to remove.
    const event: any = { get: (_k: string, fallback?: unknown) => fallback ?? '', getUser: () => ({ id: 7 }) }
    const context = contextFromEvent(event)

    expect(context.principal).toEqual({ id: 7 })
    expect(context.event).toBe(event)
  })

  it('contextFromEvent reads the parameter names the application configured', () => {
    const event: any = { get: (key: string, fallback?: unknown) => (key === 'only' ? 'summary' : fallback ?? '') }
    const blueprint: any = { get: (key: string, fallback: unknown) => (key === 'stone.resources.params' ? { fragment: 'only' } : fallback) }

    expect(contextFromEvent(event, blueprint).fragment).toBe('summary')
  })
})
