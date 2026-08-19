import { OpenApiHandler } from '../src/OpenApiHandler'
import { openApiBlueprint } from '../src/options/OpenApiBlueprint'
import { MetaOpenApiRoutesMiddleware, OpenApiRoutesMiddleware } from '../src/middleware/OpenApiRoutesMiddleware'

/** A blueprint stub carrying only what the middleware touches: `get` and the appending `add`. */
const blueprintStub = (openapi: Record<string, unknown>): any => {
  const store: Record<string, unknown> = { 'stone.openapi': openapi }
  return {
    get: (key: string, fallback?: unknown) => store[key] ?? fallback,
    add: (key: string, value: unknown[]) => {
      store[key] = [...(store[key] as unknown[] ?? []), ...value]
    }
  }
}

const runMiddleware = async (openapi: Record<string, unknown>): Promise<any> => {
  const blueprint = blueprintStub(openapi)
  return await OpenApiRoutesMiddleware(
    { blueprint, modules: [] } as any,
    (async (context: any) => context.blueprint) as any
  )
}

describe('openApiBlueprint', () => {
  it('is a single opt-in line, like the other module blueprints', () => {
    expect(openApiBlueprint.stone.openapi).toEqual({})
    expect(openApiBlueprint.stone.blueprint?.middleware).toEqual([MetaOpenApiRoutesMiddleware])
  })

  it('passes the blueprint through, as a build-phase middleware must', async () => {
    // A build-phase middleware that returns its own value replaces the blueprint for every later
    // phase, which is exactly how an application ends up reading its configuration off something
    // that is not a blueprint. This one returns what `next` returned.
    const blueprint = blueprintStub({})
    const returned = await OpenApiRoutesMiddleware(
      { blueprint, modules: [] } as any,
      (async (context: any) => context.blueprint) as any
    )

    expect(returned).toBe(blueprint)
  })

  it('registers both routes with zero configuration', async () => {
    const blueprint = await runMiddleware({})
    const definitions = blueprint.get('stone.router.definitions', [])

    expect(definitions).toEqual([
      expect.objectContaining({ path: '/openapi.json', method: 'GET', name: 'openapi.spec' }),
      expect.objectContaining({ path: '/docs', method: 'GET', name: 'openapi.docs' })
    ])
    expect(definitions[0].handler).toEqual({ module: OpenApiHandler, action: 'spec', isClass: true })
    expect(definitions[1].handler).toEqual({ module: OpenApiHandler, action: 'docs', isClass: true })
  })

  it('honours configured paths', async () => {
    const blueprint = await runMiddleware({ specPath: '/v1/contract.json', docsPath: '/v1/explorer' })
    const paths = blueprint.get('stone.router.definitions', []).map((d: any) => d.path)

    expect(paths).toEqual(['/v1/contract.json', '/v1/explorer'])
  })

  it('serves the contract alone when the explorer is disabled', async () => {
    // `docsPath: false` is what you want when the explorer is hosted elsewhere, or must not be public.
    const blueprint = await runMiddleware({ docsPath: false })
    const definitions = blueprint.get('stone.router.definitions', [])

    expect(definitions).toHaveLength(1)
    expect(definitions[0].name).toBe('openapi.spec')
  })
})
