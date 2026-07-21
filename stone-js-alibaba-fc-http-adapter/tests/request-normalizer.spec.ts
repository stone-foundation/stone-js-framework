import {
  resolveIp,
  resolveUrl,
  readRawBody,
  normalizeRequest,
  headersToRecord,
  isTextualContentType
} from '../src/request-normalizer'
import { AlibabaFcHttpRequest } from '../src/declarations'

const fcRequest = (over: Partial<AlibabaFcHttpRequest> = {}): AlibabaFcHttpRequest => ({
  method: 'GET',
  url: '/',
  headers: {},
  ...over
})

describe('headersToRecord', () => {
  it('lower-cases keys and joins array values', () => {
    expect(headersToRecord({ 'Content-Type': 'application/json', 'X-Foo': 'bar' }))
      .toEqual({ 'content-type': 'application/json', 'x-foo': 'bar' })
    expect(headersToRecord({ 'Set-Cookie': ['a=1', 'b=2'], skip: undefined }))
      .toEqual({ 'set-cookie': 'a=1, b=2' })
  })
})

describe('resolveIp', () => {
  it('prefers FC clientIP, then x-forwarded-for (first hop), then other headers', () => {
    expect(resolveIp('1.2.3.4', {})).toBe('1.2.3.4')
    expect(resolveIp(undefined, { 'x-forwarded-for': '3.3.3.3, 4.4.4.4' })).toBe('3.3.3.3')
    expect(resolveIp('', { 'x-real-ip': '2.2.2.2' })).toBe('2.2.2.2')
    expect(resolveIp(undefined, { 'x-client-ip': '5.5.5.5' })).toBe('5.5.5.5')
    expect(resolveIp(undefined, {})).toBe('')
  })
})

describe('isTextualContentType', () => {
  it('treats missing and textual types as text, binary as non-text', () => {
    expect(isTextualContentType(undefined)).toBe(true)
    expect(isTextualContentType('application/json')).toBe(true)
    expect(isTextualContentType('text/html')).toBe(true)
    expect(isTextualContentType('application/x-www-form-urlencoded')).toBe(true)
    expect(isTextualContentType('image/png')).toBe(false)
  })
})

describe('readRawBody', () => {
  it('returns undefined when there is no body or it is empty', () => {
    expect(readRawBody(undefined, 'application/json')).toBeUndefined()
    expect(readRawBody(Buffer.from(''), 'application/json')).toBeUndefined()
  })

  it('decodes textual bodies to a string', () => {
    expect(readRawBody(Buffer.from('{"a":1}'), 'application/json')).toBe('{"a":1}')
  })

  it('keeps binary bodies as bytes', () => {
    const raw = readRawBody(Buffer.from([1, 2, 3]), 'image/png')
    expect(raw).toBeInstanceOf(Uint8Array)
    expect(Array.from(raw as Uint8Array)).toEqual([1, 2, 3])
  })
})

describe('resolveUrl', () => {
  it('builds an absolute URL from the host header and path', () => {
    const url = resolveUrl(fcRequest({ url: '/users?page=2' }), { host: 'api.test' })
    expect(url.href).toBe('https://api.test/users?page=2')
  })

  it('honours x-forwarded-proto and falls back to path then localhost', () => {
    const url = resolveUrl(fcRequest({ url: undefined, path: '/p' }), { 'x-forwarded-proto': 'http' })
    expect(url.protocol).toBe('http:')
    expect(url.host).toBe('localhost')
    expect(url.pathname).toBe('/p')
  })
})

describe('normalizeRequest', () => {
  it('normalises method, url, headers, query, cookies and ip', () => {
    const norm = normalizeRequest(fcRequest({
      method: 'get',
      url: '/users?page=2',
      clientIP: '9.9.9.9',
      headers: { host: 'api.test', cookie: 'a=1; b=2' }
    }))
    expect(norm.method).toBe('GET')
    expect(norm.url.pathname).toBe('/users')
    expect(norm.rawQueryString).toBe('page=2')
    expect(norm.cookies).toEqual(['a=1', 'b=2'])
    expect(norm.ip).toBe('9.9.9.9')
  })

  it('handles a request with no query and no cookies', () => {
    const norm = normalizeRequest(fcRequest({ headers: { host: 'api.test' } }))
    expect(norm.rawQueryString).toBe('')
    expect(norm.cookies).toEqual([])
    expect(norm.ip).toBe('')
  })
})
