import { AuthController } from '../app/AuthController'
import { IAuthenticator } from '@stone-js/auth'
import { IncomingHttpEvent } from '@stone-js/http-core'

// Mock route decorators and the guard factories to no-ops; the handler logic stays real.
vi.mock(import('@stone-js/router'), async (importOriginal) => ({ ...(await importOriginal()), EventHandler: vi.fn(() => vi.fn()), Get: vi.fn(() => vi.fn()), Post: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/auth'), async (importOriginal) => ({ ...(await importOriginal()), requireAuth: vi.fn(() => vi.fn()), requireScopes: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/http-core'), async (importOriginal) => ({ ...(await importOriginal()), JsonHttpResponse: vi.fn(() => vi.fn()) }))

describe('AuthController', () => {
  const eventReturning = (value: unknown): IncomingHttpEvent =>
    ({ get: (_key: string, fallback?: unknown) => value ?? fallback }) as unknown as IncomingHttpEvent

  it('signs a token for the given username with the write scope', async () => {
    const sign = vi.fn(async () => 'signed.jwt.token')
    const controller = new AuthController({ authenticator: { sign } as unknown as IAuthenticator })

    const result = await controller.login(eventReturning({ username: 'ana' }))

    expect(sign).toHaveBeenCalledWith({ sub: 'ana', scope: 'tasks:write' })
    expect(result).toEqual({ token: 'signed.jwt.token' })
  })

  it('defaults the username to "demo" when the body has none', async () => {
    const sign = vi.fn(async () => 't')
    const controller = new AuthController({ authenticator: { sign } as unknown as IAuthenticator })

    await controller.login(eventReturning({}))

    expect(sign).toHaveBeenCalledWith({ sub: 'demo', scope: 'tasks:write' })
  })

  it('returns the authenticated principal from /me', () => {
    const controller = new AuthController({ authenticator: {} as unknown as IAuthenticator })
    expect(controller.me(eventReturning({ sub: 'ana' }))).toEqual({ sub: 'ana' })
  })

  it('reports the creator on a scoped write', () => {
    const controller = new AuthController({ authenticator: {} as unknown as IAuthenticator })
    expect(controller.createTask(eventReturning({ sub: 'ana' }))).toEqual({ created: true, by: { sub: 'ana' } })
  })
})
