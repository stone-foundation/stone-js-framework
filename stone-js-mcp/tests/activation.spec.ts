import { Mcp } from '../src/decorators/Mcp'
import { getBlueprint } from '@stone-js/core'
import { McpHandler } from '../src/McpHandler'
import { mcpBlueprint } from '../src/options/McpBlueprint'
import { DEFAULT_MCP_PATH, MCP_ROUTE_NAME } from '../src/constants'
import { McpRouteMiddleware, MetaMcpRouteMiddleware } from '../src/middleware/McpRouteMiddleware'

/** A blueprint that records what was added to it, as the build phase would. */
const recordingBlueprint = (config: Record<string, unknown> = {}): any => {
  const added: Record<string, unknown[]> = {}

  return {
    added,
    get: (key: string, fallback?: unknown) => (key === 'stone.mcp' ? config : fallback),
    add: (key: string, values: unknown[]) => {
      added[key] = [...(added[key] ?? []), ...values]
    }
  }
}

const runRouteMiddleware = async (blueprint: any): Promise<any> =>
  await McpRouteMiddleware({ blueprint, modules: [] } as any, (async () => blueprint) as any)

describe('activating the module', () => {
  it('contributes the endpoint, declaratively', () => {
    @Mcp()
    class Application {}

    expect(getBlueprint(Application)?.stone?.blueprint?.middleware).toEqual([MetaMcpRouteMiddleware])
  })

  it('carries the decorator options into the config bucket', () => {
    @Mcp({ path: '/agent', instructions: 'Tools for notes.' })
    class Application {}

    expect(getBlueprint(Application)?.stone?.mcp).toEqual({ path: '/agent', instructions: 'Tools for notes.' })
  })

  it('leaves the shared blueprint alone, so one application cannot configure another', () => {
    // The module's blueprint is imported once per process. An application that mutated it would leak
    // its options into every other one built in the same process, tests and a monorepo build
    // included.
    @Mcp({ path: '/agent' })
    class Application {}

    expect(getBlueprint(Application)?.stone?.mcp?.path).toBe('/agent')
    expect(mcpBlueprint.stone.mcp).toEqual({})
  })

  it('says the same thing as registering the blueprint', () => {
    // The two activation paths are the same declaration: a decorator, or the blueprint, never a
    // third helper that could drift from either.
    @Mcp()
    class Application {}

    expect(getBlueprint(Application)?.stone?.blueprint?.middleware)
      .toEqual(mcpBlueprint.stone.blueprint?.middleware)
  })
})

describe('the endpoint the module registers', () => {
  it('is one POST route, on the array the router scans', async () => {
    // A route, not a socket and not a stream. The path is read after everything has been collected,
    // which is why this is a build-phase middleware rather than a constant on the blueprint.
    const blueprint = recordingBlueprint()

    await runRouteMiddleware(blueprint)

    expect(blueprint.added['stone.router.definitions']).toEqual([{
      name: MCP_ROUTE_NAME,
      path: DEFAULT_MCP_PATH,
      method: 'POST',
      handler: { module: McpHandler, action: 'handle', isClass: true }
    }])
  })

  it('is served where the application put it', async () => {
    const blueprint = recordingBlueprint({ path: '/agent/mcp' })

    await runRouteMiddleware(blueprint)

    expect(blueprint.added['stone.router.definitions'][0].path).toBe('/agent/mcp')
  })

  it('is protected like any other route, by what the application declares on it', async () => {
    // This module invents no options for guarding its endpoint. A second permission model would be a
    // second thing to keep in step with the first.
    const blueprint = recordingBlueprint({
      route: { auth: true, rateLimit: { max: 60, window: 60, by: 'user' } }
    })

    await runRouteMiddleware(blueprint)

    expect(blueprint.added['stone.router.definitions'][0]).toMatchObject({
      auth: true,
      rateLimit: { max: 60, window: 60, by: 'user' }
    })
  })

  it('never lets the declared route displace what makes it the endpoint', async () => {
    // Path, method and handler are what this route *is*. Everything else is the application's.
    const blueprint = recordingBlueprint({
      path: '/agent',
      route: { path: '/elsewhere', method: 'GET', handler: 'something-else' }
    })

    await runRouteMiddleware(blueprint)

    expect(blueprint.added['stone.router.definitions'][0]).toMatchObject({
      path: '/agent',
      method: 'POST',
      handler: { module: McpHandler, action: 'handle', isClass: true }
    })
  })

  it('runs late enough to read configuration, and returns what the phase built', async () => {
    const blueprint = recordingBlueprint()

    expect(await runRouteMiddleware(blueprint)).toBe(blueprint)
    expect(MetaMcpRouteMiddleware.priority).toBe(5)
  })
})
