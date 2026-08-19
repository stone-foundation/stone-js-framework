import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { Resources } from '../../src/decorators/Resources'
import { defineResource } from '../../src/defineResource'
import { resourcesBlueprint } from '../../src/options/ResourcesBlueprint'
import { ResourceRouteMiddleware } from '../../src/middleware/ResourceRouteMiddleware'

const userResource = defineResource<{ id: number }>((u) => ({ id: u.id }))

describe('@Resources', () => {
  it('declares exactly what its blueprint declares', () => {
    @Resources()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    // The blueprint is deep-cloned, so the meta entry is a copy; the class it points at is what runs.
    expect(blueprint.stone.router.middleware).toEqual([
      expect.objectContaining({ module: ResourceRouteMiddleware, isClass: true })
    ])
    expect(blueprint.stone.resources).toEqual({})
  })

  it('carries the registry it is given, without touching the shared constant', () => {
    @Resources({ registry: { user: userResource } })
    class Application {}

    expect((getBlueprint(Application, { stone: {} }) as any).stone.resources.registry).toHaveProperty('user')
    expect(resourcesBlueprint.stone.resources).toEqual({})
  })
})
