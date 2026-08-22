import { Router } from '../src/Router'
import { routerBlueprint } from '../src/options/RouterBlueprint'

const makeEvent = (pathname: string, over: any = {}): any => {
  let resolver: (() => any) | undefined
  return {
    url: new URL(`http://localhost${pathname}`),
    host: 'localhost',
    method: 'GET',
    pathname,
    decodedPathname: pathname,
    query: new URLSearchParams(),
    isMethod: (m: string) => m === 'GET',
    getUri: (withDomain: boolean) => (withDomain ? `localhost${pathname}` : pathname),
    setRouteResolver: (r: () => any) => { resolver = r },
    getRoute: () => resolver?.(),
    ...over
  }
}

const makeRouter = (): Router => Router.create({
  ...routerBlueprint.stone.router,
  definitions: [
    { path: '/orgs/:orgCode/teams/:teamId', method: 'GET', name: 'teams', handler: () => ({} as any) },
    { path: '/plain', method: 'GET', handler: () => ({} as any) }
  ]
} as any)

describe('reading a parameter before the route is resolved', () => {
  it('answers from a kernel or group middleware, where no route exists yet', async () => {
    // The three-line dance this replaces: find the route, bind it, read it. A group middleware
    // guarding /orgs/:orgCode needs the code before routing has happened.
    const router = makeRouter()

    await expect(router.findParam(makeEvent('/orgs/acme/teams/7'), 'orgCode')).resolves.toBe('acme')
    await expect(router.findParam(makeEvent('/orgs/acme/teams/7'), 'teamId')).resolves.toBe('7')
  })

  it('answers the fallback when no route matches, because the 404 is not the caller decision', async () => {
    // A locale middleware peeking at :lang on a request that will 404 must not preempt the router's
    // own answer: a parameter of a route that does not exist is simply absent.
    const router = makeRouter()

    await expect(router.findParam(makeEvent('/nowhere'), 'orgCode', 'none')).resolves.toBe('none')
    await expect(router.findParam(makeEvent('/nowhere'), 'orgCode')).resolves.toBeUndefined()
  })

  it('answers the fallback when the route has no such parameter', async () => {
    const router = makeRouter()

    await expect(router.findParam(makeEvent('/plain'), 'orgCode', 'none')).resolves.toBe('none')
  })

  it('matches once, however many parameters are read', async () => {
    // The memo is per event: a guard reading orgCode and a locale middleware reading lang must not
    // pay two matches for one request.
    const router = makeRouter()
    const event = makeEvent('/orgs/acme/teams/7')
    const first = await router.getBoundRoute(event)
    const second = await router.getBoundRoute(event)

    expect(second).toBe(first)
  })

  it('reuses the event own route after routing, instead of matching again', async () => {
    const router = makeRouter()
    const event = makeEvent('/orgs/acme/teams/7')
    const resolved = await router.findRoute(event)
    event.setRouteResolver(() => resolved)

    await expect(router.getBoundRoute(event)).resolves.toBe(resolved)
    await expect(router.findParam(event, 'orgCode')).resolves.toBe('acme')
  })

  it('peeks without routing: nothing emitted, the current route untouched', async () => {
    // Reading a parameter is not routing. A listener on ROUTING must not fire twice because a
    // middleware looked, and the router's own resolution must proceed as if nobody had.
    const emitted: string[] = []
    const router = Router.create({
      ...routerBlueprint.stone.router,
      eventEmitter: { emit: async (e: any) => { emitted.push(e.type) }, on: () => {}, off: () => {} },
      definitions: [{ path: '/orgs/:orgCode', method: 'GET', handler: () => ({} as any) }]
    } as any)

    await router.findParam(makeEvent('/orgs/acme'), 'orgCode')

    expect(emitted).toEqual([])
    expect(router.getParam('orgCode')).toBeUndefined() // the dispatch-time reader still sees nothing
  })

  it('still throws for what is not a missed match', async () => {
    // Only RouteNotFoundError means "absent". A broken matcher is a bug, and the fallback must not
    // swallow it.
    const router = makeRouter()
    const event = makeEvent('/orgs/acme/teams/7', { getUri: undefined })

    await expect(router.findParam(event, 'orgCode', 'none')).rejects.toThrow()
  })
})
