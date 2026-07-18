import { describe, it, expect } from 'vitest'
import { Container } from '../src/Container'
import { ContainerError } from '../src/errors/ContainerError'

describe('Container — proxy safety', () => {
  it('is safe to await (then access returns undefined, does not throw)', async () => {
    const c: any = Container.create()
    expect(c.then).toBeUndefined()
    await expect(Promise.resolve(c)).resolves.toBeDefined()
  })

  it('is safe to JSON.stringify / inspect (system props return undefined)', () => {
    const c: any = Container.create()
    expect(c.toJSON).toBeUndefined()
    expect(c[Symbol.toPrimitive]).toBeUndefined()
    expect(() => JSON.stringify({ c })).not.toThrow()
  })

  it('still fails fast on genuinely unknown service access', () => {
    const c: any = Container.create()
    expect(() => c.unknownService).toThrow(ContainerError)
  })
})

describe('Container — factory detection', () => {
  it('calls a plain function factory (not new-ed) via autoBinding', () => {
    const c = Container.create()
    function factory (): { tag: string } { return { tag: 'factory' } }
    c.autoBinding('svc', factory as any)
    expect((c.make('svc')).tag).toBe('factory')
  })

  it('instantiates a real ES class via autoBinding', () => {
    const c = Container.create()
    class Service { readonly tag = 'class' }
    c.autoBinding('svc', Service as any)
    expect((c.make('svc')).tag).toBe('class')
  })
})

describe('Container — singleton resolving to undefined', () => {
  it('resolves the resolver only once even when the value is undefined', () => {
    const c = Container.create()
    let calls = 0
    c.singleton('maybe', () => { calls++; return undefined as any })
    c.make('maybe'); c.make('maybe'); c.make('maybe')
    expect(calls).toBe(1)
  })
})

describe('Container — circular dependency chain', () => {
  it('reports the full resolution chain', () => {
    const c = Container.create()
    c.singleton('a', (ct: any) => ct.make('b'))
    c.singleton('b', (ct: any) => ct.make('a'))
    try {
      c.make('a')
      throw new Error('should have thrown')
    } catch (e: any) {
      expect(e).toBeInstanceOf(ContainerError)
      expect(e.message).toContain('a → b → a')
    }
  })
})

describe('Container — key labels in the circular chain', () => {
  it('labels function/class and symbol keys in the resolution chain', () => {
    const c = Container.create()
    class ServiceA { readonly tag = 'a' }
    const symB = Symbol('serviceB')
    c.singleton(ServiceA as any, (ct: any) => ct.make(symB))
    c.singleton(symB as any, (ct: any) => ct.make(ServiceA))
    try {
      c.make(ServiceA as any)
      throw new Error('should have thrown')
    } catch (e: any) {
      expect(e).toBeInstanceOf(ContainerError)
      expect(e.message).toContain('ServiceA')
      expect(e.message).toContain('Symbol(serviceB)')
    }
  })
})

describe('Container — anonymous-function and object keys in the chain', () => {
  it('labels an anonymous function as "anonymous" and an object key by its constructor', () => {
    const c = Container.create()
    const anon = function (): void {}
    Object.defineProperty(anon, 'name', { value: '' })
    const objKey = { tag: 'k' }
    c.singleton(anon as any, (ct: any) => ct.make(objKey))
    c.singleton(objKey as any, (ct: any) => ct.make(anon))
    try {
      c.make(anon as any)
      throw new Error('should have thrown')
    } catch (e: any) {
      expect(e).toBeInstanceOf(ContainerError)
      expect(e.message).toContain('anonymous')
      expect(e.message).toContain('Object')
    }
  })

  it('labels a null-prototype object key as "Object"', () => {
    const c = Container.create()
    const nullProto = Object.create(null)
    const other = { tag: 'o' }
    c.singleton(nullProto, (ct: any) => ct.make(other))
    c.singleton(other as any, (ct: any) => ct.make(nullProto))
    try {
      c.make(nullProto)
      throw new Error('should have thrown')
    } catch (e: any) {
      expect(e).toBeInstanceOf(ContainerError)
      expect(e.message).toContain('Object') // null-proto object -> no constructor -> 'Object'
    }
  })
})

describe('Container — real class detection', () => {
  it('detects a native class (class keyword) as a class', () => {
    const c = Container.create()
    class NativeService { doWork (): string { return 'native' } }
    c.autoBinding('svc', NativeService as any)
    const resolved: any = c.make('svc')
    expect(resolved.doWork()).toBe('native')
  })

  it('treats an arrow factory (no prototype) as a factory', () => {
    const c = Container.create()
    c.autoBinding('svc', (() => ({ tag: 'arrow' })) as any)
    expect(c.make('svc')).toEqual({ tag: 'arrow' })
  })

  it('treats a function whose prototype is null as a factory', () => {
    const c = Container.create()
    function weird (): { tag: string } { return { tag: 'null-proto' } }
    ;(weird as any).prototype = null
    c.autoBinding('svc', weird as any)
    expect(c.make('svc')).toEqual({ tag: 'null-proto' })
  })
})

describe('Container — aliasing applied even when already bound', () => {
  it('applies the alias on a second autoBinding of a bound key', () => {
    const c = Container.create()
    c.instance('svc', { v: 1 })
    c.autoBinding('svc', { v: 2 } as any, true, 'svcAlias')
    expect(c.make('svcAlias')).toEqual({ v: 1 })
  })
})

describe('Container — ES5-safe class detection', () => {
  it('detects a transpiled-style class (function with prototype methods) as a class', () => {
    const c = Container.create()
    // Simulate an ES5-transpiled class: a function whose prototype carries methods.
    function TranspiledService (this: any): void { this.tag = 'transpiled' }
    TranspiledService.prototype.doWork = function (): string { return 'ok' }
    c.autoBinding('svc', TranspiledService as any)
    const resolved: any = c.make('svc')
    expect(resolved.tag).toBe('transpiled')
    expect(resolved.doWork()).toBe('ok')
  })

  it('treats a bare factory function (empty prototype) as a factory', () => {
    const c = Container.create()
    function factory (): { tag: string } { return { tag: 'factory' } }
    c.autoBinding('svc', factory as any)
    expect((c.make('svc')).tag).toBe('factory')
  })
})
