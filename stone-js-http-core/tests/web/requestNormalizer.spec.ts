import {
  DEFAULT_IP_HEADERS,
  headersToRecord,
  isTextualContentType,
  normalizeWebRequest,
  readRawBody,
  resolveIp
} from '../../src/web/requestNormalizer'

describe('reading a Web request headers', () => {
  it('lower-cases the names, so a lookup does not depend on how they arrived', () => {
    const headers = new Headers({ 'Content-Type': 'application/json', 'X-Foo': 'bar' })

    expect(headersToRecord(headers)).toEqual({ 'content-type': 'application/json', 'x-foo': 'bar' })
  })
})

describe('the client address', () => {
  it('is read in the order the platform said, not in one this file chose', () => {
    // The order is the caller's because only the caller knows which header its own edge overwrites.
    // Baking one in is what made three adapters keep a copy of this whole file to change one list.
    const headers = { 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '9.9.9.9' }

    expect(resolveIp(headers, ['cf-connecting-ip', 'x-forwarded-for'])).toBe('1.1.1.1')
    expect(resolveIp(headers, ['x-forwarded-for', 'cf-connecting-ip'])).toBe('9.9.9.9')
  })

  it('takes the first hop of a forwarded chain', () => {
    // Everything after the first entry was appended by a proxy, and the first is the caller.
    expect(resolveIp({ 'x-forwarded-for': '3.3.3.3, 4.4.4.4' })).toBe('3.3.3.3')
  })

  it('answers nothing rather than guessing when no header carries one', () => {
    expect(resolveIp({})).toBe('')
    expect(resolveIp({ 'cf-connecting-ip': '' })).toBe('')
  })

  it('falls back to a generic order when a platform names none', () => {
    expect(DEFAULT_IP_HEADERS).toEqual(['x-forwarded-for', 'x-real-ip', 'x-client-ip'])
    expect(resolveIp({ 'x-real-ip': '2.2.2.2' })).toBe('2.2.2.2')
  })
})

describe('whether a body can become a string', () => {
  it('treats an absent content type as text, since that is what a body usually is', () => {
    expect(isTextualContentType(undefined)).toBe(true)
  })

  it('recognises the textual families, suffixes included', () => {
    expect(isTextualContentType('application/json')).toBe(true)
    expect(isTextualContentType('text/html')).toBe(true)
    expect(isTextualContentType('application/x-www-form-urlencoded')).toBe(true)
    expect(isTextualContentType('application/vnd.api+json')).toBe(true)
  })

  it('leaves anything else as bytes', () => {
    expect(isTextualContentType('image/png')).toBe(false)
    expect(isTextualContentType('application/octet-stream')).toBe(false)
  })
})

describe('reading the body', () => {
  it('answers nothing when there is none', async () => {
    expect(await readRawBody(new Request('http://x/'))).toBeUndefined()
  })

  it('answers nothing for an empty body, rather than an empty string', async () => {
    expect(await readRawBody(new Request('http://x/', { method: 'POST', body: '' }))).toBeUndefined()
  })

  it('decodes a textual body', async () => {
    const request = new Request('http://x/', {
      method: 'POST',
      body: '{"a":1}',
      headers: { 'content-type': 'application/json' }
    })

    expect(await readRawBody(request)).toBe('{"a":1}')
  })

  it('keeps a binary body as bytes', async () => {
    const bytes = new Uint8Array([1, 2, 3])
    const request = new Request('http://x/', {
      method: 'POST',
      body: bytes,
      headers: { 'content-type': 'image/png' }
    })

    const raw = await readRawBody(request)

    expect(raw).toBeInstanceOf(Uint8Array)
    expect(Array.from(raw as Uint8Array)).toEqual([1, 2, 3])
  })
})

describe('a Web request, normalized', () => {
  it('lifts the method, url, headers, query, cookies and address', async () => {
    const request = new Request('https://api.test/users?page=2', {
      method: 'get',
      headers: { cookie: 'a=1; b=2', 'x-forwarded-for': '9.9.9.9' }
    })

    const normalized = await normalizeWebRequest(request)

    expect(normalized.method).toBe('GET')
    expect(normalized.url.pathname).toBe('/users')
    expect(normalized.rawQueryString).toBe('page=2')
    expect(normalized.cookies).toEqual(['a=1', 'b=2'])
    expect(normalized.ip).toBe('9.9.9.9')
    expect(normalized.headers['x-forwarded-for']).toBe('9.9.9.9')
  })

  it('handles a request with no query and no cookies', async () => {
    const normalized = await normalizeWebRequest(new Request('https://api.test/'))

    expect(normalized.rawQueryString).toBe('')
    expect(normalized.cookies).toEqual([])
    expect(normalized.ip).toBe('')
  })

  it('honours the platform header order', async () => {
    const request = new Request('https://api.test/', {
      headers: { 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '9.9.9.9' }
    })

    expect((await normalizeWebRequest(request, ['cf-connecting-ip'])).ip).toBe('1.1.1.1')
    expect((await normalizeWebRequest(request, ['x-forwarded-for'])).ip).toBe('9.9.9.9')
  })

  it('accepts anything Web-shaped, not only a Request', async () => {
    // A duck type rather than the nominal class, because a platform's own request class is Web-shaped
    // without being that exact type. Typing against the class is what forced a copy of the whole file
    // to change one signature.
    const webShaped = {
      url: 'https://api.test/things?a=1',
      method: 'post',
      body: 'x',
      headers: {
        get: (name: string) => (name === 'content-type' ? 'text/plain' : null),
        forEach: (fn: (value: string, key: string) => void) => { fn('text/plain', 'Content-Type') }
      },
      arrayBuffer: async () => new TextEncoder().encode('hello').buffer as ArrayBuffer
    }

    const normalized = await normalizeWebRequest(webShaped)

    expect(normalized.method).toBe('POST')
    expect(normalized.rawQueryString).toBe('a=1')
    expect(normalized.rawBody).toBe('hello')
    expect(normalized.headers['content-type']).toBe('text/plain')
  })
})
