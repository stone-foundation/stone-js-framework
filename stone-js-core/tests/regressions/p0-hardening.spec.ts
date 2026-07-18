import { describe, it, expect, vi } from 'vitest'
import { Event } from '../../src/events/Event'
import { mergeBlueprints, isEmpty } from '../../src/utils'
import { EventEmitter } from '../../src/events/EventEmitter'
import { getMetadata, getBlueprint, removeMetadata, setClassMetadata } from '../../src/decorators/Metadata'

/**
 * Behavioral regression tests for the P0 hardening pass (2026-07-17).
 * Each test pins a contract that the previous implementation silently violated.
 * See stone-js-core/RAPPORT-AUDIT.md for the numbered defects.
 */

class TestEvent extends Event {
  static create (options: any): TestEvent { return new TestEvent(options) }
  constructor (options: any) { super(options) }
}

describe('P0 — mergeBlueprints preserves special objects (defect 1)', () => {
  it('keeps Date / Map / Set / RegExp by reference instead of flattening to {}', () => {
    const date = new Date('2026-07-17T00:00:00.000Z')
    const map = new Map([['k', 1]])
    const set = new Set([1, 2, 3])
    const regex = /abc/g

    const merged = mergeBlueprints(
      { stone: {} } as any,
      { stone: {}, a: { date }, b: { map }, c: { set }, d: { regex } } as any
    ) as any

    expect(merged.a.date).toBeInstanceOf(Date)
    expect(merged.a.date.getTime()).toBe(date.getTime())
    expect(merged.b.map).toBeInstanceOf(Map)
    expect(merged.b.map.get('k')).toBe(1)
    expect(merged.c.set).toBeInstanceOf(Set)
    expect(merged.c.set.has(2)).toBe(true)
    expect(merged.d.regex).toBeInstanceOf(RegExp)
  })

  it('still deep-merges plain nested objects', () => {
    const merged = mergeBlueprints(
      { stone: {}, nested: { a: 1, keep: true } } as any,
      { stone: {}, nested: { b: 2 } } as any
    ) as any
    expect(merged.nested).toEqual({ a: 1, keep: true, b: 2 })
  })
})

describe('P0 — Event.clone deep-copies metadata (defect 4)', () => {
  it('does not leak clone metadata mutations back into the original', () => {
    const original = TestEvent.create({ type: 'test', metadata: { user: { id: 1 } } })
    const clone = original.clone()

    clone.setMetadataValue('user.id', 999)
    clone.setMetadataValue('added', true)

    expect(original.get('user.id')).toBe(1)
    expect(original.get('added')).toBeUndefined()
    expect(clone.get('user.id')).toBe(999)
  })
})

describe('P0 — EventEmitter (defects 3 & 12)', () => {
  it('invokes listeners even when emit is called without a payload', async () => {
    const emitter = EventEmitter.create()
    const handler = vi.fn()
    emitter.on('ready', handler)

    await emitter.emit('ready')

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('off() removes only the given handler and does not create empty entries', async () => {
    const emitter = EventEmitter.create()
    const a = vi.fn()
    const b = vi.fn()
    emitter.on('evt', a).on('evt', b)

    emitter.off('evt', a)
    await emitter.emit('evt', { type: 'evt' })

    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('off() on an unknown event is a no-op (no phantom splice)', () => {
    const emitter = EventEmitter.create()
    expect(() => emitter.off('nope', vi.fn())).not.toThrow()
  })

  it('once() fires exactly once', async () => {
    const emitter = EventEmitter.create()
    const handler = vi.fn()
    emitter.once('boot', handler)

    await emitter.emit('boot', { type: 'boot' })
    await emitter.emit('boot', { type: 'boot' })

    expect(handler).toHaveBeenCalledTimes(1)
  })
})

describe('P0 — Metadata primitives (defect 7)', () => {
  it('getMetadata returns the fallback when the class has other metadata but not the key', () => {
    @(setClassMetadata('present', 'yes') as any)
    class Decorated {}

    expect(getMetadata(Decorated, 'present')).toBe('yes')
    expect(getMetadata(Decorated as any, 'absent', 'fallback')).toBe('fallback')
  })

  it('getBlueprint returns the fallback when a decorated class has no blueprint key', () => {
    @(setClassMetadata('present', 'yes') as any)
    class Decorated {}

    const fallback = { stone: {} }
    expect(getBlueprint(Decorated as any, fallback)).toBe(fallback)
  })

  it('removeMetadata never mutates a parent class metadata via the prototype chain', () => {
    @(setClassMetadata('shared', 'parent-value') as any)
    class Parent {}
    class Child extends Parent {} // undecorated: inherits Parent's metadata object

    removeMetadata(Child as any, 'shared')

    // Parent must keep its metadata intact.
    expect(getMetadata(Parent as any, 'shared')).toBe('parent-value')
  })
})

describe('P0 — isEmpty semantics are consistent (defect 13)', () => {
  it('treats 0, false and empty string as empty; non-empty values as not empty', () => {
    expect(isEmpty(0)).toBe(true)
    expect(isEmpty(false)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty('x')).toBe(false)
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty({ a: 1 })).toBe(false)
  })
})

describe('P0 — EventEmitter error isolation (async listeners)', () => {
  it('runs all listeners even if one rejects, then throws', async () => {
    const emitter = EventEmitter.create()
    const a = vi.fn()
    const b = vi.fn(async () => { throw new Error('boom') })
    const c = vi.fn()
    emitter.on('evt', a).on('evt', b).on('evt', c)

    await expect(emitter.emit('evt', { type: 'evt' })).rejects.toThrow('boom')
    expect(a).toHaveBeenCalled()
    expect(c).toHaveBeenCalled() // ran despite b failing
  })

  it('aggregates multiple listener failures', async () => {
    const emitter = EventEmitter.create()
    emitter.on('evt', () => { throw new Error('e1') })
    emitter.on('evt', async () => { throw new Error('e2') })
    await expect(emitter.emit('evt', { type: 'evt' })).rejects.toThrow(AggregateError)
  })
})
