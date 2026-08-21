import { URL } from 'node:url'
import { HttpMethods, IncomingHttpEvent } from '@stone-js/http-core'
import { AuthenticateMiddleware } from '../src/middleware/AuthenticateMiddleware'
import { requireAuth, requireScopes, normalizeScopes } from '../src/middleware/guards'
import { AuthenticationError, InsufficientScopeError } from '../src/errors/AuthErrors'

/**
 * A real event, not a stand-in.
 *
 * The stub this replaces answered `get('Authorization')` from a plain map, so it agreed with the
 * middleware about where a token lives and the suite stayed green while authentication never worked
 * against an actual request. A real event knows the difference between a header and a query
 * parameter, which is the whole point.
 */
const eventStub = (over: any = {}): any => {
  const { meta, ...headers } = over
  const event: any = IncomingHttpEvent.create({
    url: new URL('http://localhost/tasks'),
    method: HttpMethods.GET,
    headers,
    metadata: { ...meta }
  } as any)
  return event
}

const blueprintStub = (auth: Record<string, unknown> = {}): any => ({
  get: (key: string, fb?: unknown) => key === 'stone.auth' ? auth : fb
})

describe('AuthenticateMiddleware', () => {
  it('verifies a bearer token and attaches claims + mapped user', async () => {
    const authenticator: any = { verify: vi.fn(async () => ({ sub: 'u1', scope: 'read' })) }
    const mw = new AuthenticateMiddleware({ authenticator, blueprint: blueprintStub({ resolveUser: (c: any) => ({ id: c.sub }) }) })
    const event = eventStub({ Authorization: 'Bearer abc.def.ghi' })
    const next = vi.fn(async () => 'ok' as any)

    const res = await mw.handle(event, next as any)

    expect(authenticator.verify).toHaveBeenCalledWith('abc.def.ghi')
    expect(event.getMetadataValue('auth')).toEqual({ sub: 'u1', scope: 'read' })
    expect(event.getUser()).toEqual({ id: 'u1' })
    expect(res).toBe('ok')
  })

  it('awaits an asynchronous resolveUser', async () => {
    // Resolving a principal hits a store in any real application: without the await the event
    // received a pending Promise as its user, so the option was unusable.
    const authenticator: any = { verify: vi.fn(async () => ({ sub: 'u9' })) }
    const resolveUser = vi.fn(async (c: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1))
      return { id: c.sub, provisioned: true }
    })
    const mw = new AuthenticateMiddleware({ authenticator, blueprint: blueprintStub({ resolveUser }) })
    const event = eventStub({ Authorization: 'Bearer t' })

    await mw.handle(event, (async () => 'ok') as any)

    expect(resolveUser).toHaveBeenCalledWith({ sub: 'u9' })
    expect(event.getUser()).toEqual({ id: 'u9', provisioned: true })
  })

  it('defaults to identity mapping (user === claims) when no resolveUser is configured', async () => {
    const authenticator: any = { verify: vi.fn(async () => ({ sub: 'u2', scope: 'read' })) }
    const mw = new AuthenticateMiddleware({ authenticator, blueprint: blueprintStub() })
    const event = eventStub({ Authorization: 'Bearer t' })
    await mw.handle(event, (async () => 'ok') as any)
    expect(event.getUser()).toEqual({ sub: 'u2', scope: 'read' })
  })

  it('continues anonymously when no token is present (default identity mapping)', async () => {
    const authenticator: any = { verify: vi.fn() }
    const mw = new AuthenticateMiddleware({ authenticator, blueprint: blueprintStub() })
    const event = eventStub()
    const next = vi.fn(async () => 'ok' as any)

    await mw.handle(event, next as any)

    expect(authenticator.verify).not.toHaveBeenCalled()
    expect(event.getUser()).toBeUndefined()
  })

  it('propagates an AuthenticationError for an invalid token', async () => {
    const authenticator: any = { verify: vi.fn(async () => { throw new AuthenticationError('bad') }) }
    const mw = new AuthenticateMiddleware({ authenticator, blueprint: blueprintStub() })
    await expect(mw.handle(eventStub({ Authorization: 'Bearer bad' }), (async () => 'ok') as any)).rejects.toThrow(AuthenticationError)
  })
})

describe('guards', () => {
  it('normalizeScopes handles strings, arrays and absence', () => {
    expect(normalizeScopes('read write')).toEqual(['read', 'write'])
    expect(normalizeScopes(['a', 'b'])).toEqual(['a', 'b'])
    expect(normalizeScopes(undefined)).toEqual([])
  })

  it('requireAuth passes when authenticated, throws otherwise', async () => {
    const next = vi.fn(async () => 'ok' as any)
    await expect(requireAuth()(eventStub({ meta: { auth: { sub: 'u' } } }), next as any)).resolves.toBe('ok')
    await expect(requireAuth()(eventStub(), next as any)).rejects.toThrow(AuthenticationError)
  })

  it('requireScopes enforces every scope', async () => {
    const next = vi.fn(async () => 'ok' as any)
    const event = eventStub({ meta: { auth: { scope: 'read write' } } })
    await expect(requireScopes('read')(event, next as any)).resolves.toBe('ok')
    await expect(requireScopes('read', 'delete')(event, next as any)).rejects.toThrow(InsufficientScopeError)
  })

  it('requireScopes throws when anonymous', async () => {
    await expect(requireScopes('read')(eventStub(), (async () => 'ok') as any)).rejects.toThrow(AuthenticationError)
  })
})

describe('where a bearer token is read from', () => {
  const authenticator: any = { verify: vi.fn(async () => ({ sub: 'u1' })) }
  const middleware = (): AuthenticateMiddleware => new AuthenticateMiddleware({ authenticator, blueprint: blueprintStub() })

  beforeEach(() => { authenticator.verify.mockClear() })

  it('reads the Authorization header, whatever case the client sent', async () => {
    // HTTP header names are case-insensitive and Node lowercases them, so a middleware that looks
    // for exactly `Authorization` in a map finds nothing on a real request.
    for (const name of ['Authorization', 'authorization', 'AUTHORIZATION']) {
      authenticator.verify.mockClear()
      await middleware().handle(eventStub({ [name]: 'Bearer real.token' }), (async () => 'ok') as any)
      expect(authenticator.verify).toHaveBeenCalledWith('real.token')
    }
  })

  it('refuses a token smuggled through the query string', async () => {
    // The event's own `get()` reads the query string and the body, which is why it must never be the
    // way a credential is read: `?Authorization=` would have been accepted as a header.
    const event = IncomingHttpEvent.create({
      url: new URL('http://localhost/tasks?Authorization=Bearer%20smuggled'),
      method: HttpMethods.GET,
      headers: {},
      queryString: 'Authorization=Bearer%20smuggled'
    } as any)

    await middleware().handle(event as any, (async () => 'ok') as any)

    expect(authenticator.verify).not.toHaveBeenCalled()
    expect(event.getUser()).toBeUndefined()
  })

  it('continues anonymously when no header is present', async () => {
    const event = eventStub()

    await expect(middleware().handle(event, (async () => 'ok') as any)).resolves.toBe('ok')
    expect(event.getUser()).toBeUndefined()
  })
})
