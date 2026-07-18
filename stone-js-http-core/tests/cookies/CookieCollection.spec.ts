import { sign } from 'cookie-signature'
import { CookieOptions } from '../../src/declarations'
import { CookieError } from '../../src/errors/CookieError'
import { CookieCollection } from '../../src/cookies/CookieCollection'

/**
 * Unit tests for the CookieCollection class.
 */
describe('CookieCollection', () => {
  const mockSecret = '0123456789abcdef0123456789abcdef'
  const mockOptions: CookieOptions = { path: '/', secure: true }
  const mockCookieString = 'test=value; anotherTest=anotherValue'

  it('should create a CookieCollection instance', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions, mockSecret)
    expect(collection).toBeInstanceOf(CookieCollection)
  })

  it('should add a cookie to the collection', () => {
    const collection = CookieCollection.create(undefined, mockOptions)
    collection.add('newCookie', 'newValue')
    expect(collection.has('newCookie')).toBe(true)
    expect(collection.getValue<string>('newCookie')).toBe('newValue')
    expect(collection.getValue<string>('newCookie2', 'default')).toBe('default')
  })

  it('should update an existing cookie in the collection', () => {
    const collection = CookieCollection.create('updateCookie=oldValue', mockOptions)
    collection.update('updateCookie', 'newValue')
    const cookie = collection.get('updateCookie')
    expect(cookie?.value).toBe('newValue')
  })

  it('should return undefined for a non-existing cookie', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    expect(collection.get('nonExistingCookie')).toBeUndefined()
  })

  it('should remove a cookie from the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    collection.remove('test', {}, true)
    expect(collection.has('test')).toBe(false)
  })

  it('should remove a cookie forcefully from the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    collection.remove('test')
    expect(collection.get('test')?.value).toBeFalsy()
  })

  it('should return all cookies in the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    const allCookies = collection.all()
    expect(Object.keys(allCookies)).toContain('test')
    expect(Object.keys(allCookies)).toContain('anotherTest')
  })

  it('should serialize all cookies in the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions, mockSecret)
    const serializedCookies = collection.all(true)
    expect(serializedCookies.length).toBeGreaterThan(0)
    expect(serializedCookies[0]).toContain('test=')
  })

  it('should clear all cookies from the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    collection.clear(true)
    expect(collection.isEmpty()).toBe(true)
  })

  it('should clear all cookies forcefully from the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    collection.clear()
    expect(collection.get('test')?.value).toBeFalsy()
  })

  it('should set secure flag for all cookies in the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    collection.secure(true)
    // @ts-expect-error Testing private property
    collection.cookies.forEach((cookie) => {
      expect((cookie).options.secure).toBe(true)
    })
  })

  it('should set a secret for signing and unsigning cookies', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    collection.setSecret('0123456789abcdef0123456789abcdef-new')
    // @ts-expect-error Testing private property
    expect(collection.secret).toBe('0123456789abcdef0123456789abcdef-new')
  })

  it('should set options for all cookies in the collection', () => {
    const collection = CookieCollection.create(mockCookieString, {})
    collection.setOptions(mockOptions)
    // @ts-expect-error Testing private property
    collection.cookies.forEach((cookie) => {
      expect((cookie).options.secure).toBe(true)
    })
  })

  it('should deserialize a signed and serialized value', () => {
    const secret = '0123456789abcdef0123456789abcdef'
    const value = { key: 'value' }
    const collection = CookieCollection.create()
    // @ts-expect-error Testing private method
    const newCookie = collection.deserializeCookieValue('test', `$$s$$:${sign(`$$j$$:${JSON.stringify(value)}`, secret)}`, {}, secret)
    expect(newCookie.value).toEqual(value)
  })

  it('should throw error if trying to deserialize modified-signed value', () => {
    const collection = CookieCollection.create()
    // @ts-expect-error Testing private method
    expect(() => collection.deserializeCookieValue('test', '$$s$$:value.djdjdkdkd', {}, '0123456789abcdef0123456789abcdef')).toThrow(CookieError)
  })
})
