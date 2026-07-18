import { Route } from '../src/Route'
import { Router } from '../src/Router'
import { RouteMapper } from '../src/RouteMapper'
import { CallableDispatcher } from '../src/dispatchers/CallableDispatcher'
import { RouteCollection } from '../src/RouteCollection'
import { RouterError } from '../src/errors/RouterError'
import { routerBlueprint } from '../src/options/RouterBlueprint'
import { pathRegex, uriRegex, toNonCapturingSource } from '../src/utils'
import { uriMatcher, hostMatcher, methodMatcher, protocolMatcher } from '../src/matchers'
import { RouteNotFoundError } from '../src/errors/RouteNotFoundError'

/**
 * End-to-end, behavioural tests for the 0.8.0 hardening pass. These exercise the
 * real pattern -> regex -> match/bind/generate chain (no mocking of the matching
 * internals), covering the security and correctness fixes the previous, heavily
 * mocked suite could not catch.
 */

const makeEvent = (over: any = {}): any => ({
  url: new URL(`http://localhost${String(over.pathname ?? '/')}`),
  host: 'localhost',
  method: 'GET',
  query: new URLSearchParams(),
  isMethod: (m: string) => m === (over.method ?? 'GET'),
  getUri: (withDomain: boolean) => (withDomain ? `localhost${String(over.pathname ?? '/')}` : String(over.pathname ?? '/')),
  ...over
})

describe('Router hardening (0.8.0)', () => {
  describe('P0.1 — ReDoS: catch-all patterns are linear', () => {
    it('resists pathological input in bounded (linear) time', () => {
      const re = pathRegex({ path: '/docs/:slug*', strict: false })
      // A greedy `.+` default made this input exponential (12 s at ~30 segments).
      // The linear `[^/]+` default keeps it flat even at 2000 segments.
      const input = '/docs/' + 'a/'.repeat(2000) + '\n'
      const start = process.hrtime.bigint()
      re.test(input)
      const ms = Number(process.hrtime.bigint() - start) / 1e6
      expect(ms).toBeLessThan(50)
    })

    it('still matches legitimate catch-all paths', () => {
      const re = pathRegex({ path: '/docs/:slug*', strict: false })
      expect(re.test('/docs/a/b/c')).toBe(true)
      expect(re.test('/docs')).toBe(true)
    })
  })

  describe('P1.1 — parameter binding is immune to user capture groups', () => {
    it('binds by named group, ignoring sub-groups inside a user rule', async () => {
      const route = Route.create({ method: 'GET', path: '/files/:range((\\d+)-(\\d+))/:name', handler: () => ({} as any) })
      route.setMatchers([])
      await route.bind(makeEvent({ pathname: '/files/10-20/report' }))
      expect(route.getParam('range')).toBe('10-20')
      expect(route.getParam('name')).toBe('report')
    })
  })

  describe('P0.4 — no destructive numeric coercion', () => {
    it('keeps zero-padded and huge ids as raw strings', async () => {
      const route = Route.create({ method: 'GET', path: '/u/:id', handler: () => ({} as any) })
      route.setMatchers([])
      await route.bind(makeEvent({ pathname: '/u/00123' }))
      expect(route.getParam('id')).toBe('00123')

      await route.bind(makeEvent({ pathname: '/u/9007199254740993' }))
      expect(route.getParam('id')).toBe('9007199254740993')
    })
  })

  describe('generate() — encoding and falsy values', () => {
    const route = Route.create({ method: 'GET', path: '/users/:id/posts', handler: () => ({} as any) })

    it('keeps falsy params (0, false, empty)', () => {
      expect(route.generate({ params: { id: 0 } })).toBe('/users/0/posts/')
      expect(route.generate({ params: { id: false } })).toBe('/users/false/posts/')
    })

    it('encodes traversal and fragment/query injection', () => {
      expect(route.generate({ params: { id: '../admin' } })).toBe('/users/..%2Fadmin/posts/')
      expect(route.generate({ params: { id: 'a#b?x=1' } })).toBe('/users/a%23b%3Fx%3D1/posts/')
    })

    it('stringifies extra params into the query', () => {
      expect(route.generate({ params: { id: 7 }, query: { n: 0 } })).toBe('/users/7/posts/?n=0')
    })

    it('preserves slashes in catch-all params but encodes each segment', () => {
      const catchAll = Route.create({ method: 'GET', path: '/docs/:slug*', handler: () => ({} as any) })
      expect(catchAll.generate({ params: { slug: 'a/b c/d' } })).toBe('/docs/a/b%20c/d/')
    })

    it('builds a full URL without corrupting the protocol separator', () => {
      const withDomain = Route.create({ method: 'GET', path: '/users/:id', domain: '{tenant}.example.com', handler: () => ({} as any) })
      expect(withDomain.generate({ params: { tenant: 'acme', id: 5 }, withDomain: true, protocol: 'https' }))
        .toBe('https://acme.example.com/users/5/')
    })

    it('omits the domain when withDomain is false', () => {
      const withDomain = Route.create({ method: 'GET', path: '/users/:id', domain: '{tenant}.example.com', handler: () => ({} as any) })
      expect(withDomain.generate({ params: { tenant: 'acme', id: 5 } })).toBe('/users/5/')
    })

    it('falls back to the route protocol when none is provided', () => {
      const withDomain = Route.create({ method: 'GET', path: '/users/:id', domain: '{tenant}.example.com', handler: () => ({} as any) })
      expect(withDomain.generate({ params: { tenant: 'acme', id: 5 }, withDomain: true })).toBe('http://acme.example.com/users/5/')
    })

    it('supports a static domain (no sub-domain parameter)', () => {
      const staticDomain = Route.create({ method: 'GET', path: '/users/:id', domain: 'example.com', handler: () => ({} as any) })
      expect(staticDomain.generate({ params: { id: 5 }, withDomain: true, protocol: 'https' })).toBe('https://example.com/users/5/')
    })

    it('throws on a missing required parameter', () => {
      expect(() => route.generate({ params: {} })).toThrow(RouterError)
    })

    it('skips absent optional params', () => {
      const opt = Route.create({ method: 'GET', path: '/p/:id?', handler: () => ({} as any) })
      expect(opt.generate({ params: {} })).toBe('/p/')
    })

    it('supports hash formatting', () => {
      expect(route.generate({ params: { id: 1 }, hash: 'top' })).toBe('/users/1/posts/#top')
      expect(route.generate({ params: { id: 1 }, hash: '#top' })).toBe('/users/1/posts/#top')
    })
  })

  describe('Route.getScore — specificity', () => {
    it('ranks static > required > optional > catch-all', () => {
      const staticRoute = Route.create({ method: 'GET', path: '/users/new', handler: () => ({} as any) })
      const required = Route.create({ method: 'GET', path: '/users/:id', handler: () => ({} as any) })
      const optional = Route.create({ method: 'GET', path: '/users/:id?', handler: () => ({} as any) })
      const wildcard = Route.create({ method: 'GET', path: '/users/:rest*', handler: () => ({} as any) })
      expect(staticRoute.getScore()).toBeGreaterThan(required.getScore())
      expect(required.getScore()).toBeGreaterThan(optional.getScore())
      expect(optional.getScore()).toBeGreaterThan(wildcard.getScore())
    })
  })

  describe('exposes precompiled regexes', () => {
    it('returns the compiled URI regex', () => {
      const route = Route.create({ method: 'GET', path: '/x/:id', handler: () => ({} as any) })
      expect(route.getUriRegex()).toBeInstanceOf(RegExp)
    })
  })

  describe('P2.3 — deterministic specificity ordering', () => {
    it('matches the static route over the parametric one regardless of declaration order', () => {
      const collection = RouteCollection.create()
      const dynamic = Route.create({ method: 'GET', path: '/users/:id', handler: () => ({} as any) })
      const staticRoute = Route.create({ method: 'GET', path: '/users/new', handler: () => ({} as any) })
      collection.add(dynamic) // declared first, but less specific
      collection.add(staticRoute)

      const matched = collection.match(makeEvent({ pathname: '/users/new', decodedPathname: '/users/new' }))
      expect(matched).toBe(staticRoute)
    })

    it('always evaluates fallback routes last, even when both match', () => {
      const collection = RouteCollection.create()
      const fallback = Route.create({ method: 'GET', path: '/:rest*', handler: () => ({} as any), fallback: true })
      const normal = Route.create({ method: 'GET', path: '/thing', handler: () => ({} as any) })
      collection.add(fallback) // declared first
      collection.add(normal)

      const matched = collection.match(makeEvent({ pathname: '/thing', decodedPathname: '/thing' }))
      expect(matched).toBe(normal)
    })

    it('evaluates fallback last regardless of declaration order (reverse)', () => {
      const collection = RouteCollection.create()
      const normal = Route.create({ method: 'GET', path: '/item', handler: () => ({} as any) })
      const fallback = Route.create({ method: 'GET', path: '/:rest*', handler: () => ({} as any), fallback: true })
      collection.add(normal) // declared first
      collection.add(fallback)

      const matched = collection.match(makeEvent({ pathname: '/item', decodedPathname: '/item' }))
      expect(matched).toBe(normal)
    })
  })

  describe('P1.6 — duplicate route detection', () => {
    it('throws on a duplicate method + path', () => {
      const collection = RouteCollection.create()
      collection.add(Route.create({ method: 'GET', path: '/dup', handler: () => ({} as any) }))
      expect(() => collection.add(Route.create({ method: 'GET', path: '/dup', handler: () => ({} as any) }))).toThrow(RouterError)
    })

    it('allows an explicit route to supersede an auto-derived internal header route', () => {
      const collection = RouteCollection.create()
      collection.add(Route.create({ method: 'HEAD', path: '/h', handler: () => ({} as any), isInternalHeader: true }))
      expect(() => collection.add(Route.create({ method: 'HEAD', path: '/h', handler: () => ({} as any) }))).not.toThrow()
    })
  })

  describe('P0.2 — URI length bound', () => {
    const makeRouter = (maxUriLength?: number): Router => Router.create({
      ...routerBlueprint.stone.router,
      maxUriLength,
      definitions: [{ path: '/x', method: 'GET', handler: () => ({} as any) }]
    } as any)

    it('rejects an over-long URI before matching', async () => {
      const router = makeRouter(64)
      const longPath = '/' + 'a'.repeat(200)
      await expect(router.findRoute(makeEvent({ pathname: longPath, decodedPathname: longPath }))).rejects.toThrow(RouteNotFoundError)
    })

    it('accepts a URI within the limit', async () => {
      const router = makeRouter(2048)
      const route = await router.findRoute(makeEvent({ pathname: '/x', decodedPathname: '/x' }))
      expect(route).toBeInstanceOf(Route)
    })
  })

  describe('global vs per-route config (protocolPolicy / prefix)', () => {
    const mapper = (opts: any): RouteMapper => RouteMapper.create({
      maxDepth: 5,
      matchers: [uriMatcher, hostMatcher, methodMatcher, protocolMatcher],
      dispatchers: { callable: CallableDispatcher },
      ...opts
    })

    it('applies the global protocolPolicy to every route', () => {
      const [route] = mapper({ protocolPolicy: 'force-https' }).toRoutes([
        { path: '/a', method: 'GET', handler: () => ({} as any) }
      ])
      expect(route.getOption('protocolPolicy')).toBe('force-https')
    })

    it('lets a route override the global protocolPolicy (per-route wins, global is fallback)', () => {
      const routes = mapper({ protocolPolicy: 'force-https' }).toRoutes([
        { path: '/secure', method: 'GET', handler: () => ({} as any) },
        { path: '/open', method: 'GET', protocolPolicy: 'force-http', handler: () => ({} as any) }
      ])
      const byPath = (p: string): Route => routes.find(r => r.getOption('path') === p && r.getOption('method') === 'GET') as Route
      expect(byPath('/secure').getOption('protocolPolicy')).toBe('force-https') // inherits global
      expect(byPath('/open').getOption('protocolPolicy')).toBe('force-http') // per-route wins
    })

    it('applies the global prefix to every route path', () => {
      const [route] = mapper({ prefix: '/api' }).toRoutes([
        { path: '/users', method: 'GET', handler: () => ({} as any) }
      ])
      expect(route.getOption('path')).toBe('/api/users')
    })
  })

  describe('named routes match by path (regression: "name -> 404")', () => {
    it('a route with a name still matches its own path', () => {
      const collection = RouteCollection.create()
      collection.add(Route.create({
        method: 'GET',
        name: 'patate',
        path: '/editions/current/competition/registration',
        handler: () => ({} as any)
      }))
      const matched = collection.match(makeEvent({
        pathname: '/editions/current/competition/registration',
        decodedPathname: '/editions/current/competition/registration'
      }))
      expect(matched.getOption('name')).toBe('patate')
    })
  })

  describe('middleware options & priority', () => {
    const makeRouter = (globalMw: any[], routeMw: any[]): Router => Router.create({
      ...routerBlueprint.stone.router,
      middleware: globalMw,
      definitions: [{ path: '/x', method: 'GET', middleware: routeMw, handler: () => ({} as any) }]
    } as any)

    it('preserves meta-pipe params and priority through gathering', () => {
      const mw = { module: (_e: any, next: any): any => next(_e), params: [{ role: 'admin' }], priority: 1 }
      const router = makeRouter([], [mw])
      const route = router.getRoutes().getRoutes()[0]
      const gathered = router.gatherRouteMiddleware(route)
      expect(gathered).toContainEqual(mw)
      expect((gathered[0] as any).params).toEqual([{ role: 'admin' }])
      expect((gathered[0] as any).priority).toBe(1)
    })

    it('gathers global middleware before route-local middleware', () => {
      const globalMw = (_e: any, next: any): any => next(_e)
      const localMw = (_e: any, next: any): any => next(_e)
      const router = makeRouter([globalMw], [localMw])
      const route = router.getRoutes().getRoutes()[0]
      const gathered = router.gatherRouteMiddleware(route)
      expect(gathered.indexOf(globalMw)).toBeLessThan(gathered.indexOf(localMw))
    })
  })

  describe('P1.3 — navigate() guards Node safely', () => {
    it('throws RouterError (not ReferenceError) outside a browser', () => {
      const router = Router.create({
        ...routerBlueprint.stone.router,
        definitions: []
      } as any)
      expect(() => router.navigate('/x')).toThrow(RouterError)
    })
  })
})

describe('toNonCapturingSource', () => {
  it('rewrites numbered capturing groups', () => {
    expect(toNonCapturingSource('(a)(b)')).toBe('(?:a)(?:b)')
  })

  it('rewrites named capturing groups', () => {
    expect(toNonCapturingSource('(?<year>\\d{4})')).toBe('(?:\\d{4})')
  })

  it('leaves non-capturing groups and lookarounds untouched', () => {
    expect(toNonCapturingSource('(?:x)')).toBe('(?:x)')
    expect(toNonCapturingSource('(?=x)')).toBe('(?=x)')
    expect(toNonCapturingSource('(?<=x)')).toBe('(?<=x)')
    expect(toNonCapturingSource('(?<!x)')).toBe('(?<!x)')
  })

  it('does not touch parentheses inside a character class', () => {
    expect(toNonCapturingSource('[a(b)c]')).toBe('[a(b)c]')
  })

  it('preserves escaped parentheses', () => {
    expect(toNonCapturingSource('\\(literal\\)')).toBe('\\(literal\\)')
  })

  it('handles a malformed named group without a closing bracket', () => {
    expect(toNonCapturingSource('(?<bad')).toBe('(?<bad')
  })

  it('leaves a closed character class followed by a group', () => {
    expect(toNonCapturingSource('[ab](c)')).toBe('[ab](?:c)')
  })

  it('handles a trailing backslash gracefully', () => {
    expect(toNonCapturingSource('abc\\')).toBe('abc\\')
  })
})

describe('uriRegex — static domain (no parameter)', () => {
  it('compiles a bare domain into a suffix pattern', () => {
    const re = uriRegex({ path: '/x', domain: 'example.com', strict: false })
    expect(re.test('example.com/x')).toBe(true)
    expect(re.test('other.com/x')).toBe(false)
  })
})
