import { Route } from '../src/Route'
import { GET, POST, HEAD } from '../src/constants'
import { RouterError } from '../src/errors/RouterError'
import { RouteMapper, RouteMapperOptions } from '../src/RouteMapper'
import { DependencyResolver, RouteDefinition } from '../src/declarations'

vi.mock('../src/Route', () => {
  return {
    Route: {
      create: vi.fn(() => ({
        setMatchers: vi.fn().mockReturnThis(),
        setDispatchers: vi.fn().mockReturnThis(),
        setResolver: vi.fn().mockReturnThis()
      }))
    }
  }
})

class UserController {
  public index = vi.fn()
  public show = vi.fn()
}

describe('RouteMapper', () => {
  let options: RouteMapperOptions
  let mockContainer: DependencyResolver

  beforeEach(() => {
    mockContainer = { resolve: vi.fn() } as any
    options = {
      prefix: '/api',
      strict: false,
      maxDepth: 5,
      matchers: [],
      rules: {},
      defaults: {},
      bindings: {},
      dispatchers: {} as any,
      dependencyResolver: mockContainer
    }
  })

  it('should throw if maxDepth is not positive', () => {
    expect(() => new RouteMapper({ ...options, maxDepth: 0 })).toThrow(RouterError)
  })

  it('should return an instance via static create()', () => {
    expect(RouteMapper.create(options)).toBeInstanceOf(RouteMapper)
  })

  it('should throw if maxDepth is exceeded', () => {
    const mapper = new RouteMapper({ ...options, maxDepth: 1 })
    const def: RouteDefinition = {
      path: '/parent',
      method: GET,
      handler: { action: 'index' },
      children: [{
        path: '/child',
        method: GET,
        handler: { action: 'nested' }
      }]
    }
    expect(() => mapper.toRoutes([def])).toThrow(RouterError)
  })

  it('should expand GET definitions to include HEAD', () => {
    const mapper = RouteMapper.create(options)

    const def: RouteDefinition = {
      path: '/page',
      method: GET,
      handler: { action: 'show' }
    }

    const routes = mapper.toRoutes([def])
    expect(routes).toHaveLength(2)
    expect(Route.create).toHaveBeenCalledWith(expect.objectContaining({ method: GET }))
    expect(Route.create).toHaveBeenCalledWith(expect.objectContaining({ method: HEAD }))
  })

  it('should merge parent and child route definitions correctly', () => {
    const mapper = RouteMapper.create(options)

    const routes = mapper.toRoutes([{
      name: 'users',
      path: '/users',
      handler: { module: UserController },
      bindings: { id: vi.fn() },
      rules: { id: /^\d+$/ },
      middleware: ['auth'],
      excludeMiddleware: ['log'],
      children: [{
        name: 'show',
        method: GET,
        path: '/:id',
        handler: { action: 'show' },
        middleware: ['log']
      }]
    }])

    expect(routes).toHaveLength(2) // GET and HEAD
    expect(Route.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'users.show',
      path: '/api/users/:id',
      method: GET,
      middleware: ['log', 'auth'],
      excludeMiddleware: ['log'],
      rules: { id: /^\d+$/ }
    }))
  })

  it('should sanitize name and collapse double slashes in path', () => {
    const mapper = RouteMapper.create({ ...options, prefix: '/api//' })

    const def: RouteDefinition = {
      name: '..demo..',
      path: '///demo',
      method: GET,
      handler: { action: 'index' }
    }

    mapper.toRoutes([def])
    expect(Route.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'demo',
      path: '/api/demo'
    }))
  })

  it('should use redirect instead of handler if provided', () => {
    const mapper = RouteMapper.create(options)

    const def: RouteDefinition = {
      path: '/redirect',
      method: POST,
      redirect: '/users'
    }

    mapper.toRoutes([def])
    expect(Route.create).toHaveBeenCalledWith(expect.objectContaining({
      path: '/api/redirect',
      method: POST,
      redirect: '/users'
    }))
  })

  it('should validate and map layout + custom fields', () => {
    const mapper = RouteMapper.create(options)

    const def: RouteDefinition = {
      path: '/dashboard',
      method: GET,
      pageLayout: 'AdminLayout',
      handler: { action: 'index' },
      children: [{
        path: '/settings',
        method: POST,
        customOptions: 'value',
        handler: { action: 'save' }
      }]
    }

    const routes = mapper.toRoutes([def])
    expect(routes).toHaveLength(1)
    expect(Route.create).toHaveBeenCalledWith(expect.objectContaining({
      path: '/api/dashboard/settings',
      method: POST,
      pageLayout: 'AdminLayout',
      customOptions: 'value'
    }))
  })

  it('should throw if path is missing', () => {
    const mapper = RouteMapper.create(options)
    const def = { method: GET, handler: { action: 'test' } } as any
    // @ts-expect-error - private access
    expect(() => mapper.toRouteOptions(def)).toThrow(RouterError)
  })

  it('should throw if method is invalid', () => {
    const mapper = RouteMapper.create(options)
    const def = { path: '/invalid', method: 'FOO', handler: { action: 'test' } } as any
    // @ts-expect-error - private access
    expect(() => mapper.toRouteOptions(def)).toThrow(RouterError)
  })

  it('should throw if neither handler nor redirect are defined', () => {
    const mapper = RouteMapper.create(options)
    const def = { path: '/bad', method: GET } as any
    // @ts-expect-error - private access
    expect(() => mapper.toRouteOptions(def)).toThrow(RouterError)
  })
})
