import { Cookie } from '../../src/cookies/Cookie'
import { CookieCollection } from '../../src/cookies/CookieCollection'
import { CookieOptions, CookieSameSite } from '../../src/declarations'

/**
 * Unit tests for the CookieCollection class.
 */
describe('CookieCollection', () => {
  const mockOptions: CookieOptions = { path: '/', secure: true }
  const mockCookieString = 'test=value; anotherTest=anotherValue'

  it('should create a CookieCollection instance', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    expect(collection).toBeInstanceOf(CookieCollection)
  })

  it('should add a cookie to the collection', () => {
    const mockDocument = { cookie: '' } as any
    const collection = CookieCollection.create(undefined, mockOptions, mockDocument)
    collection.add('newCookie', 'newValue')
    expect(collection.has('newCookie')).toBe(true)
    expect(mockDocument.cookie).toContain('newCookie=newValue')
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
    collection.remove('test')
    expect(collection.has('test')).toBe(false)
  })

  it('should remove a cookie forcefully from the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    collection.remove('test')
    expect(collection.get('test')?.value).toBeFalsy()
  })

  it('should return all cookies in the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    expect(collection.all().length).toBeGreaterThan(0)
  })

  it('should clear all cookies from the collection', () => {
    const collection = CookieCollection.create(mockCookieString, mockOptions)
    collection.clear()
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

  it('should set options for all cookies in the collection', () => {
    const collection = CookieCollection.create(mockCookieString, {})
    collection.setOptions(mockOptions)
    // @ts-expect-error Testing private property
    collection.cookies.forEach((cookie) => {
      expect((cookie).options.secure).toBe(true)
    })
  })

  it('should deserialize a signed and serialized value', () => {
    const value = { key: 'value' }
    const cookie = Cookie.create('test', value, { sameSite: CookieSameSite.None })
    const mockDocument = { cookie: cookie.serialize() } as any
    const collection = CookieCollection.create(undefined, {}, mockDocument)
    expect(collection.get('test')?.value).toEqual(value)
  })
})
