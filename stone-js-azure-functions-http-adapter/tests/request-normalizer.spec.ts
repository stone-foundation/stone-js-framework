import {
  resolveIp,
  readRawBody,
  normalizeRequest,
  headersToRecord,
  isTextualContentType
} from '../src/request-normalizer'

describe('headersToRecord', () => {
  it('lower-cases keys', () => {
    const headers = new Headers({ 'Content-Type': 'application/json', 'X-Foo': 'bar' })
    expect(headersToRecord(headers)).toEqual({ 'content-type': 'application/json', 'x-foo': 'bar' })
  })
})

describe('resolveIp', () => {
  it('prefers x-forwarded-for (first hop), then x-real-ip, then x-client-ip', () => {
    expect(resolveIp({ 'x-forwarded-for': '3.3.3.3, 4.4.4.4' })).toBe('3.3.3.3')
    expect(resolveIp({ 'x-real-ip': '2.2.2.2' })).toBe('2.2.2.2')
    expect(resolveIp({ 'x-client-ip': '5.5.5.5' })).toBe('5.5.5.5')
    expect(resolveIp({})).toBe('')
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
  it('returns undefined when there is no body', async () => {
    expect(await readRawBody(new Request('http://x/'))).toBeUndefined()
  })

  it('returns undefined for an empty body', async () => {
    expect(await readRawBody(new Request('http://x/', { method: 'POST', body: '' }))).toBeUndefined()
  })

  it('decodes textual bodies to a string', async () => {
    const req = new Request('http://x/', { method: 'POST', body: '{"a":1}', headers: { 'content-type': 'application/json' } })
    expect(await readRawBody(req)).toBe('{"a":1}')
  })

  it('keeps binary bodies as bytes', async () => {
    const bytes = new Uint8Array([1, 2, 3])
    const req = new Request('http://x/', { method: 'POST', body: bytes, headers: { 'content-type': 'image/png' } })
    const raw = await readRawBody(req)
    expect(raw).toBeInstanceOf(Uint8Array)
    expect(Array.from(raw as Uint8Array)).toEqual([1, 2, 3])
  })
})

describe('normalizeRequest', () => {
  it('normalises method, url, headers, query, cookies and ip', async () => {
    const req = new Request('https://api.test/users?page=2', {
      method: 'get',
      headers: { cookie: 'a=1; b=2', 'x-forwarded-for': '9.9.9.9' }
    })
    const norm = await normalizeRequest(req)
    expect(norm.method).toBe('GET')
    expect(norm.url.pathname).toBe('/users')
    expect(norm.rawQueryString).toBe('page=2')
    expect(norm.cookies).toEqual(['a=1', 'b=2'])
    expect(norm.ip).toBe('9.9.9.9')
    expect(norm.headers['x-forwarded-for']).toBe('9.9.9.9')
  })

  it('handles a request with no query and no cookies', async () => {
    const norm = await normalizeRequest(new Request('https://api.test/'))
    expect(norm.rawQueryString).toBe('')
    expect(norm.cookies).toEqual([])
    expect(norm.ip).toBe('')
  })
})
