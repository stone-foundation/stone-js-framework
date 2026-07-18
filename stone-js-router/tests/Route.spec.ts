import { ClassType } from '@stone-js/core'
import { uriConstraints } from '../src/utils'
import { methodMatcher } from '../src/matchers'
import { RouteOptions, Route } from '../src/Route'
import { RouterError } from '../src/errors/RouterError'
import { DependencyResolver } from '../src/declarations'
import { RouteNotFoundError } from '../src/errors/RouteNotFoundError'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock utilities
vi.mock('../src/utils', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    // Named groups (p0, p1, ...) mirror the real compiler; binding reads by name now.
    uriRegex: vi.fn(() => /\/user-(?<p0>\d+)\/?(?<p1>\w+)?/),
    uriConstraints: vi.fn(() => [
      { param: 'id', prefix: 'user-' },
      { param: 'name', optional: true }
    ])
  }
})

vi.mock('../src/matchers', () => ({
  methodMatcher: vi.fn(() => true)
}))

// Helper
const createRouteOptions = (overrides: Partial<RouteOptions> = {}): RouteOptions => ({
  path: '/test',
  method: 'GET',
  handler: vi.fn(),
  customOptions: 'test',
  protocolPolicy: 'force-http',
  excludeMiddleware: ['middleware1', 'middleware2'],
  ...overrides
})

let route: Route
let routeOptions: RouteOptions

beforeEach(() => {
  routeOptions = createRouteOptions()
  route = Route.create(routeOptions)
  // Simulate default constraints to ensure matching
  // @ts-expect-error
  route.uriConstraints = [
    { param: 'id', prefix: 'user-' },
    { param: 'name', optional: true }
  ]
})

describe('Route Initialization & Basic Accessors', () => {
  it('should create route instance and call uriConstraints', () => {
    expect(route).toBeInstanceOf(Route)
    expect(uriConstraints).toHaveBeenCalledWith(routeOptions)
  })

  it('should throw RouterError when no options are provided', () => {
    // @ts-expect-error
    expect(() => new Route(undefined)).toThrow(RouterError)
  })

  it('should expose basic defaults (URL, hash, etc)', () => {
    expect(route.uri).toBe('http://localhost/')
    expect(route.path).toBe('/')
    expect(route.hash).toBe('')
    expect(route.query).toEqual({})
  })

  it('should get full URL when event is set', () => {
    // @ts-expect-error
    route.eventUrl = new URL('https://foo.com/path?x=y#z')
    expect(route.uri).toBe('https://foo.com/path?x=y#z')
    expect(route.path).toBe('/path')
    expect(route.domain).toBe('foo.com')
    expect(route.hash).toBe('#z')
    expect(route.hasDomain()).toBe(false)
    expect(route.method).toBe(routeOptions.method)
    expect(route.protocol).toBe('https')
  })
})

describe('Route Options and Booleans', () => {
  it('should retrieve individual options with fallback', () => {
    expect(route.getOption('path')).toBe('/test')
    expect(route.getOption('domain', 'fallback')).toBe('fallback')
    expect(route.getOption('nonexistent', 'default')).toBe('default')
  })

  it('should retrieve multiple options', () => {
    const options = route.getOptions(['path', 'method', 'customOptions'])
    expect(options).toEqual({
      path: '/test',
      method: 'GET',
      customOptions: 'test'
    })
  })

  it('should check isHttpsOnly, isHttpOnly, isStrict, isFallback', () => {
    expect(route.isHttpsOnly()).toBe(false)
    expect(route.isHttpOnly()).toBe(true)
    expect(route.isStrict()).toBe(false)
    expect(route.isSecure()).toBe(false)
    expect(route.isFallback()).toBe(false)

    const secureRoute = Route.create(createRouteOptions({ protocolPolicy: 'force-https', fallback: true, strict: true }))
    expect(secureRoute.isHttpsOnly()).toBe(true)
    expect(secureRoute.isHttpOnly()).toBe(false)
    expect(secureRoute.isStrict()).toBe(true)
    expect(secureRoute.isFallback()).toBe(true)
  })
})

describe('Route Parameters API', () => {
  it('should expose params when event is bound', () => {
    // @ts-expect-error - force inject
    route.routeParams = { id: 42, name: 'alice' }
    expect(route.params).toEqual({ id: 42, name: 'alice' })
  })

  it('should throw error when accessing params without binding', () => {
    // Ensure routeParams is undefined
    // @ts-expect-error
    route.routeParams = undefined
    expect(() => route.params).toThrow(RouterError)
  })

  it('should check parameter existence and values', () => {
    // @ts-expect-error
    route.routeParams = { foo: 'bar', name: 'john' }

    expect(route.hasParams()).toBe(true)
    expect(route.hasParam('foo')).toBe(true)
    expect(route.hasParam('missing')).toBe(false)
    expect(route.getParam('foo')).toBe('bar')
    expect(route.getParam('missing')).toBeUndefined()
    expect(route.getParam('missing', 'fallback')).toBe('fallback')
  })

  it('should retrieve all param names and defined ones', () => {
    // @ts-expect-error
    route.routeParams = { foo: 'bar', name: 'john', x: undefined }

    expect(route.getParamNames()).toEqual(['foo', 'name', 'x'])
    expect(route.getDefinedParams()).toEqual({ foo: 'bar', name: 'john' })
  })

  it('should identify optional parameters based on constraints', () => {
    // @ts-expect-error - Testing private property
    route.routeParams = { id: 'value', name: 'john' }
    // name is optional, id is not
    expect(route.getOptionalParamNames()).toEqual(['name'])
    expect(route.isParamNameOptional('name')).toBe(true)
    expect(route.isParamNameOptional('id')).toBe(false)
  })
})

describe('Middleware Exclusion Logic', () => {
  it('should return true if middleware is in excludeMiddleware list', () => {
    expect(route.isMiddlewareExcluded('middleware1')).toBe(true)
    expect(route.isMiddlewareExcluded('middleware2')).toBe(true)
  })

  it('should return false if middleware is not excluded', () => {
    expect(route.isMiddlewareExcluded('not-excluded')).toBe(false)
  })

  it('should return true for MetaPipe with excluded `pipe` field', () => {
    const meta: any = { module: 'middleware1' }
    expect(route.isMiddlewareExcluded(meta)).toBe(true)
  })

  it('should return false when no excludeMiddleware defined', () => {
    const tempRoute = Route.create(createRouteOptions({ excludeMiddleware: undefined }))
    expect(tempRoute.isMiddlewareExcluded('middleware1')).toBe(false)
  })
})

describe('addMiddleware()', () => {
  it('should append single middleware to the list', () => {
    route.addMiddleware('middlewareX')
    const middlewares = route.getOption<unknown[]>('middleware')
    expect(middlewares?.includes('middlewareX')).toBe(true)
  })

  it('should append multiple middlewares when given array', () => {
    route.addMiddleware(['middlewareY', 'middlewareZ'])
    const middlewares = route.getOption('middleware')
    expect(middlewares).toEqual(expect.arrayContaining(['middlewareY', 'middlewareZ']))
  })
})

describe('Fluent Configuration Setters', () => {
  it('should set resolver instance and return self', () => {
    const resolver = vi.fn() as unknown as DependencyResolver
    const result = route.setResolver(resolver)
    expect(result).toBe(route)
    // @ts-expect-error
    expect(route.resolver).toBe(resolver)
  })

  it('should set matchers and return self', () => {
    const matchers = [vi.fn()]
    const result = route.setMatchers(matchers)
    expect(result).toBe(route)
    // @ts-expect-error
    expect(route.matchers).toBe(matchers)
  })

  it('should set dispatchers and return self', () => {
    const dispatchers = { callable: vi.fn(), controller: vi.fn() } as any
    const result = route.setDispatchers(dispatchers)
    expect(result).toBe(route)
    // @ts-expect-error
    expect(route.dispatchers).toEqual(dispatchers)
  })
})

describe('Route Matching', () => {
  it('should match when all matchers return true', () => {
    const m1 = vi.fn(() => true)
    const m2 = vi.fn(() => true)
    route.setMatchers([m1, m2])
    expect(route.matches({} as any, true)).toBe(true)
    expect(m1).toHaveBeenCalled()
    expect(m2).toHaveBeenCalled()
  })

  it('should return false if any matcher fails', () => {
    const m1 = vi.fn(() => true)
    const m2 = vi.fn(() => false)
    const m3 = vi.fn(() => true)
    route.setMatchers([m1, m2, m3])
    expect(route.matches({} as any, true)).toBe(false)
    expect(m3).not.toHaveBeenCalled()
  })

  it('should skip methodMatcher if includingMethod is false', () => {
    const mCustom = vi.fn(() => true)
    route.setMatchers([methodMatcher, mCustom])
    expect(route.matches({} as any, false)).toBe(true)
    expect(methodMatcher).not.toHaveBeenCalled()
    expect(mCustom).toHaveBeenCalled()
  })
})

describe('Dispatcher Type Detection (getDispatcherType)', () => {
  it('should return "redirect" if redirect is set', () => {
    routeOptions.redirect = '/redirect'
    // @ts-expect-error
    expect(route.getDispatcherType()).toBe('redirect')
  })

  it('should return "component" if handler is meta component', () => {
    routeOptions.handler = { isComponent: true, module: () => {} }
    // @ts-expect-error
    expect(route.getDispatcherType()).toBe('component')
  })

  it('should return "class" if handler is a class module', () => {
    class Controller {}
    routeOptions.handler = { isClass: true, module: Controller as any }
    // @ts-expect-error
    expect(route.getDispatcherType()).toBe('class')
  })

  it('should return "callable" if handler is a factory/function module', () => {
    routeOptions.handler = { isFactory: true, module: () => () => {} }
    // @ts-expect-error
    expect(route.getDispatcherType()).toBe('callable')

    routeOptions.handler = { module: () => {} }
    // @ts-expect-error
    expect(route.getDispatcherType()).toBe('callable')

    routeOptions.handler = () => {}
    // @ts-expect-error
    expect(route.getDispatcherType()).toBe('callable')
  })

  it('should return undefined if no handler/redirect is set', () => {
    routeOptions.handler = undefined
    routeOptions.redirect = undefined
    // @ts-expect-error
    expect(route.getDispatcherType()).toBeUndefined()
  })
})

describe('generate()', () => {
  it('should generate a valid URL with required params', () => {
    const url = route.generate({ params: { id: '123' } })
    expect(url).toBe('/user-123/')
  })

  it('should append query params to the generated URL', () => {
    const url = route.generate({ params: { id: '456' }, query: { q: 'test' } })
    expect(url).toBe('/user-456/?q=test')
  })

  it('should append hash with/without # prefix', () => {
    expect(route.generate({ params: { id: '789' }, hash: 'hello' })).toBe('/user-789/#hello')
    expect(route.generate({ params: { id: '789' }, hash: '#world' })).toBe('/user-789/#world')
  })

  it('should include domain with/without protocol when `withDomain` is true', () => {
    // @ts-expect-error
    route.uriConstraints = [
      { param: 'domain', suffix: '.example.com' },
      { match: 'u' },
      { param: 'id', prefix: 'id-' }
    ]

    let url = route.generate({
      params: { domain: 'www', id: '9' },
      withDomain: true,
      protocol: 'https'
    })

    expect(url).toBe('https://www.example.com/u/id-9/')

    url = route.generate({
      params: { domain: 'www', id: '9' },
      withDomain: true
    })

    expect(url).toBe('http://www.example.com/u/id-9/')
  })

  it('should throw RouterError if required param is missing', () => {
    // Make 'id' required
    // @ts-expect-error
    route.uriConstraints = [{ param: 'id', optional: false }]

    expect(() => route.generate({})).toThrow(RouterError)
  })

  it('should skip extra params not in URI and put them in query', () => {
    // @ts-expect-error
    route.uriConstraints = [{ param: 'id', prefix: 'user-' }]
    const url = route.generate({ params: { id: '99', extra: 'hello' } })
    expect(url).toBe('/user-99/?extra=hello')
  })

  it('should normalize slashes in generated path', () => {
    // @ts-expect-error
    route.uriConstraints = [{ prefix: '/' }, { match: '/' }, { param: 'id' }]
    const url = route.generate({ params: { id: 'x' } })
    expect(url).toBe('/x/')
  })
})

describe('bind()', () => {
  it('should bind route params and query from event', async () => {
    const mockEvent = {
      url: new URL('http://localhost/user-123/john?q=search'),
      getUri: () => '/user-123/john',
      query: new Map([['q', 'search']])
    }

    await route.bind(mockEvent as any)

    // Params stay raw strings: no destructive numeric coercion ('123' is not turned into 123).
    expect(route.params).toEqual({ id: '123', name: 'john' })
    expect(route.query).toEqual({ q: 'search' })
    expect(route.url.href).toContain('/user-123/john?q=search')
  })

  it('should use static resolveRouteBinding method from class', async () => {
    class User {
      static resolveRouteBinding = vi.fn().mockResolvedValue('bound-user')
    }

    routeOptions.bindings = { user: User, name: vi.fn() }

    // @ts-expect-error - Testing private property
    route.uriConstraints = [
      { param: 'user', prefix: 'user-', alias: 'id' },
      { param: 'name', optional: true, alias: 'profile', default: 34 }
    ]

    const mockEvent = {
      getUri: () => '/user-42',
      url: new URL('http://localhost/user-42')
    }

    await route.bind(mockEvent as any)
    expect(route.params.id).toBe('42')
    expect(route.params.name).toBe(34)
    expect(route.params.profile).toBe(34)
    expect(route.params.user).toBe('bound-user')
    expect(User.resolveRouteBinding).toHaveBeenCalledWith('id', '42', undefined)
    expect(routeOptions.bindings.name).toHaveBeenCalledWith('profile', undefined, undefined)
  })

  it('should use string alias@method to resolve value via resolver', async () => {
    const method = vi.fn(() => 'resolved-value')
    const mockInstance = { customMethod: method }
    const mockResolver = { resolve: vi.fn(() => mockInstance) }

    route.setResolver(mockResolver as any)

    routeOptions.bindings = {
      id: 'User@customMethod'
    }

    const mockEvent = {
      url: new URL('http://localhost/user-1'),
      getUri: () => '/user-1',
      query: new Map()
    }

    await route.bind(mockEvent as any)

    expect(mockResolver.resolve).toHaveBeenCalledWith('User')
    expect(method).toHaveBeenCalledWith('id', '1')
    expect(route.params.id).toBe('resolved-value')
  })

  it('should throw RouteNotFoundError if required param is undefined after binding', async () => {
    // @ts-expect-error - Remove optional flag from 'id'
    route.uriConstraints = [{ param: 'id' }]

    const mockEvent = {
      url: new URL('http://localhost/'),
      getUri: () => '/',
      query: new Map()
    }

    await expect(route.bind(mockEvent as any)).rejects.toThrow(RouteNotFoundError)
  })

  it('should throw RouterError if binding is invalid type', async () => {
    routeOptions.bindings = { id: true as any }

    const mockEvent = {
      url: new URL('http://localhost/user-1'),
      getUri: () => '/user-1',
      query: new Map()
    }

    await expect(route.bind(mockEvent as any)).rejects.toThrow(RouterError)
  })

  it('should throw RouterError if getUri is not present on event', async () => {
    const mockEvent = {
      url: new URL('http://localhost')
    }

    await expect(route.bind(mockEvent as any)).rejects.toThrow(RouterError)
  })
})

describe('run() dispatching', () => {
  it('should run a callable handler and return response', async () => {
    const mockEvent = {}
    const dispatch = vi.fn().mockResolvedValue('done')
    class CallableDispatcher {
      dispatch = dispatch
    }

    // @ts-expect-error - testing purpose
    route.setDispatchers({ callable: CallableDispatcher })

    const result = await route.run({ mockEvent } as any)

    expect(result).toBe('done')
    expect(dispatch).toHaveBeenCalled()
  })

  it('should run controller handler method and return response', async () => {
    const mockEvent = {}
    const get = vi.fn().mockResolvedValue('yes')
    const resolver = { resolve: (Class: ClassType) => new Class(resolver) }
    class TestController {
      get = get
    }

    routeOptions.handler = { module: TestController as any, action: 'get', isClass: true }

    class ControllerDispatcher {
      private readonly resolver: DependencyResolver
      constructor (resolver: DependencyResolver) {
        this.resolver = resolver
      }

      getName = (): string => 'TestController@get'
      // @ts-expect-error - testing purpose
      dispatch = (): any => this.resolver.resolve(TestController).get()
    }

    // @ts-expect-error - testing purpose
    route.setDispatchers({ class: ControllerDispatcher })
    // @ts-expect-error - testing purpose
    route.setResolver(resolver)

    const result = await route.run(mockEvent as any)

    expect(result).toBe('yes')
    expect(get).toHaveBeenCalled()
  })

  it('should throw if dispatcher not found for handler type', async () => {
    routeOptions.handler = vi.fn()

    await expect(route.run({} as any)).rejects.toThrow(RouterError)
  })

  it('should throw if handler type is invalid', async () => {
    routeOptions.handler = 'invalid' as any
    await expect(route.run({} as any)).rejects.toThrow(RouterError)
  })

  it('should throw if redirect handler is set but no dispatcher available', async () => {
    routeOptions.redirect = '/test'
    // Manually clear dispatchers
    // @ts-expect-error
    route.dispatchers = undefined

    await expect(route.run({} as any)).rejects.toThrow(RouterError)
  })
})

describe('toJSON() and toString()', () => {
  it('should return complete route summary as JSON', async () => {
    routeOptions.name = 'getUser'
    routeOptions.domain = 'example.com'
    routeOptions.handler = vi.fn()

    class Dispatcher {
      dispatch = vi.fn()
      getName = vi.fn().mockResolvedValue('handlerName')
    }

    route.setDispatchers({ callable: Dispatcher } as any)

    const json = await route.toJSON()
    expect(json).toEqual({
      path: '/test',
      method: 'GET',
      handler: 'handlerName',
      name: 'getUser',
      domain: 'example.com',
      fallback: false
    })
  })

  it('should fall back to default values when fields are missing', async () => {
    routeOptions.handler = undefined
    routeOptions.name = undefined
    routeOptions.domain = undefined

    const json = await route.toJSON()
    expect(json.name).toBe('N/A')
    expect(json.domain).toBe('N/A')
    expect(json.fallback).toBe(false)
  })

  it('should stringify the route as a JSON string', async () => {
    class Dispatcher {
      dispatch = vi.fn()
      getName = vi.fn().mockResolvedValue('handlerName')
    }

    route.setDispatchers({ callable: Dispatcher } as any)

    const output = await route.toString()
    expect(typeof output).toBe('string')
    expect(() => JSON.parse(output)).not.toThrow()
  })
})
