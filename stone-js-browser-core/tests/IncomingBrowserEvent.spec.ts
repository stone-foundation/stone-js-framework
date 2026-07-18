import { BrowserError } from '../src/errors/BrowserError'
import { CookieCollection } from '../src/cookies/CookieCollection'
import { IncomingBrowserEvent, IncomingBrowserEventOptions } from '../src/IncomingBrowserEvent'

// Mock Symbol.metadata for testing purposes
vi.hoisted(() => {
  globalThis.window = { navigator: { userAgent: 'Mozilla/5.0' } } as any
})

// Mock options for IncomingBrowserEvent
const mockOptions: IncomingBrowserEventOptions = {
  locale: 'en',
  protocol: 'http',
  source: {} as any,
  metadata: { username: 'Jonh' },
  queryString: 'param1=value1&param2=value2',
  url: new URL('http://localhost/test#title'),
  cookies: CookieCollection.create('test=value; anotherTest=anotherValue')
}

// Create an instance of IncomingBrowserEvent for testing

describe('IncomingBrowserEvent', () => {
  let event: IncomingBrowserEvent

  beforeEach(() => {
    event = IncomingBrowserEvent.create(mockOptions)
    vi.clearAllMocks()
  })

  it('should create an instance of IncomingBrowserEvent', () => {
    const event = IncomingBrowserEvent.create({ ...mockOptions, queryString: undefined, cookies: undefined, headers: new Headers() })
    // @ts-expect-error - Invalid router value for testing purposes
    event.setRouteResolver(() => ({ params: { env: 'test' } }))
    // @ts-expect-error - Invalid value for testing purposes
    event.url = { pathname: '%' }
    expect(event.params).toEqual({ env: 'test' })
    expect(event.decodedPathname).toBeUndefined()
    expect(event).toBeInstanceOf(IncomingBrowserEvent)
  })

  it('should correctly invoke getters', () => {
    expect(event.decodedPathname).toBe('/test')
    expect(event.host).toBe('localhost')
    expect(event.hash).toBe('#title')
    expect(event.hostname).toBe('localhost')
    expect(event.userAgent).toBe('Mozilla/5.0')
    expect(event.pathname).toBe('/test')
    expect(event.params).toBeUndefined()
    expect(event.path).toBe('/test')
    expect(event.scheme).toBe('http')
    expect(event.segments).toEqual(['', 'test'])
    expect(event.isSecure).toBe(false)
    expect(event.isMethod('POST')).toBe(false)
    expect(event.uri).toBe('http://localhost/test#title')
    expect(event.getRouteResolver()()).toBeUndefined()
    expect(event.getUserResolver()()).toBeUndefined()
    expect(event.getUser()).toBeUndefined()
    expect(event.getUri()).toBe('/test')
    expect(event.getUri(true)).toBe('http://localhost/test')
    expect(event.uriForPath('/api/v1/test')).toBe('http://localhost/api/v1/test')
    expect(event.query.get('param1')).toBe('value1')
    expect(event.hasCookie('test-cookie')).toBe(false)
    expect(event.getCookie('test-cookie')).toBeUndefined()
    expect(event.setUserResolver(() => ({ name: 'Stone' })).getUser()).toEqual({ name: 'Stone' })
  })

  it('should correctly invoke getters in some edge conditions', () => {
    const event = IncomingBrowserEvent.create({ ...mockOptions, headers: new Headers() })
    // @ts-expect-error - Accessing private property for testing purposes
    event.url = { pathname: '%', href: 'http://localhost/test#title' }
    expect(event.getUri(true)).toBe('http://localhost/')
  })

  it('should generate a valid browser fingerprint', () => {
    const fingerprint = btoa([event.method, event.pathname].join('|'))
    expect(event.fingerprint()).toBe(fingerprint)
    expect(event.getRouteResolver()).toBeInstanceOf(Function)
  })

  describe('get', () => {
    it('should correctly return the value from the path params', () => {
      // @ts-expect-error - Invalid method value for testing purposes
      event.setRouteResolver(() => ({ getParam: () => 'Stone' }))
      expect(event.get('name')).toBe('Stone')
    })

    it('should correctly return the value from the query params', () => {
      const event = IncomingBrowserEvent.create({ ...mockOptions, queryString: '?name=Stone.js' })
      expect(event.get('name')).toBe('Stone.js')
    })

    it('should correctly return the value from the cookies', () => {
      const event = IncomingBrowserEvent.create({ ...mockOptions })
      expect(event.get<string>('test')).toBe('value')
    })

    it('should correctly return the value from the metadata', () => {
      const event = IncomingBrowserEvent.create({ ...mockOptions })
      expect(event.get<Record<string, string>>('username')).toBe('Jonh')
    })
  })

  it('should throw an error on invalid cookie name', () => {
    // @ts-expect-error - Invalid cookie name
    expect(() => event.getCookie(40)).toThrow(BrowserError)
    // @ts-expect-error - Invalid cookie name
    expect(() => event.hasCookie(40)).toThrow(BrowserError)
  })

  it('should throw an error if an invalid URL is provided', () => {
    expect(() => IncomingBrowserEvent.create({ ...mockOptions, url: 'invalid-url' as unknown as URL })).toThrow(BrowserError)
  })

  it('derives the query from url.search when no queryString is provided', () => {
    const event = IncomingBrowserEvent.create({ ...mockOptions, url: new URL('http://localhost/p?a=1&b=2'), queryString: undefined })
    expect(event.query.get('a')).toBe('1')
    expect(event.query.get('b')).toBe('2')
  })

  it('reads userAgent from window, undefined when window is absent', () => {
    vi.stubGlobal('window', { navigator: { userAgent: 'StoneAgent/1.0' } })
    expect(IncomingBrowserEvent.create({ ...mockOptions }).userAgent).toBe('StoneAgent/1.0')

    vi.stubGlobal('window', undefined) // SSR/worker: no window
    expect(IncomingBrowserEvent.create({ ...mockOptions }).userAgent).toBeUndefined()

    vi.stubGlobal('window', {}) // window without navigator
    expect(IncomingBrowserEvent.create({ ...mockOptions }).userAgent).toBeUndefined()

    vi.unstubAllGlobals()
  })
})
