import { sign } from 'cookie-signature'
import { CookieError } from '../../src/errors/CookieError'
import { signCookieValue, unsignCookieValue, isSignableCookieSecret, MIN_COOKIE_SECRET_LENGTH } from '../../src/cookies/utils'

// A secret strong enough to sign (>= 32 chars).
const STRONG_SECRET = '0123456789abcdef0123456789abcdef'

/**
 * Unit tests for the Cookie class.
 */
describe('Utils', () => {
  it('should sign the cookie value with a strong secret', () => {
    const signedValue = signCookieValue('value', STRONG_SECRET)
    expect(signedValue).toMatch(/\$\$s\$\$:.*$/)
  })

  it('should throw error if trying to sign non-string value', () => {
    expect(() => signCookieValue({}, STRONG_SECRET)).toThrow(CookieError)
  })

  it('should throw error if trying to sign a value with no secret', () => {
    // @ts-expect-error Testing for error
    expect(() => signCookieValue('value', undefined)).toThrow(CookieError)
  })

  it('should throw error if trying to sign with an empty or weak secret', () => {
    expect(() => signCookieValue('value', '')).toThrow(CookieError)
    expect(() => signCookieValue('value', 'too-short')).toThrow(CookieError)
  })

  it('should throw error if trying to sign an already signed value', () => {
    expect(() => signCookieValue('$$s$$:value', STRONG_SECRET)).toThrow(CookieError)
  })

  it('should unsign the cookie value', () => {
    const signedValue = `$$s$$:${sign('value', STRONG_SECRET)}`
    const unsignedValue = unsignCookieValue(signedValue, STRONG_SECRET)
    expect(unsignedValue).toBe('value')
  })

  it('should throw error if trying to unsign non-signed value', () => {
    expect(() => unsignCookieValue(undefined, STRONG_SECRET)).toThrow(CookieError)
  })

  it('should throw error if trying to unsign a non-signed value', () => {
    expect(() => unsignCookieValue('value', STRONG_SECRET)).toThrow(CookieError)
  })

  it('should throw error if trying to unsign with an empty or weak secret', () => {
    expect(() => unsignCookieValue('$$s$$:value', '')).toThrow(CookieError)
    expect(() => unsignCookieValue('$$s$$:value', 'short')).toThrow(CookieError)
  })

  it('should throw error if trying to unsign a value with no secret', () => {
    // @ts-expect-error Testing for error
    expect(() => unsignCookieValue('$$s$$:value', undefined)).toThrow(CookieError)
  })

  it('isSignableCookieSecret validates length', () => {
    expect(isSignableCookieSecret(STRONG_SECRET)).toBe(true)
    expect(isSignableCookieSecret('short')).toBe(false)
    expect(isSignableCookieSecret('')).toBe(false)
    expect(isSignableCookieSecret(undefined)).toBe(false)
    expect(MIN_COOKIE_SECRET_LENGTH).toBe(32)
  })
})
