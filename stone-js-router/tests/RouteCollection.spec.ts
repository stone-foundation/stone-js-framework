import { Route } from '../src/Route'
import { RouteCollection } from '../src/RouteCollection'
import { RouteNotFoundError } from '../src/errors/RouteNotFoundError'
import { MethodNotAllowedError } from '../src/errors/MethodNotAllowedError'

// Mock Route
vi.mock('../src/Route', () => ({
  Route: {
    create: vi.fn((options) => ({
      ...options,
      getOption: vi.fn((key: string, fallback: any) => key in options ? options[key] : fallback),
      matches: vi.fn(() => false),
      toJSON: vi.fn(() => options)
    }))
  }
}))

const mockEvent = (method = 'GET', pathname = '/test'): any => ({
  method,
  pathname,
  decodedPathname: pathname,
  isMethod: vi.fn(() => method === 'OPTIONS')
})

describe('RouteCollection', () => {
  let collection: RouteCollection

  beforeEach(() => {
    collection = RouteCollection.create()
  })

  it('should initialize empty or with predefined routes', () => {
    expect(collection.size).toBe(0)
    expect(collection.getRoutes()).toEqual([])

    const route1 = Route.create({ path: '/a', method: 'GET' })
    const route2 = Route.create({ path: '/b', method: 'POST' })

    const prefilled = RouteCollection.create([route1, route2])
    expect(prefilled.size).toBe(2)
    expect(prefilled.getRoutes()).toContain(route1)
  })

  it('should allow adding a route', () => {
    const route = Route.create({ path: '/a', method: 'GET' })
    collection.add(route)
    expect(collection.size).toBe(1)
    expect(collection.getRoutes()).toContain(route)
  })

  it('should list routes by method', () => {
    const getRoute = Route.create({ path: '/x', method: 'GET' })
    const postRoute = Route.create({ path: '/x', method: 'POST' })

    collection.add(getRoute).add(postRoute)

    expect(collection.getRoutesByMethod('GET')).toEqual([getRoute])
    expect(collection.getRoutesByMethod('POST')).toEqual([postRoute])
    expect(collection.getRoutesByMethod('PUT')).toEqual([])
  })

  it('should match a route by method and path', () => {
    const route = Route.create({ path: '/test', method: 'GET' })
    route.matches = vi.fn(() => true)
    collection.add(route)

    const matched = collection.match(mockEvent('GET', '/test'))
    expect(matched).toBe(route)
  })

  it('should throw if no route matches', () => {
    expect(() => collection.match(mockEvent('GET', '/nope'))).toThrow(RouteNotFoundError)
  })

  it('should fallback to OPTIONS route if supported methods exist', async () => {
    const postRoute = Route.create({ path: '/only-post', method: 'POST' })
    postRoute.matches = vi.fn((_, incl) => incl !== undefined) // match only if method not enforced
    collection.add(postRoute)

    const event = mockEvent('OPTIONS', '/only-post')
    event.method = 'OPTIONS'
    event.isMethod = vi.fn(() => true)

    const route = collection.match(event)
    const handler = (route as any)?.handler as Function
    const response: any = await handler?.(event)

    expect(response.statusCode).toBe(200)
    // Allow is now carried in the response headers (RFC 7231), not in the body.
    expect(response.headers.Allow).toBe('POST')
  })

  it('should fallback to OPTIONS route if supported methods exist 2', async () => {
    const postRoute = Route.create({ path: '/only-post', method: 'POST' })
    postRoute.matches = vi.fn((_, incl) => incl !== undefined)
    collection.add(postRoute)

    const event = mockEvent('OPTIONS', '/only-post')
    event.pathname = '/only-post'
    event.method = 'OPTIONS'
    event.decodedPathname = undefined
    event.isMethod = vi.fn(() => true)

    const route = collection.match(event)
    const handler = (route as any)?.handler as Function
    const response: any = await handler?.(event)

    expect(response.statusCode).toBe(200)
  })

  it('should throw MethodNotAllowedError when route matched but wrong method', () => {
    const route = Route.create({ path: '/method-check', method: 'POST' })
    route.matches = vi.fn(() => true)

    collection.add(route)

    expect(() =>
      collection.match(mockEvent('GET', '/method-check'))
    ).toThrow(MethodNotAllowedError)
  })

  it('should match named routes', () => {
    const named = Route.create({ path: '/named', method: 'GET', name: 'namedRoute' })
    collection.add(named)

    expect(collection.hasNamedRoute('namedRoute')).toBe(true)
    expect(collection.getByName('namedRoute')).toBe(named)
  })

  it('should return undefined for non-existent named route', () => {
    expect(collection.getByName('ghost')).toBeUndefined()
  })

  describe('RouteCollection – dump and serialization', () => {
    it('should dump all routes excluding isInternalHeader ones', async () => {
      const route1 = Route.create({ path: '/visible', method: 'GET' })
      const route2 = Route.create({ path: '/hidden', method: 'HEAD', isInternalHeader: true })

      collection.add(route1).add(route2)

      const result = await collection.dump()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ path: '/visible', method: 'GET' })
      expect(route2.getOption).toHaveBeenCalledWith('isInternalHeader', false)
    })

    it('should sort routes alphabetically by path in dump()', async () => {
      const routeA = Route.create({ path: '/zzz', method: 'GET' })
      const routeB = Route.create({ path: '/aaa', method: 'POST' })

      collection.add(routeA).add(routeB)

      const result = await collection.dump()
      expect(result.map(r => r.path)).toEqual(['/aaa', '/zzz'])
    })

    it('should convert all routes to a JSON string via toString()', async () => {
      const route = Route.create({ path: '/stringify', method: 'GET' })
      collection.add(route)

      const json = await collection.toString()
      expect(json).toBe(JSON.stringify(await collection.dump()))
    })
  })

  describe('RouteCollection – Symbol.iterator', () => {
    it('should allow iterating over all routes', () => {
      const r1 = Route.create({ path: '/1', method: 'GET' })
      const r2 = Route.create({ path: '/2', method: 'POST' })

      collection.add(r1).add(r2)

      const routes = [...collection]

      expect(routes).toContain(r1)
      expect(routes).toContain(r2)
      expect(routes).toHaveLength(2)
    })
  })

  describe('RouteCollection – resolver safety', () => {
    it('should handle fallback if resolver not set and fallback route exists', async () => {
      const fallback = Route.create({ path: '/', method: 'GET', fallback: true })
      fallback.matches = vi.fn(() => false)
      collection.add(fallback)

      try {
        collection.match(mockEvent('GET', '/does-not-match'))
      } catch (err) {
        expect(err).toBeInstanceOf(RouteNotFoundError)
      }
    })

    it('should not fail if route name is undefined', () => {
      const route = Route.create({ path: '/anon', method: 'GET' })
      collection.add(route)

      // internal map shouldn't throw
      expect(() => collection.hasNamedRoute('anon')).not.toThrow()
    })
  })
})
