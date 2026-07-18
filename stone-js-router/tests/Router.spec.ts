import { Route } from '../src/Route'
import { Router } from '../src/Router'
import { GET, POST } from '../src/constants'
import { RouteEvent } from '../src/events/RouteEvent'
import { RouterError } from '../src/errors/RouterError'
import { RouteCollection } from '../src/RouteCollection'
import type { DependencyResolver } from '../src/declarations'
import { RouteNotFoundError } from '../src/errors/RouteNotFoundError'

vi.mock('../src/Route', () => ({
  Route: {
    create: vi.fn()
  }
}))

vi.mock('../src/RouteMapper', () => ({
  RouteMapper: {
    create: vi.fn(() => ({
      toRoutes: vi.fn(() => [Route.create({} as any)])
    }))
  }
}))

describe('Router', () => {
  let router: Router
  let eventEmitter: any
  let routeCollection: any
  let dependencyResolver: DependencyResolver

  beforeEach(() => {
    dependencyResolver = {
      resolve: vi.fn(),
      alias: vi.fn(),
      instance: vi.fn(),
      has: vi.fn(() => true)
    } as unknown as DependencyResolver

    eventEmitter = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    routeCollection = {
      add: vi.fn(),
      match: vi.fn(),
      getByName: vi.fn(),
      hasNamedRoute: vi.fn(),
      dump: vi.fn(() => []),
      setOutgoingResponseResolver: vi.fn()
    }

    RouteCollection.create = vi.fn(() => routeCollection)

    router = Router.create({
      eventEmitter,
      dependencyResolver,
      definitions: [],
      maxDepth: 3,
      matchers: [],
      dispatchers: {} as any
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a Router instance', () => {
    expect(router).toBeInstanceOf(Router)
  })

  it('should create a route group', () => {
    router.group('/api', { strict: true })
    // @ts-expect-error
    expect(router.groupDefinition).toEqual({ strict: true, path: '/api' })
  })

  it('should remove a route group', () => {
    router.group('/api', { strict: true })
    // @ts-expect-error
    expect(router.groupDefinition).toEqual({ strict: true, path: '/api' })
    router.noGroup()
    // @ts-expect-error
    expect(router.groupDefinition).toBeUndefined()
  })

  describe('should register http verbs route', () => {
    const methods: Array<[string, (path: any, def: any) => any, string[]]> = [
      ['GET', (path, def) => router.get(path, def), ['GET']],
      ['HEAD (internal)', (path, def) => router.get(path, def), ['HEAD']],
      ['POST', (path, def) => router.post(path, def), ['POST']],
      ['PUT', (path, def) => router.put(path, def), ['PUT']],
      ['PATCH', (path, def) => router.patch(path, def), ['PATCH']],
      ['DELETE', (path, def) => router.delete(path, def), ['DELETE']],
      ['OPTIONS', (path, def) => router.options(path, def), ['OPTIONS']],
      ['ANY', (path, def) => router.any(path, def), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']]
    ]

    for (const [label, fn] of methods) {
      it(`should register ${label} route`, () => {
        fn('/test', { action: vi.fn() })
        expect(routeCollection.add).toHaveBeenCalled()
      })
    }
  })

  it('should register a fallback route with fallback flag', () => {
    router.fallback(vi.fn())
    expect(routeCollection.add).toHaveBeenCalled()
  })

  it('should use page() alias of get()', () => {
    router.page('/test', { action: vi.fn(), component: vi.fn() })
    expect(routeCollection.add).toHaveBeenCalled()
  })

  it('should use add() alias of get()', () => {
    router.add('/test', { action: vi.fn() })
    expect(routeCollection.add).toHaveBeenCalled()
  })

  it('should call match() directly and apply group definition if set', () => {
    router.group('/api', { strict: true })
    router.match('/match', { action: vi.fn() }, [GET])
    expect(routeCollection.add).toHaveBeenCalled()
  })

  it('should call match() directly and apply definition with handler', () => {
    router.match('/match', vi.fn(), [GET])
    expect(routeCollection.add).toHaveBeenCalled()
  })

  it('should define a set of routes via define()', () => {
    const handler = vi.fn()
    const def = [{ path: '/hello', method: GET, handler }]
    router.define(def)

    expect(routeCollection.add).toHaveBeenCalled()
  })

  it('should set a valid route collection instance with setRoutes()', () => {
    const customCollection = new RouteCollection()

    router.setRoutes(customCollection)

    expect(router.getRoutes()).toBe(customCollection)
  })

  it('should throw RouterError when setting invalid RouteCollection', () => {
    expect(() => router.setRoutes({} as any)).toThrow(RouterError)
  })

  it('should merge and update RouterOptions via configure()', () => {
    const def = [{ path: '/new', method: GET, handler: vi.fn() }]
    router.configure({ definitions: def, maxDepth: 10 })
    expect(RouteCollection.create).toHaveBeenCalled()
  })

  it('should use global middleware with use()', () => {
    const mw = vi.fn()
    router.use(mw)
    // @ts-expect-error
    expect(router.routerOptions.middleware).toContain(mw)
  })

  it('should use multiple middleware with use()', () => {
    const mw1 = vi.fn(); const mw2 = vi.fn()
    router.use([mw1, mw2])
    // @ts-expect-error
    expect(router.routerOptions.middleware).toEqual(expect.arrayContaining([mw1, mw2]))
  })

  it('should attach middleware to named routes using useOn()', () => {
    const mw = vi.fn()
    const route = { addMiddleware: vi.fn() }

    const def = [{ name: 'named', path: '/x', method: GET, handler: vi.fn(), middleware: [] }]
    router.configure({ definitions: def, maxDepth: 5 })

    routeCollection.getByName = vi.fn(() => route)
    router.useOn('named', mw)

    expect(def[0].middleware).toContain(mw)
    expect(route.addMiddleware).toHaveBeenCalledWith(mw)
  })

  it('should call addMiddleware on all matched route names in useOn()', () => {
    const mw = vi.fn()
    const route = { addMiddleware: vi.fn() }
    const def = [
      { name: 'r1', path: '/r1', method: GET, handler: vi.fn(), middleware: [] },
      { name: 'r2', path: '/r2', method: POST, handler: vi.fn() }
    ]
    router.configure({ definitions: def, maxDepth: 10 })
    routeCollection.getByName = vi.fn(() => route)

    router.useOn(['r1', 'r2'], mw)

    expect(def[0].middleware).toContain(mw)
    expect(def[1].middleware).toContain(mw)
    expect(route.addMiddleware).toHaveBeenCalledTimes(2)
  })

  it('should subscribe and unsubscribe to an event using on() and off()', () => {
    const listener = vi.fn()
    router.on(RouteEvent.ROUTED, listener)
    router.off(RouteEvent.ROUTED, listener)
    expect(eventEmitter.on).toHaveBeenCalledWith(RouteEvent.ROUTED, listener)
  })

  it('should dispatch() an event and return response', async () => {
    const route = {
      bind: vi.fn(),
      setDispatchers: vi.fn().mockReturnThis(),
      setResolver: vi.fn().mockReturnThis(),
      run: vi.fn().mockResolvedValue('done')
    }

    routeCollection.match = vi.fn(() => route)
    const event = { setRouteResolver: vi.fn() } as any

    const response = await router.dispatch(event)

    expect(response).toBe('done')
    expect(event.setRouteResolver).toHaveBeenCalled()
    expect(route.bind).toHaveBeenCalledWith(event)
  })

  it('should dispatch to a named route using respondWithRouteName()', async () => {
    const route = {
      bind: vi.fn(),
      setDispatchers: vi.fn().mockReturnThis(),
      setResolver: vi.fn().mockReturnThis(),
      run: vi.fn().mockResolvedValue('ok')
    }

    routeCollection.getByName = vi.fn(() => route)

    const event = { setRouteResolver: vi.fn() } as any

    const response = await router.respondWithRouteName(event, 'myRoute')
    expect(response).toBe('ok')
  })

  it('should throw RouteNotFoundError if named route is missing', async () => {
    routeCollection.getByName = vi.fn(() => undefined)
    const event = { setRouteResolver: vi.fn() } as any

    await expect(router.respondWithRouteName(event, 'missing')).rejects.toThrow(RouteNotFoundError)
  })

  describe('Navigation and URL generation', () => {
    beforeEach(() => {
      // Fake browser environment
      global.window = {
        history: {
          pushState: vi.fn(),
          replaceState: vi.fn()
        } as any,
        dispatchEvent: vi.fn()
      } as any
      global.CustomEvent = vi.fn().mockImplementation((name, opts) => ({ name, ...opts }))
    })

    afterEach(() => {
      // @ts-expect-error
      delete global.window
      // @ts-expect-error
      delete global.CustomEvent
    })

    it('should call pushState on navigate(path)', () => {
      router.navigate('/home')
      expect(window.history.pushState).toHaveBeenCalledWith({ path: '/home' }, '', '/home')
    })

    it('should call replaceState when replace = true', () => {
      router.navigate('/replaced', true)
      expect(window.history.replaceState).toHaveBeenCalledWith({ path: '/replaced' }, '', '/replaced')
    })

    it('should call navigate() using name-based route generation', () => {
      const route = { generate: vi.fn(() => '/generated') }
      routeCollection.getByName = vi.fn(() => route)

      router.navigate({ name: 'myRoute' })

      expect(window.history.pushState).toHaveBeenCalledWith({ name: 'myRoute', path: '/generated' }, '', '/generated')
    })

    it('should throw RouterError if navigate() called outside browser', () => {
      // @ts-expect-error
      global.window = undefined
      expect(() => router.navigate('/fail')).toThrow(RouterError)
    })

    it('should generate URL using generate()', () => {
      const route = { generate: vi.fn(() => '/url') }
      routeCollection.getByName = vi.fn(() => route)
      const url = router.generate({ name: 'route' })
      expect(url).toBe('/url')
    })

    it('should throw RouteNotFoundError on generate() if route missing', () => {
      routeCollection.getByName = vi.fn(() => undefined)
      expect(() => router.generate({ name: 'missing' })).toThrow(RouteNotFoundError)
    })
  })

  describe('Route access and getters', () => {
    beforeEach(() => {
      // @ts-expect-error
      router.currentRoute = {
        params: { id: 42 },
        getParam: vi.fn((name, fallback) => (name === 'id' ? 42 : fallback)) as any,
        getOption: vi.fn(() => 'current')
      }
    })

    it('should return current route object', () => {
      expect(router.getCurrentRoute()).toBeTruthy()
    })

    it('should return current route name', () => {
      expect(router.getCurrentRouteName()).toBe('current')
    })

    it('should confirm if current route is named X', () => {
      expect(router.isCurrentRouteNamed('current')).toBe(true)
    })

    it('should get current route params', () => {
      expect(router.getParams()).toEqual({ id: 42 })
    })

    it('should get a single param with fallback', () => {
      expect(router.getParam('id')).toBe(42)
      expect(router.getParam('missing', 'fallback')).toBe('fallback')
    })

    it('should check if named route exists', () => {
      routeCollection.hasNamedRoute = vi.fn((name) => name === 'yes')
      expect(router.hasRoute('yes')).toBe(true)
      expect(router.hasRoute(['yes', 'no'])).toBe(true)
    })

    it('should dump all routes as JSON', async () => {
      routeCollection.dump = vi.fn(async () => await Promise.resolve([{ path: '/a' }]))
      const dump = await router.dumpRoutes()
      expect(dump).toEqual([{ path: '/a' }])
    })
  })

  describe('Middleware resolution and pipeline', () => {
    const mw1 = vi.fn()
    const mw2 = vi.fn()

    it('should gather middleware from routerOptions and route', () => {
      router.configure({ middleware: [mw1], maxDepth: 10 })
      const route = {
        getOption: vi.fn(() => [mw2]),
        isMiddlewareExcluded: vi.fn(() => false)
      } as any

      const result = router.gatherRouteMiddleware(route)
      expect(result).toEqual([mw1, mw2])
    })

    it('should filter out duplicate middleware', () => {
      router.configure({ middleware: [mw1], maxDepth: 10 })
      const route = {
        getOption: vi.fn(() => [mw1]),
        isMiddlewareExcluded: vi.fn(() => false)
      } as any

      const result = router.gatherRouteMiddleware(route)
      expect(result).toEqual([mw1]) // no duplicates
    })

    it('should return empty array if middleware excluded or skipped', () => {
      router.configure({ skipMiddleware: true, middleware: [mw1] })
      const route = {
        getOption: vi.fn(() => [mw1]),
        isMiddlewareExcluded: vi.fn(() => true)
      } as any

      const result = router.gatherRouteMiddleware(route)
      expect(result).toEqual([])
    })

    it('should resolve class-based or alias middleware in pipeline resolver', () => {
      const pipe = { isClass: true, module: 'MiddlewareX' } as any
      // @ts-expect-error
      const resolver = router.makePipelineOptions().resolver
      // @ts-expect-error
      resolver(pipe)
      expect(dependencyResolver.resolve).toHaveBeenCalledWith('MiddlewareX', true)
    })

    it('should resolve factory-based middleware in pipeline resolver', () => {
      const fn = vi.fn()
      const pipe = { isFactory: true, module: fn } as any
      // @ts-expect-error
      const resolver = router.makePipelineOptions().resolver
      // @ts-expect-error
      resolver(pipe)
      expect(fn).toHaveBeenCalledWith(dependencyResolver)
    })

    it('should return undefined for unknown pipe types', () => {
      const pipe = { module: vi.fn() } as any
      // @ts-expect-error
      const resolver = router.makePipelineOptions().resolver
      // @ts-expect-error
      const result = resolver(pipe)
      expect(result).toBeUndefined()
    })
  })
})
