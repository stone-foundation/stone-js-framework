import { Authorizer } from '../src/Authorizer'
import { authzBlueprint } from '../src/options/AuthzBlueprint'
import { AuthzServiceProvider } from '../src/AuthzServiceProvider'
import { AbilityMiddleware } from '../src/middleware/AbilityMiddleware'
import { AuthorizationError } from '../src/errors/AuthorizationError'
import { defineAbility, createMongoAbility, AbilityBuilder } from '../src/casl'

describe('CASL re-exports', () => {
  it('re-exports the CASL essentials', () => {
    expect(typeof defineAbility).toBe('function')
    expect(typeof createMongoAbility).toBe('function')
    expect(typeof AbilityBuilder).toBe('function')
  })
})

describe('AuthzServiceProvider', () => {
  it('registers the Authorizer singleton from stone.authz with aliases', () => {
    const resolveAbility = (): any => defineAbility((can) => can('read', 'Post'))
    const container: any = {
      make: vi.fn(() => ({ get: (_k: string, fb: unknown) => ({ resolveAbility, ...(fb as object) }) })),
      singletonIf: vi.fn().mockReturnThis(),
      alias: vi.fn().mockReturnThis()
    }
    new AuthzServiceProvider(container).register()
    expect(container.singletonIf).toHaveBeenCalledWith(Authorizer, expect.any(Function))
    expect(container.alias).toHaveBeenCalledWith(Authorizer, ['authorizer', 'Authorizer'])
    expect(container.singletonIf.mock.calls[0][1]()).toBeInstanceOf(Authorizer)
  })
})

describe('authzBlueprint', () => {
  it('contributes the provider and the ability middleware', () => {
    expect(authzBlueprint.stone.providers).toContain(AuthzServiceProvider)
    expect(authzBlueprint.stone.kernel?.middleware).toContainEqual({ module: AbilityMiddleware, isClass: true })
    expect(authzBlueprint.stone.authz).toBeDefined()
  })
})

describe('AuthorizationError', () => {
  it('carries the 403 status code', () => {
    expect(new AuthorizationError('x').statusCode).toBe(403)
    expect(new AuthorizationError('x').name).toBe('AuthorizationError')
  })
})
