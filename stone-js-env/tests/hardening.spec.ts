import { describe, it, expect, beforeEach } from 'vitest'
import * as Env from '../src/Env'

describe('Env — hardening', () => {
  beforeEach(() => {
    Env.clearCache()
    process.env.H_PORT = '8080'
    delete process.env.H_MISSING
    delete process.env.H_FLAG
  })

  it('does not poison the cache across types (string then number)', () => {
    expect(Env.getString('H_PORT')).toBe('8080')
    // Same key, different accessor type must return the coerced number, not the cached string.
    expect(Env.getNumber('H_PORT')).toBe(8080)
    expect(typeof Env.getNumber('H_PORT')).toBe('number')
  })

  it('getNumber returns the default (not 0) when the variable is absent', () => {
    expect(Env.getNumber('H_MISSING', { optional: true })).toBeUndefined()
    expect(Env.getNumber('H_MISSING', 3000)).toBe(3000)
  })

  it('getBoolean honors the default when the variable is absent', () => {
    expect(Env.getBoolean('H_MISSING', { optional: true })).toBeUndefined()
    expect(Env.getBoolean('H_MISSING', true)).toBe(true)
  })

  it('masks the raw value in error messages (no secret leakage)', () => {
    process.env.H_SECRET = 'super-secret-password'
    try {
      Env.getNumber('H_SECRET')
      throw new Error('should have thrown')
    } catch (e: any) {
      expect(e.message).not.toContain('super-secret-password')
      expect(e.message).toContain('chars)')
    }
  })

  it('normalizeOptions does not mutate the caller options object', () => {
    const opts: any = { default: 5 }
    Env.getNumber('H_MISSING', opts)
    expect(Object.prototype.hasOwnProperty.call(opts, 'optional')).toBe(false)
  })

  it('getUrl returns its default when the variable is absent', () => {
    expect(Env.getUrl('H_MISSING', 'http://localhost')).toBe('http://localhost')
  })

  it('getHost returns its default when the variable is absent', () => {
    expect(Env.getHost('H_MISSING', '127.0.0.1')).toBe('127.0.0.1')
  })

  it('masks a very short invalid value as ** in error messages', () => {
    process.env.H_URL = 'ab'
    expect(() => Env.getUrl('H_URL')).toThrow(/\*\*/)
    delete process.env.H_URL
  })
})
