import { IncomingHttpEvent } from '../src/IncomingHttpEvent'
import { RedirectResponse } from '../src/RedirectResponse'
import { OutgoingHttpResponse } from '../src/OutgoingHttpResponse'
import { HandleCorsMiddleware } from '../src/middleware/HandleCorsMiddleware'

/**
 * Secure-by-default regression suite: locks the behaviours that a 100% line-coverage suite
 * previously missed (audit H1/H2/M2/B1). If any of these regress, an app is silently exposed.
 */
describe('http-core: secure by default', () => {
  const makeEvent = (extra: any = {}): IncomingHttpEvent => IncomingHttpEvent.create({
    ip: '127.0.0.1',
    source: {} as any,
    url: new URL('http://localhost/'),
    ...extra
  })

  describe('B1 — multiple Set-Cookie are not corrupted', () => {
    it('keeps each Set-Cookie separate (commas in Expires do not split them)', async () => {
      const event = makeEvent()
      const response = OutgoingHttpResponse.create({ content: 'ok', statusCode: 200 })
      response.setCookie('sid', 'abc', { expires: new Date('2030-06-09T10:00:00Z') })
      response.setCookie('csrf', 'xyz', { expires: new Date('2030-06-09T10:00:00Z') })

      await response.prepare(event)

      const setCookies = response.headers.getSetCookie()
      expect(setCookies).toHaveLength(2)
      expect(setCookies.some((c) => c.startsWith('sid='))).toBe(true)
      expect(setCookies.some((c) => c.startsWith('csrf='))).toBe(true)
      // Each cookie keeps its full Expires attribute intact (never split on the comma).
      expect(setCookies.every((c) => /Expires=\w{3}, \d{2}/.test(c))).toBe(true)
    })
  })

  describe('H1 — cookies are not signed with an empty secret', () => {
    it('leaves cookies unsigned when no secret is configured', async () => {
      const event = makeEvent()
      const response = OutgoingHttpResponse.create({ content: 'ok', statusCode: 200 })
      response.setCookie('sid', 'plain')

      await response.prepare(event) // blueprint absent → secret resolves to '' → no signing

      const setCookies = response.headers.getSetCookie()
      expect(setCookies[0]).toContain('sid=plain')
      expect(setCookies[0]).not.toContain('$$s$$')
    })
  })

  describe('H2 — get() never reads headers or cookies', () => {
    it('cannot be tricked into returning a header/cookie value', () => {
      const event = makeEvent({
        headers: { authorization: 'Bearer real-token', cookie: 'session=secret' }
      })
      expect(event.get('authorization')).toBeUndefined()
      expect(event.get('session')).toBeUndefined()
      expect(event.getHeader('authorization')).toBe('Bearer real-token')
    })
  })

  describe('M2 — CORS is not permissive by default', () => {
    const makeBlueprint = (cors: any = {}): any => ({ get: (key: string, fb: any) => (key === 'stone.http.cors' ? cors : fb) })

    it('emits NO Access-Control-Allow-Origin when unconfigured', async () => {
      const middleware = new HandleCorsMiddleware({ blueprint: makeBlueprint({ origin: [] }) })
      const response = OutgoingHttpResponse.create({ content: 'ok', statusCode: 200 })
      const result = await middleware.handle(makeEvent({ headers: { origin: 'https://evil.test' } }), async () => response)
      expect(result.getHeader('Access-Control-Allow-Origin')).toBeUndefined()
    })

    it('throws on the credentials + wildcard misconfiguration', async () => {
      const middleware = new HandleCorsMiddleware({ blueprint: makeBlueprint({ origin: '*', credentials: true }) })
      const response = OutgoingHttpResponse.create({ content: 'ok', statusCode: 200 })
      await expect(middleware.handle(makeEvent(), async () => response)).rejects.toThrow(/cannot be combined with/)
    })

    it('allows an explicit wildcard without credentials', async () => {
      const middleware = new HandleCorsMiddleware({ blueprint: makeBlueprint({ origin: '*' }) })
      const response = OutgoingHttpResponse.create({ content: 'ok', statusCode: 200 })
      const result = await middleware.handle(makeEvent(), async () => response)
      expect(result.getHeader('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('open-redirect protection edge cases', () => {
    it('falls back to / for an unparseable referer', async () => {
      const event = makeEvent({ headers: { referrer: 'http://[::bad url' } })
      const response = await RedirectResponse.create<RedirectResponse>({ url: 'back', statusCode: 302, content: 'x' }).prepare(event)
      expect(response.getHeader('Location')).toBe('/')
    })

    it('falls back to / when there is no referer', async () => {
      const response = await RedirectResponse.create<RedirectResponse>({ url: 'back', statusCode: 302, content: 'x' }).prepare(makeEvent())
      expect(response.getHeader('Location')).toBe('/')
    })
  })
})
