import { RateLimitManager } from '../src/RateLimitManager'
import { RateLimitError } from '../src/errors/RateLimitError'
import { MemoryRateLimiter } from '../src/drivers/MemoryRateLimiter'
import { rateLimitBlueprint } from '../src/options/RateLimitBlueprint'
import { ThrottleRouteMiddleware } from '../src/middleware/ThrottleRouteMiddleware'

/**
 * The mapper as the blueprint configures it, so the composition under test is the real one.
 *
 * Routes are looked up by path rather than by position: a declared `GET` is mapped to a `GET` and a
 * `HEAD`, so positions do not line up with the declarations.
 */
const mapRoutes = async (definitions: any[]): Promise<(path: string) => any> => {
  const { RouteMapper } = await import('@stone-js/router')

  const routes = (RouteMapper as any).create({
    maxDepth: 5,
    matchers: [],
    composableProps: rateLimitBlueprint.stone.router?.composableProps,
    dispatchers: { callable: class { static create (): any { return new this() } dispatch (): any {} } }
  }).toRoutes(definitions)

  return (path: string) => {
    const route = routes.find((r: any) => r.getOption('path') === path && r.getOption('method') === 'GET') ??
      routes.find((r: any) => r.getOption('path') === path)

    if (route === undefined) { throw new Error(`No route mapped for ${path}`) }

    return route
  }
}

const enforcerFor = (): ThrottleRouteMiddleware => {
  const manager = RateLimitManager.create()
  manager.register('memory', MemoryRateLimiter.create())

  return new ThrottleRouteMiddleware({
    blueprint: { get: (_key: string, fallback?: unknown) => fallback } as any,
    container: { has: (key: unknown) => key === RateLimitManager, make: () => manager } as any
  })
}

const eventFor = (route: any, body: Record<string, unknown> = {}, address = '1.2.3.4'): any => ({
  ip: address,
  pathname: route.getOption('path'),
  // Throws like the real thing before binding: see ThrottleRouteMiddleware.spec.ts.
  get: () => { throw new Error('Event is not bound') },
  getFromBody: <T>(key: string, fallback?: T) => (body[key] as T) ?? fallback,
  getRoute: () => ({ getOption: <T>(key: string): T | undefined => route.getOption(key) })
})

const next = (async () => ({ setHeader: () => {} })) as any

describe('a budget declared on a group', () => {
  it('composes with the route own budget, group first, through the real mapper', async () => {
    const routeFor = await mapRoutes([{
      path: '/api',
      rateLimit: { max: 100, window: 60, by: 'address' },
      children: [{ path: '/notes', method: 'GET', rateLimit: { max: 5, window: 60, by: 'address' }, handler: () => ({}) }]
    }])
    const route = routeFor('/api/notes')

    // Both promises survive: the router flattens them parent-first because the module declared
    // `rateLimit` composable.
    expect(route.getOption('rateLimit')).toEqual([{ max: 100, window: 60, by: 'address' }, { max: 5, window: 60, by: 'address' }])
  })

  it('holds each child to the group budget and to its own', async () => {
    // Unscoped, a group rule is a budget applied to each child separately: the group says "no route
    // under me allows more than three", and the child says "and this one allows two".
    const routeFor = await mapRoutes([{
      path: '/api',
      rateLimit: { max: 3, window: 60, by: 'address' },
      children: [
        { path: '/notes', method: 'GET', rateLimit: { max: 2, window: 60, by: 'address' }, handler: () => ({}) },
        { path: '/tags', method: 'GET', handler: () => ({}) }
      ]
    }])
    const notes = routeFor('/api/notes')
    const tags = routeFor('/api/tags')

    const middleware = enforcerFor()

    await middleware.handle(eventFor(notes), next)
    await middleware.handle(eventFor(notes), next)

    // The route's own budget of two is what refuses the third, and it says so.
    await expect(middleware.handle(eventFor(notes), next)).rejects.toThrow(expect.objectContaining({ limit: 2 }))

    // The sibling declared nothing and inherits the group's three, counted on its own.
    await middleware.handle(eventFor(tags), next)
    await middleware.handle(eventFor(tags), next)
    await middleware.handle(eventFor(tags), next)

    await expect(middleware.handle(eventFor(tags), next)).rejects.toThrow(expect.objectContaining({ limit: 3 }))
  })

  it('shares one ceiling across the group when the rule names a scope', async () => {
    // The router copies a group's rule onto each child and cannot say, at enforcement time, which
    // ancestor a flattened rule came from. So a ceiling spanning several routes is named rather than
    // inferred: `scope` is the bucket the rule counts in, and every rule naming it counts there.
    const routeFor = await mapRoutes([{
      path: '/api',
      rateLimit: { max: 3, window: 60, scope: 'api', by: 'address' },
      children: [
        { path: '/notes', method: 'GET', handler: () => ({}) },
        { path: '/tags', method: 'GET', handler: () => ({}) }
      ]
    }])
    const notes = routeFor('/api/notes')
    const tags = routeFor('/api/tags')

    const middleware = enforcerFor()

    await middleware.handle(eventFor(notes), next)
    await middleware.handle(eventFor(tags), next)
    await middleware.handle(eventFor(notes), next)

    // Three requests across two routes: the shared ceiling is spent, whichever route is asked next.
    await expect(middleware.handle(eventFor(tags), next)).rejects.toThrow(expect.objectContaining({ limit: 3 }))
  })

  it('counts a refused request against a shared ceiling too', async () => {
    // A ceiling that only counted what it let through would be no ceiling at all: a caller could spend
    // it entirely on refusals and keep going.
    const routeFor = await mapRoutes([{
      path: '/api',
      rateLimit: { max: 2, window: 60, scope: 'api', by: 'address' },
      children: [{ path: '/notes', method: 'GET', rateLimit: { max: 1, window: 60, by: 'address' }, handler: () => ({}) }]
    }])
    const route = routeFor('/api/notes')

    const middleware = enforcerFor()

    await middleware.handle(eventFor(route), next)

    // The route's own budget of one refuses this, and the ceiling still counts the attempt: two.
    await expect(middleware.handle(eventFor(route), next)).rejects.toThrow(expect.objectContaining({ limit: 1 }))

    // Which is why the next refusal comes from the ceiling, not from the route.
    await expect(middleware.handle(eventFor(route), next)).rejects.toThrow(expect.objectContaining({ limit: 2 }))
  })

  it('keeps each budget in its own bucket, so neither spends the other allowance', async () => {
    // A group's generous ceiling and a route's strict limit are two different promises. Counted in one
    // bucket, the strict one would be exhausted by the group's own counting on the very first request,
    // and the limit that fired would be neither of the two that were declared.
    const routeFor = await mapRoutes([{
      path: '/api',
      rateLimit: { max: 100, window: 60, by: 'address' },
      children: [{ path: '/notes', method: 'GET', rateLimit: { max: 3, window: 60, by: 'address' }, handler: () => ({}) }]
    }])
    const route = routeFor('/api/notes')

    const middleware = enforcerFor()

    await middleware.handle(eventFor(route), next)
    await middleware.handle(eventFor(route), next)
    await middleware.handle(eventFor(route), next)

    await expect(middleware.handle(eventFor(route), next)).rejects.toThrow(
      expect.objectContaining({ limit: 3 })
    )
  })

  it('lets a child throttle by subject under an address-wide group ceiling', async () => {
    // The shape a real application declares: a platform-wide ceiling per machine, and a strict budget
    // per mailbox on the route that sends mail.
    const routeFor = await mapRoutes([{
      path: '/api',
      rateLimit: { max: 50, window: 60, by: 'address' },
      children: [{
        path: '/auth/code',
        method: 'POST',
        rateLimit: { max: 1, window: 60, by: 'email', backstop: false },
        handler: () => ({})
      }]
    }])
    const route = routeFor('/api/auth/code')

    const middleware = enforcerFor()

    await middleware.handle(eventFor(route, { email: 'a@x.test' }), next)

    await expect(middleware.handle(eventFor(route, { email: 'a@x.test' }), next)).rejects.toThrow(RateLimitError)
    await expect(middleware.handle(eventFor(route, { email: 'b@x.test' }), next)).resolves.toBeDefined()
  })
})
