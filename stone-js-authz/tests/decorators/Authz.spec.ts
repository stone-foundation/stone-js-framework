import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { Authz } from '../../src/decorators/Authz'
import { AuthzServiceProvider } from '../../src/AuthzServiceProvider'
import { authzBlueprint } from '../../src/options/AuthzBlueprint'
import { AbilityMiddleware } from '../../src/middleware/AbilityMiddleware'

describe('@Authz', () => {
  it('declares exactly what its blueprint declares', () => {
    // A module is enabled by its decorator or by its blueprint, and the two must do the same thing.
    // The blueprint is the source of truth; the decorator clones it and overrides its own bucket.
    @Authz()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.providers).toContain(AuthzServiceProvider)
    // The blueprint is deep-cloned, so the meta entry is a copy; what must survive is the class it
    // points at, which is what the kernel resolves.
    expect(blueprint.stone.kernel.middleware).toEqual([
      expect.objectContaining({ module: AbilityMiddleware, isClass: true })
    ])
    expect(blueprint.stone.authz).toEqual(authzBlueprint.stone.authz)
  })

  it('carries the options it is given, over the blueprint defaults', () => {
    @Authz({ strict: true })
    class Application {}

    expect((getBlueprint(Application, { stone: {} }) as any).stone.authz).toEqual({ strict: true })
  })

  it('does not leak between two decorated applications, nor mutate the shared constant', () => {
    // Sharing the exported constant would let one application's options bleed into another's, which
    // only shows up in a monorepo running several apps from one build.
    @Authz({ strict: true })
    class First {}

    @Authz({ strict: false })
    class Second {}

    expect((getBlueprint(First, { stone: {} }) as any).stone.authz.strict).toBe(true)
    expect((getBlueprint(Second, { stone: {} }) as any).stone.authz.strict).toBe(false)
    expect(authzBlueprint.stone.authz).not.toHaveProperty('strict')
  })
})
