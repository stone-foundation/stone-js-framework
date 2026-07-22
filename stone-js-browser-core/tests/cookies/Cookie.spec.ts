import { Cookie } from '../../src/cookies/Cookie'

/**
 * Unit tests for the Cookie class.
 */
describe('Cookie', () => {
  it('should create a cookie instance', () => {
    const cookie = Cookie.create('test', 'value')
    expect(cookie.name).toBe('test')
    expect(cookie.value).toBe('value')
    expect(cookie.options).toEqual({})
    expect(cookie.getValue<string>()).toBe('value')
  })

  it('should deserialize a valid $$j$$: JSON value', () => {
    const cookie = Cookie.create('test', '$$j$$:{"a":1}')
    expect(cookie.getValue()).toEqual({ a: 1 })
  })

  it('should NOT throw on a malformed $$j$$: value (keeps the raw value)', () => {
    const cookie = Cookie.create('test', '$$j$$:{not valid json')
    expect(cookie.getValue()).toBe('$$j$$:{not valid json')
  })

  it('should set expires', () => {
    const cookie = Cookie.create('test', 'value')
    const expires = new Date()
    cookie.setExpires(expires)
    expect(cookie.options.expires).toBe(expires)
  })

  it('should set secure flag', () => {
    const cookie = Cookie.create('test', 'value')
    cookie.setSecure(true)
    expect(cookie.options.secure).toBe(true)
  })

  it('should serialize the cookie value', () => {
    const cookie = Cookie.create('test', 'value')
    const serialized = cookie.serialize()
    expect(serialized).toContain('test=value')
  })

  it('should serialize the cookie value with URL-encoding', () => {
    const cookie = Cookie.create('test', 'value')
    const serialized = cookie.serialize()
    expect(serialized).toBe(`test=${encodeURIComponent('value')}`)
  })

  it('should serialize the cookie object value', () => {
    const cookie = Cookie.create('test', { key: 'value' })
    const serialized = cookie.serialize()
    expect(serialized).toContain(`test=${encodeURIComponent('$$j$$:')}`)
  })
})
