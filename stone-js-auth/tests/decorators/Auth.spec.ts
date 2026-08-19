import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { Auth } from '../../src/decorators/Auth'
import { AuthServiceProvider } from '../../src/AuthServiceProvider'
import { authBlueprint } from '../../src/options/AuthBlueprint'
import { AuthenticateMiddleware } from '../../src/middleware/AuthenticateMiddleware'

describe('@Auth', () => {
  it('declares exactly what its blueprint declares', () => {
    // A module is enabled by its decorator or by its blueprint, and the two must do the same thing.
    // The blueprint is the source of truth; the decorator clones it and overrides its own bucket.
    @Auth()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.providers).toContain(AuthServiceProvider)
    // The blueprint is deep-cloned, so the meta entry is a copy; what must survive is the class it
    // points at, which is what the kernel resolves.
    expect(blueprint.stone.kernel.middleware).toEqual([
      expect.objectContaining({ module: AuthenticateMiddleware, isClass: true })
    ])
    expect(blueprint.stone.auth).toEqual(authBlueprint.stone.auth)
  })

  it('carries the options it is given, over the blueprint defaults', () => {
    @Auth({ issuer: 'https://issuer.example', audience: 'my-api' })
    class Application {}

    expect((getBlueprint(Application, { stone: {} }) as any).stone.auth).toEqual({ issuer: 'https://issuer.example', audience: 'my-api' })
  })

  it('does not leak between two decorated applications, nor mutate the shared constant', () => {
    // Sharing the exported constant would let one application's options bleed into another's, which
    // only shows up in a monorepo running several apps from one build.
    @Auth({ audience: 'a' })
    class First {}

    @Auth({ audience: 'b' })
    class Second {}

    expect((getBlueprint(First, { stone: {} }) as any).stone.auth.audience).toBe('a')
    expect((getBlueprint(Second, { stone: {} }) as any).stone.auth.audience).toBe('b')
    expect(authBlueprint.stone.auth).not.toHaveProperty('audience')
  })
})
