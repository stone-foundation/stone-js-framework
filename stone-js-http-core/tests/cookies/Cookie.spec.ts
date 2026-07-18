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

  it('should serialize and sign the cookie value', () => {
    const cookie = Cookie.create('test', 'value')
    const secret = '0123456789abcdef0123456789abcdef'
    const serialized = cookie.serialize(secret)
    expect(serialized).toContain(`test=${encodeURIComponent('$$s$$:')}`)
  })

  it('should serialize and sign the cookie object value', () => {
    const cookie = Cookie.create('test', { key: 'value' })
    const secret = '0123456789abcdef0123456789abcdef'
    const serialized = cookie.serialize(secret)
    expect(serialized).toContain(`test=${encodeURIComponent('$$s$$:')}`)
  })
})
