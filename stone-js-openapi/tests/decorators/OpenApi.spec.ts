import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { OpenApi } from '../../src/decorators/OpenApi'
import { openApiBlueprint } from '../../src/options/OpenApiBlueprint'
import { OpenApiRoutesMiddleware } from '../../src/middleware/OpenApiRoutesMiddleware'

describe('@OpenApi', () => {
  it('is the declarative half of the pair, registering the same middleware as the blueprint', () => {
    // A module is enabled by its decorator or by its blueprint, and the two must do the same thing.
    @OpenApi()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    // The blueprint is deep-cloned, so the meta entry is a copy; what must survive is the module it
    // points at, which is what the builder runs.
    expect(blueprint.stone.blueprint.middleware).toEqual([
      expect.objectContaining({ module: OpenApiRoutesMiddleware })
    ])
    expect(blueprint.stone.openapi).toEqual({})
  })

  it('carries the options it is given', () => {
    @OpenApi({ info: { title: 'Tasks', version: '1.0.0' }, docsPath: false })
    class Application {}

    expect((getBlueprint(Application, { stone: {} }) as any).stone.openapi).toEqual({
      info: { title: 'Tasks', version: '1.0.0' },
      docsPath: false
    })
  })

  it('does not leak between two decorated applications, nor mutate the shared constant', () => {
    // The decorator derives its blueprint from the exported constant; sharing the object or the
    // middleware array would let one application's paths bleed into another's, which only shows up
    // in a monorepo running several apps from one build.
    @OpenApi({ specPath: '/a.json' })
    class First {}

    @OpenApi({ specPath: '/b.json' })
    class Second {}

    expect((getBlueprint(First, { stone: {} }) as any).stone.openapi.specPath).toBe('/a.json')
    expect((getBlueprint(Second, { stone: {} }) as any).stone.openapi.specPath).toBe('/b.json')
    expect(openApiBlueprint.stone.openapi).toEqual({})
    expect((getBlueprint(First, { stone: {} }) as any).stone.blueprint.middleware)
      .not.toBe(openApiBlueprint.stone.blueprint?.middleware)
  })
})
