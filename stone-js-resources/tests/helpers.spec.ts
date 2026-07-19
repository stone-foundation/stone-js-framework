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
    expect(contextFromEvent(event, { self: true })).toEqual({ self: true, fields: ['id', 'name'], include: ['posts'] })
  })

  it('contextFromEvent yields undefined for empty params', () => {
    const event = { get: (_k: string, fb?: unknown) => fb as any }
    expect(contextFromEvent(event)).toEqual({ fields: undefined, include: undefined })
  })
})
