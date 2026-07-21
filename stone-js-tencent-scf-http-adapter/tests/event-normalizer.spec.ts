import {
  getRawBody,
  collectCookies,
  normalizeHeaders,
  resolveSourceIp,
  normalizeHttpEvent,
  buildRawQueryString
} from '../src/event-normalizer'

describe('event-normalizer', () => {
  describe('normalizeHeaders', () => {
    it('lower-cases keys and merges multi-value headers', () => {
      const headers = normalizeHeaders({
        headers: { 'Content-Type': 'text/plain', 'X-Null': undefined },
        multiValueHeaders: { 'X-Multi': ['a', 'b'], 'X-Bad': undefined }
      } as any)
      expect(headers['content-type']).toBe('text/plain')
      expect(headers['x-multi']).toBe('a, b')
      expect(headers['x-null']).toBeUndefined()
    })

    it('tolerates null headers', () => {
      expect(normalizeHeaders({ headers: null } as any)).toEqual({})
    })
  })

  describe('buildRawQueryString', () => {
    it('builds from the queryString object (Tencent), preserving array values', () => {
      expect(buildRawQueryString({ queryString: { q: 'a', t: ['x', 'y'] } } as any)).toBe('q=a&t=x&t=y')
    })
    it('builds from multiValueQueryStringParameters', () => {
      expect(buildRawQueryString({ multiValueQueryStringParameters: { t: ['x', 'y'] } } as any)).toBe('t=x&t=y')
    })
    it('builds from queryStringParameters', () => {
      expect(buildRawQueryString({ queryStringParameters: { q: 'a' } } as any)).toBe('q=a')
    })
    it('skips undefined single-value params', () => {
      expect(buildRawQueryString({ queryString: { a: 'x', b: undefined } } as any)).toBe('a=x')
    })
    it('tolerates an undefined multi-value entry', () => {
      expect(buildRawQueryString({ multiValueQueryStringParameters: { t: undefined, u: ['1'] } } as any)).toBe('u=1')
    })
    it('returns empty string when no query is present', () => {
      expect(buildRawQueryString({} as any)).toBe('')
      expect(buildRawQueryString({ queryString: null } as any)).toBe('')
    })
  })

  describe('collectCookies', () => {
    it('splits the Cookie header', () => {
      expect(collectCookies({ cookie: 'a=1; b=2' })).toEqual(['a=1', 'b=2'])
    })
    it('returns [] when no cookies', () => {
      expect(collectCookies({})).toEqual([])
    })
  })

  describe('resolveSourceIp', () => {
    it('prefers requestContext.sourceIp, then the first X-Forwarded-For hop', () => {
      expect(resolveSourceIp({ requestContext: { sourceIp: '2.2.2.2' } } as any, {})).toBe('2.2.2.2')
      expect(resolveSourceIp({} as any, { 'x-forwarded-for': '5.5.5.5, 6.6.6.6' })).toBe('5.5.5.5')
    })

    it('returns empty string when neither is present', () => {
      expect(resolveSourceIp({} as any, {})).toBe('')
    })
  })

  describe('getRawBody', () => {
    it('returns a string body as-is', () => {
      expect(getRawBody({ body: 'hello' } as any)).toBe('hello')
    })
    it('decodes a base64 body to a Buffer without lossy re-encoding', () => {
      const bytes = Buffer.from([0xff, 0x00, 0x7f])
      const raw = getRawBody({ body: bytes.toString('base64'), isBase64Encoded: true } as any)
      expect(Buffer.isBuffer(raw)).toBe(true)
      expect([...(raw as Buffer)]).toEqual([0xff, 0x00, 0x7f])
    })
    it('returns a non-string body untouched', () => {
      const obj = { a: 1 }
      expect(getRawBody({ body: obj } as any)).toBe(obj)
    })
  })

  describe('normalizeHttpEvent', () => {
    it('produces a canonical shape for a Tencent SCF event', () => {
      const n = normalizeHttpEvent({
        httpMethod: 'post',
        path: '/x',
        queryString: { a: '1' },
        headers: { 'X-A': '1', cookie: 's=1' },
        body: 'b',
        requestContext: { sourceIp: '9.9.9.9' }
      } as any)
      expect(n).toMatchObject({ method: 'POST', path: '/x', rawQueryString: 'a=1', sourceIp: '9.9.9.9' })
      expect(n.cookies).toEqual(['s=1'])
      expect(n.headers['x-a']).toBe('1')
    })

    it('defaults method to GET and path to / when absent', () => {
      const n = normalizeHttpEvent({} as any)
      expect(n.method).toBe('GET')
      expect(n.path).toBe('/')
    })

    it('resolves method/path from httpMethod and path', () => {
      const n = normalizeHttpEvent({ httpMethod: 'delete', path: '/a' } as any)
      expect(n.method).toBe('DELETE')
      expect(n.path).toBe('/a')
    })

    it('resolves method from requestContext.httpMethod (alt shape)', () => {
      const n = normalizeHttpEvent({ requestContext: { httpMethod: 'patch' } } as any)
      expect(n.method).toBe('PATCH')
    })
  })
})
