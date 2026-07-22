import { describe, it, expect } from 'vitest'
import { Config } from '../src/Config'

describe('Config — special objects preserved on merge (no flattening)', () => {
  it('keeps Date / Map / Set / RegExp instead of flattening to {}', () => {
    const c = Config.create<any>({ a: new Date('2020-01-01'), m: new Map(), s: new Set([1]) })
    c.set({ a: new Date('2026-07-18'), m: new Map([['k', 1]]), s: new Set([2, 3]) })
    expect(c.get('a')).toBeInstanceOf(Date)
    expect((c.get('a') as Date).getFullYear()).toBe(2026)
    expect(c.get('m')).toBeInstanceOf(Map)
    expect((c.get('m') as Map<string, number>).get('k')).toBe(1)
    expect(c.get('s')).toBeInstanceOf(Set)
  })

  it('still deep-merges plain nested objects', () => {
    const c = Config.create<any>({ nested: { a: 1, keep: true } })
    c.set({ nested: { b: 2 } })
    expect(c.get('nested')).toEqual({ a: 1, keep: true, b: 2 })
  })
})

describe('Config — prototype pollution guard (internal, not dependency-based)', () => {
  it('blocks __proto__ / constructor / prototype writes (dotted, array and object forms)', () => {
    const c = Config.create<any>()
    c.set('__proto__.polluted', 'x')
    c.set('constructor.prototype.polluted2', 'y')
    c.set(['__proto__', 'polluted3'], 'z')
    c.set({ __proto__: { polluted4: 'w' } } as any)
    expect(({} as any).polluted).toBeUndefined()
    expect(({} as any).polluted2).toBeUndefined()
    expect(({} as any).polluted3).toBeUndefined()
    expect(({} as any).polluted4).toBeUndefined()
  })

  it('blocks pollution from fromJson payloads at write time', () => {
    const c = Config.fromJson<any>('{"safe":1}')
    c.set('__proto__.x', 'polluted')
    expect(({} as any).x).toBeUndefined()
    expect(c.get('safe')).toBe(1)
  })
})

describe('Config — immutability of all()', () => {
  it('returns a defensive clone; mutating it does not affect the store', () => {
    const c = Config.create<any>({ nested: { a: 1 } })
    const snapshot = c.all()
    snapshot.nested.a = 999
    snapshot.added = true
    expect(c.get('nested.a')).toBe(1)
    expect(c.has('added')).toBe(false)
  })
})

describe('Config — firstMatch fallback', () => {
  it('returns the fallback when no key matches', () => {
    const c = Config.create<any>({ a: 1 })
    expect(c.firstMatch(['x', 'y'], 'fallback')).toBe('fallback')
    expect(c.firstMatch<number | string>(['x', 'a'], 'fallback')).toBe(1)
  })
})

describe('Config — bracket & dotted path notation', () => {
  it('reads array indices via bracket notation and mixed paths', () => {
    const c = Config.create<any>({ flags: ['a', 'b'], user: { roles: [{ name: 'admin' }] } })
    expect(c.get('flags[1]')).toBe('b')
    expect(c.get('user.roles[0].name')).toBe('admin')
    expect(c.has('flags[0]')).toBe(true)
  })
})

describe('utils — setPath / deepMerge branches', () => {
  it('setPath reuses an existing intermediate object instead of recreating it', async () => {
    const { setPath } = await import('../src/utils')
    const obj: any = { a: { b: 1 } }
    setPath(obj, 'a.c', 2)
    expect(obj).toEqual({ a: { b: 1, c: 2 } }) // existing `a` preserved
  })

  it('setPath creates missing intermediates (undefined, null and non-object)', async () => {
    const { setPath } = await import('../src/utils')
    const fresh: any = {}
    setPath(fresh, 'x.y.z', 1)
    expect(fresh).toEqual({ x: { y: { z: 1 } } }) // undefined -> created

    const nulled: any = { x: null }
    setPath(nulled, 'x.y', 2)
    expect(nulled).toEqual({ x: { y: 2 } }) // null -> replaced

    const scalar: any = { x: 5 }
    setPath(scalar, 'x.y', 3)
    expect(scalar).toEqual({ x: { y: 3 } }) // non-object -> replaced
  })

  it('deepMerge concatenates two arrays', async () => {
    const { deepMerge } = await import('../src/utils')
    expect(deepMerge([1, 2], [3, 4])).toEqual([1, 2, 3, 4])
  })

  it('deepMerge recurses into array-valued keys (concatenating them)', async () => {
    const { deepMerge } = await import('../src/utils')
    expect(deepMerge({ tags: ['a'] }, { tags: ['b'] })).toEqual({ tags: ['a', 'b'] })
  })

  it('cloneValue skips prototype-polluting own keys', async () => {
    const { cloneValue } = await import('../src/utils')
    const evil: any = JSON.parse('{"safe":1,"__proto__":{"polluted":true}}')
    const clone: any = cloneValue(evil)
    expect(clone.safe).toBe(1)
    expect(({} as any).polluted).toBeUndefined()
  })

  it('deepMerge skips prototype-polluting keys from the source', async () => {
    const { deepMerge } = await import('../src/utils')
    const evil: any = JSON.parse('{"a":1,"__proto__":{"polluted":true}}')
    const out: any = deepMerge({ a: 0 }, evil)
    expect(out.a).toBe(1)
    expect(({} as any).polluted).toBeUndefined()
  })

  it('setPath ignores a prototype-polluting final segment', async () => {
    const { setPath } = await import('../src/utils')
    const obj: any = {}
    setPath(obj, 'a.__proto__', { polluted: true })
    expect(({} as any).polluted).toBeUndefined()
  })

  it('getPath and hasPath stop at a non-object intermediate', async () => {
    const { getPath, hasPath } = await import('../src/utils')
    expect(getPath({ a: 5 }, 'a.b', 'fallback')).toBe('fallback')
    expect(hasPath({ a: 5 }, 'a.b')).toBe(false)
  })

  it('deepMerge overwrites (clones) when target/source kinds differ', async () => {
    const { deepMerge } = await import('../src/utils')
    // object-vs-scalar and array-vs-scalar both fall back to cloning the source value.
    expect(deepMerge({ o: { a: 1 }, arr: [1] }, { o: 2, arr: 3 })).toEqual({ o: 2, arr: 3 })
  })
})
