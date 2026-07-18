import { URL } from 'node:url'
import RangeParser from 'range-parser'
import { HttpMethods } from '../src/declarations'
import { HttpError } from '../src/errors/HttpError'
import { UploadedFile } from '@stone-js/filesystem'
import { CookieCollection } from '../src/cookies/CookieCollection'
import { IncomingHttpEvent, IncomingHttpEventOptions } from '../src/IncomingHttpEvent'

// Mock options for IncomingHttpEvent
const mockOptions: IncomingHttpEventOptions = {
  ip: '127.0.0.1',
  source: {} as any,
  url: new URL('http://localhost/test#title'),
  ips: ['127.0.0.1', '192.168.0.1'],
  body: { key: 'value' },
  files: { file1: [new UploadedFile('path/to/file', 'file1.txt', 'text/plain', false)] },
  locale: 'en',
  headers: {
    etag: 'localhost',
    range: 'bytes=0-499',
    'if-none-match': '"foo"',
    'user-agent': 'test-agent',
    'accept-encoding': 'gzip, br',
    'accept-language': 'en-US,en;q=0.9',
    accept: 'application/json, text/plain, */*',
    'content-type': 'application/json; charset=utf-8'
  },
  protocol: 'http',
  queryString: 'param1=value1&param2=value2',
  method: HttpMethods.GET,
  metadata: { username: 'Jonh' },
  cookies: CookieCollection.create('test=value; anotherTest=anotherValue')
}

// Create an instance of IncomingHttpEvent for testing

describe('IncomingHttpEvent', () => {
  let event: IncomingHttpEvent

  beforeEach(() => {
    event = IncomingHttpEvent.create(mockOptions)
    vi.clearAllMocks()
  })

  it('should create an instance of IncomingHttpEvent', () => {
    const event = IncomingHttpEvent.create({ ...mockOptions, headers: new Headers() })
    // @ts-expect-error - Invalid method value for testing purposes
    event.getRoute = vi.fn(() => ({ params: { env: 'test' } }))
    // @ts-expect-error - Invalid value for testing purposes
    event.url = { pathname: '%' }
    expect(event).toBeInstanceOf(IncomingHttpEvent)
    expect(event.params).toEqual({ env: 'test' })
    expect(event.decodedPathname).toBeUndefined()
  })

  it('should correctly invoke getters', () => {
    expect(event.decodedPathname).toBe('/test')
    expect(event.host).toBe('localhost')
    expect(event.hash).toBe('#title')
    expect(event.hostname).toBe('localhost')
    expect(event.pathname).toBe('/test')
    expect(event.params).toBeUndefined()
    expect(event.path).toBe('/test')
    expect(event.scheme).toBe('http')
    expect(event.segments).toEqual(['', 'test'])
    expect(event.userAgent).toBe('test-agent')
    expect(event.etag).toBe('localhost')
    expect(event.charset).toBe('utf-8')
    expect(event.contentType).toBe('application/json')
    expect(event.types).toEqual(['application/json', 'text/plain', '*/*'])
    expect(event.charsets).toEqual(['*'])
    expect(event.languages).toEqual(['en-US', 'en'])
    expect(event.encodings).toEqual(['gzip', 'br', 'identity'])
    expect(event.isAjax).toBe(false)
    expect(event.isSecure).toBe(false)
    expect(event.isPrefetch).toBe(false)
    expect(event.uri).toBe('http://localhost/test#title')
    expect(event.getRouteResolver()()).toBeUndefined()
    expect(event.getUserResolver()()).toBeUndefined()
    expect(event.getUser()).toBeUndefined()
    expect(event.getUri()).toBe('/test')
    expect(event.getUri(true)).toBe('http://localhost/test')
    expect(event.uriForPath('/api/v1/test')).toBe('http://localhost/api/v1/test')
    expect(event.isMethodSafe()).toBe(true)
    expect(event.hasFile('file')).toBe(false)
    expect(event.hasFile('file1')).toBe(true)
    expect(event.getFile('file1')).toHaveLength(1)
    expect(event.hasJson('file1')).toBe(false)
    expect(event.getFormat('text/html')).toBe('html')
    expect(event.getFormat('text/htmlp')).toBeUndefined()
    expect(event.json('key')).toBe('value')
    expect(event.json('key2')).toBeUndefined()
    expect(event.filterFiles(['file1']).file1).toHaveLength(1)
    expect(event.filterFiles(['file2']).file2).toBeUndefined()
    expect(event.query.get('param1')).toBe('value1')
    expect(event.acceptsTypes('application/json', 'text/html')).toBe('application/json')
    expect(event.acceptsLanguages('en')).toBe('en')
    expect(event.getMimeType('htmlp')).toBeUndefined()
    expect(event.getMimeType('json')).toBe('application/json')
    expect(event.isMethodCacheable()).toBe(true)
    expect(event.isMethod('get')).toBe(true)
    expect(event.acceptsCharsets('utf-8')).toBe('utf-8')
    expect(event.hasHeader('content-type')).toBe(true)
    expect(event.getHeader('referrer', 'none')).toBe('none')
    expect(event.getHeader('content-type')).toBe('application/json; charset=utf-8')
    expect(event.hasCookie('test-cookie')).toBe(false)
    expect(event.acceptsEncodings('gzip', 'br')).toBe('gzip')
    expect(event.getCookie('test-cookie')).toBeUndefined()
    expect(event.getBody()).toEqual({ key: 'value' })
    expect((event.range(1000) as RangeParser.Ranges)[0]).toEqual({ start: 0, end: 499 })
    expect((event.range(1000, true) as RangeParser.Ranges)[0]).toEqual({ start: 0, end: 499 })
    expect((event.range(200, true) as RangeParser.Ranges)[0]).toEqual({ start: 0, end: 199 })
    expect(event.setUserResolver(() => ({ name: 'Stone' })).getUser()).toEqual({ name: 'Stone' })
    expect(event.isFresh({ etag: '"foo"', lastModified: new Date().toUTCString(), status: 200 })).toBe(true)
    expect(event.isFresh({ etag: '"bar"', lastModified: new Date().toUTCString(), status: 200 })).toBe(false)
    expect(event.isStale({ etag: '"foo"', lastModified: new Date().toUTCString(), status: 200 })).toBe(false)
    expect(event.isStale({ etag: '"bar"', lastModified: new Date().toUTCString(), status: 200 })).toBe(true)
    expect(event.isStale({ etag: '"bar"', lastModified: new Date().toUTCString(), status: undefined })).toBe(true)
  })

  it('should correctly invoke getters in some edge conditions', () => {
    // @ts-expect-error - Invalid method value for testing purposes
    const event = IncomingHttpEvent.create({ ...mockOptions, body: null, cookies: undefined, queryString: undefined, headers: {} })
    // @ts-expect-error - Accessing private property for testing purposes
    event.url = { pathname: '%', href: 'http://localhost/test#title' }
    expect(event.isType('json')).toBe(false)
    expect(event.range(200)).toBeUndefined()
    expect(event.getUri(true)).toBe('http://localhost/')
    expect(event.cookies).toBeInstanceOf(CookieCollection)
    expect(event.queryString).toBeUndefined()
    expect(event.headers).toEqual({})
    expect(event.charset).toBeUndefined()
    expect(event.getBody({ name: 'patate' })).toEqual({ name: 'patate' })
  })

  describe('get', () => {
    it('should correctly return the value from the path params', () => {
      // @ts-expect-error - Invalid method value for testing purposes
      event.getRoute = vi.fn(() => ({ getParam: () => 'Stone' }))
      expect(event.get('name')).toBe('Stone')
    })

    it('should correctly return the value from the body', () => {
      expect(event.get('key')).toBe('value')
    })

    it('should correctly return the value from the query params', () => {
      const event = IncomingHttpEvent.create({ ...mockOptions, queryString: '?name=Stone.js' })
      expect(event.get('name')).toBe('Stone.js')
    })

    it('should NOT read headers via get() (security): use getHeader() instead', () => {
      const event = IncomingHttpEvent.create({ ...mockOptions })
      // get() must not fall through to headers — that let query/body spoof header lookups.
      expect(event.get('content-type')).toBeUndefined()
      expect(event.getHeader('content-type')).toBe('application/json; charset=utf-8')
    })

    it('should NOT read cookies via get() (security): use getCookie() instead', () => {
      const event = IncomingHttpEvent.create({ ...mockOptions })
      expect(event.get<string>('test')).toBeUndefined()
      expect(event.getCookie('test')?.value).toBe('value')
    })

    it('should correctly return the value from the metadata', () => {
      const event = IncomingHttpEvent.create({ ...mockOptions })
      expect(event.get<Record<string, string>>('username')).toBe('Jonh')
    })
  })

  describe('preferredType', () => {
    it('should return accepted type from acceptsTypes (string)', () => {
      event.acceptsTypes = () => 'html'
      expect(event.preferredType()).toBe('html')
    })

    it('should return first accepted type from acceptsTypes (array)', () => {
      event.acceptsTypes = () => ['html', 'json']
      expect(event.preferredType()).toBe('html')
    })

    it('should return type from is() if acceptsTypes fails', () => {
      event.acceptsTypes = () => false
      event.isType = vi.fn(() => 'xml')
      expect(event.preferredType(['xml'])).toBe('xml')
      expect(event.isType).toBeCalledWith('xml')
    })

    it('should return json if isXhr is true and no accepts or content-type', () => {
      event.isType = () => false
      event.acceptsTypes = () => false
      event.getHeader = () => 'xmlhttprequest'
      expect(event.preferredType()).toBe('json')
    })

    it('should return text if userAgent contains curl and nothing else matches', () => {
      event.isType = () => false
      event.acceptsTypes = () => false
      event.getHeader = vi.fn(() => 'curl/7.64.1')
      expect(event.preferredType()).toBe('text')
    })

    it('should return text if userAgent contains wget and nothing else matches', () => {
      event.isType = () => false
      event.acceptsTypes = () => false
      event.getHeader = () => 'wget/1.20.3'
      expect(event.preferredType()).toBe('text')
    })

    it('should return defaultType if nothing matches', () => {
      event.isType = () => false
      event.acceptsTypes = () => false
      expect(event.preferredType(['json', 'html'], 'html')).toBe('html')
    })

    it('should default to json when no args are passed and nothing matches', () => {
      event.isType = () => false
      event.acceptsTypes = () => false
      expect(event.preferredType()).toBe('json')
    })
  })

  it('should set the route resolver', () => {
    const route = { params: { env: 'test' } }
    // @ts-expect-error - Invalid route value for testing purposes
    event.setRouteResolver(() => (route))
    expect(event.getRouteResolver()).toBeInstanceOf(Function)
    expect(event.getRoute()).toEqual(route)
    expect(event.params).toEqual(route.params)
  })

  it('should generate a valid backend fingerprint', () => {
    const fingerprint = btoa([event.method, event.uri, event.userAgent, event.ip].join('|'))
    expect(event.fingerprint(true)).toBe(fingerprint)
    expect(event.getRouteResolver()).toBeInstanceOf(Function)
  })

  it('should generate a valid browser fingerprint', () => {
    const fingerprint = btoa([event.method, event.pathname].join('|'))
    expect(event.fingerprint()).toBe(fingerprint)
    expect(event.getRouteResolver()).toBeInstanceOf(Function)
  })

  it('should throw an error on invalid header name', () => {
    // @ts-expect-error - Invalid cookie name
    expect(() => event.getHeader(40)).toThrow(HttpError)
    // @ts-expect-error - Invalid cookie name
    expect(() => event.hasHeader(40)).toThrow(HttpError)
  })

  it('should throw an error on invalid cookie name', () => {
    // @ts-expect-error - Invalid cookie name
    expect(() => event.getCookie(40)).toThrow(HttpError)
    // @ts-expect-error - Invalid cookie name
    expect(() => event.hasCookie(40)).toThrow(HttpError)
  })

  it('should throw an error if an invalid URL is provided', () => {
    expect(() => IncomingHttpEvent.create({ ...mockOptions, url: 'invalid-url' as unknown as URL })).toThrow(HttpError)
  })
})
