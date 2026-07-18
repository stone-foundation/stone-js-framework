import {
  getRawBody,
  collectCookies,
  normalizeHeaders,
  resolveSourceIp,
  detectEventVersion,
  normalizeHttpEvent,
  buildRawQueryString
} from '../src/event-normalizer'

describe('event-normalizer', () => {
  describe('detectEventVersion', () => {
    it('detects ALB, v2 and v1', () => {
      expect(detectEventVersion({ requestContext: { elb: {} } } as any)).toBe('alb')
      expect(detectEventVersion({ version: '2.0' } as any)).toBe('v2')
      expect(detectEventVersion({ requestContext: { http: {} } } as any)).toBe('v2')
      expect(detectEventVersion({ httpMethod: 'GET' } as any)).toBe('v1')
    })
  })

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
    it('prefers rawQueryString for v2', () => {
      expect(buildRawQueryString({ rawQueryString: 'a=1&b=2' } as any, 'v2')).toBe('a=1&b=2')
    })
    it('builds from multiValue params (v1/ALB)', () => {
      expect(buildRawQueryString({ multiValueQueryStringParameters: { t: ['x', 'y'] } } as any, 'v1')).toBe('t=x&t=y')
    })
    it('builds from single-value params', () => {
      expect(buildRawQueryString({ queryStringParameters: { q: 'a' } } as any, 'v1')).toBe('q=a')
    })
    it('falls through to params when a v2 event has no rawQueryString', () => {
      expect(buildRawQueryString({ queryStringParameters: { q: 'z' } } as any, 'v2')).toBe('q=z')
    })
    it('skips undefined single-value params', () => {
      expect(buildRawQueryString({ queryStringParameters: { a: 'x', b: undefined } } as any, 'v1')).toBe('a=x')
    })
    it('tolerates an undefined multi-value entry', () => {
      expect(buildRawQueryString({ multiValueQueryStringParameters: { t: undefined, u: ['1'] } } as any, 'v1')).toBe('u=1')
    })
    it('returns empty string when no query is present', () => {
      expect(buildRawQueryString({} as any, 'v1')).toBe('')
      expect(buildRawQueryString({ queryStringParameters: null } as any, 'v1')).toBe('')
    })
  })

  describe('collectCookies', () => {
    it('reads v2 cookies[]', () => {
      expect(collectCookies({ cookies: ['a=1', 'b=2'] } as any, {})).toEqual(['a=1', 'b=2'])
    })
    it('splits the v1/ALB Cookie header', () => {
      expect(collectCookies({} as any, { cookie: 'a=1; b=2' })).toEqual(['a=1', 'b=2'])
    })
    it('returns [] when no cookies', () => {
      expect(collectCookies({} as any, {})).toEqual([])
    })
  })

  describe('resolveSourceIp', () => {
    it('reads v2 / v1 / ALB source IPs', () => {
      expect(resolveSourceIp({ requestContext: { http: { sourceIp: '2.2.2.2' } } } as any, 'v2', {})).toBe('2.2.2.2')
      expect(resolveSourceIp({ requestContext: { identity: { sourceIp: '1.1.1.1' } } } as any, 'v1', {})).toBe('1.1.1.1')
      expect(resolveSourceIp({} as any, 'alb', { 'x-forwarded-for': '5.5.5.5, 6.6.6.6' })).toBe('5.5.5.5')
    })

    it('returns empty string for ALB without X-Forwarded-For, and for missing v2/v1 identity', () => {
      expect(resolveSourceIp({} as any, 'alb', {})).toBe('')
      expect(resolveSourceIp({} as any, 'v2', {})).toBe('')
      expect(resolveSourceIp({} as any, 'v1', {})).toBe('')
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
    it('produces a canonical shape for a v2 event', () => {
      const n = normalizeHttpEvent({
        version: '2.0',
        rawPath: '/x',
        rawQueryString: 'a=1',
        cookies: ['s=1'],
        headers: { 'X-A': '1' },
        body: 'b',
        requestContext: { http: { method: 'post', sourceIp: '9.9.9.9' } }
      } as any)
      expect(n).toMatchObject({ version: 'v2', method: 'POST', path: '/x', rawQueryString: 'a=1', sourceIp: '9.9.9.9' })
      expect(n.cookies).toEqual(['s=1'])
      expect(n.headers['x-a']).toBe('1')
    })

    it('defaults method to GET and path to / when absent', () => {
      const n = normalizeHttpEvent({} as any)
      expect(n.method).toBe('GET')
      expect(n.path).toBe('/')
    })

    it('resolves v1 method/path from httpMethod and path', () => {
      const n = normalizeHttpEvent({ httpMethod: 'delete', path: '/a' } as any)
      expect(n.method).toBe('DELETE')
      expect(n.path).toBe('/a')
    })

    it('falls back to requestContext.http.path for a v2 event without rawPath', () => {
      const n = normalizeHttpEvent({ version: '2.0', requestContext: { http: { path: '/from-ctx' } } } as any)
      expect(n.path).toBe('/from-ctx')
      expect(n.method).toBe('GET')
    })

    it('resolves method from requestContext.httpMethod (REST v1 alt shape)', () => {
      const n = normalizeHttpEvent({ requestContext: { httpMethod: 'patch' } } as any)
      expect(n.method).toBe('PATCH')
    })
  })
})
