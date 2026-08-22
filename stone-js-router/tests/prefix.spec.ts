import { Router } from '../src/Router'
import { routerBlueprint } from '../src/options/RouterBlueprint'

const makeEvent = (pathname: string): any => ({
  url: new URL(`http://localhost${pathname}`),
  host: 'localhost',
  method: 'GET',
  pathname,
  decodedPathname: pathname,
  query: new URLSearchParams(),
  isMethod: (m: string) => m === 'GET',
  getUri: (withDomain: boolean) => (withDomain ? `localhost${pathname}` : pathname),
  setRouteResolver: () => {}
})

const prefixedRouter = (): Router => Router.create({
  ...routerBlueprint.stone.router,
  prefix: '/v1',
  definitions: [
    { path: '/tasks', method: 'GET', name: 'tasks', handler: () => ({} as any) },
    { path: '/health', method: 'GET', name: 'health', prefix: false, handler: () => ({} as any) },
    { path: '/beta/tasks', method: 'GET', name: 'beta', prefix: '/v2', handler: () => ({} as any) }
  ]
} as any)

describe('a route that must not move with the API version', () => {
  it('escapes the global prefix with prefix: false', async () => {
    // A probe is asked by a load balancer that knows no version: under `/v1` it answers 404 where
    // the platform looks, and moves the day the API version does. A probe that changes address is a
    // probe that goes dark.
    const router = prefixedRouter()

    await expect(router.findRoute(makeEvent('/health'))).resolves.toBeDefined()
    await expect(router.findRoute(makeEvent('/v1/health'))).rejects.toThrow()
  })

  it('leaves every unmarked route under the global prefix, as before', async () => {
    const router = prefixedRouter()

    await expect(router.findRoute(makeEvent('/v1/tasks'))).resolves.toBeDefined()
    await expect(router.findRoute(makeEvent('/tasks'))).rejects.toThrow()
  })

  it('lets a route replace the prefix with its own, per-route wins', async () => {
    // The same rule as `strict` and `protocolPolicy`: the route's value wins, the global is the
    // fallback.
    const router = prefixedRouter()

    await expect(router.findRoute(makeEvent('/v2/beta/tasks'))).resolves.toBeDefined()
  })
})

describe('the generated URL is the canonical served address', () => {
  it('carries the prefix decision and no trailing slash', () => {
    // The two findings together. `/v1/openapi.json/` is a URL a CDN, a cache or a strict gateway may
    // treat as a different resource than `/v1/openapi.json`, and the explorer publishes what
    // `generate` answers.
    const router = prefixedRouter()

    expect(router.generate({ name: 'tasks' })).toBe('/v1/tasks')
    expect(router.generate({ name: 'health' })).toBe('/health')
  })

  it('keeps the root as the root', () => {
    const router = Router.create({
      ...routerBlueprint.stone.router,
      definitions: [{ path: '/', method: 'GET', name: 'home', handler: () => ({} as any) }]
    } as any)

    expect(router.generate({ name: 'home' })).toBe('/')
  })
})
