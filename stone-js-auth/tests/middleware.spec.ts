import { AuthenticateMiddleware } from '../src/middleware/AuthenticateMiddleware'
import { requireAuth, requireScopes, normalizeScopes } from '../src/middleware/guards'
import { AuthenticationError, AuthorizationError } from '../src/errors/AuthErrors'

const eventStub = (over: any = {}): any => {
  const meta: Record<string, unknown> = { ...over.meta }
  let user: unknown
  return {
    get: (key: string, fallback?: unknown) => over[key] ?? fallback,
    setMetadataValue: (k: string, v: unknown) => { meta[k] = v },
    getMetadataValue: <T>(k: string, fb?: T) => (k in meta ? meta[k] : fb) as T,
    setUserResolver: (fn: () => unknown) => { user = fn() },
    getUser: () => user
  }
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
    await expect(requireScopes('read', 'delete')(event, next as any)).rejects.toThrow(AuthorizationError)
  })

  it('requireScopes throws when anonymous', async () => {
    await expect(requireScopes('read')(eventStub(), (async () => 'ok') as any)).rejects.toThrow(AuthenticationError)
  })
})
