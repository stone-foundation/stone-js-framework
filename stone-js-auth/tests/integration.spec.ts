import { Authenticator } from '../src/Authenticator'
import { authBlueprint } from '../src/options/AuthBlueprint'
import { AuthServiceProvider } from '../src/AuthServiceProvider'
import { AuthenticateMiddleware } from '../src/middleware/AuthenticateMiddleware'
import { AuthConfigError, AuthenticationError, AuthorizationError } from '../src/errors/AuthErrors'

describe('AuthServiceProvider', () => {
  it('registers the Authenticator singleton from stone.auth with aliases', () => {
    const container: any = {
      make: vi.fn(() => ({ get: (_k: string, fb: unknown) => ({ secret: 's', ...(fb as object) }) })),
      singletonIf: vi.fn().mockReturnThis(),
      alias: vi.fn().mockReturnThis()
    }
    new AuthServiceProvider(container).register()
    expect(container.singletonIf).toHaveBeenCalledWith(Authenticator, expect.any(Function))
    expect(container.alias).toHaveBeenCalledWith(Authenticator, ['authenticator', 'Authenticator'])
    expect(container.singletonIf.mock.calls[0][1]()).toBeInstanceOf(Authenticator)
  })
})

describe('authBlueprint', () => {
  it('contributes the provider and the authenticate middleware', () => {
    expect(authBlueprint.stone.providers).toContain(AuthServiceProvider)
    expect(authBlueprint.stone.kernel?.middleware).toContainEqual({ module: AuthenticateMiddleware, isClass: true })
    expect(authBlueprint.stone.auth).toBeDefined()
  })
})

describe('auth errors', () => {
  it('carry the right HTTP status codes', () => {
    expect(new AuthenticationError('x').statusCode).toBe(401)
    expect(new AuthorizationError('x').statusCode).toBe(403)
    expect(new AuthConfigError('x').name).toBe('AuthConfigError')
  })
})
