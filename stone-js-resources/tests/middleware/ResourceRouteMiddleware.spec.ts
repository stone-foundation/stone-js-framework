import { z } from 'zod'
import { defineResource } from '../../src/defineResource'
import { resourcesBlueprint } from '../../src/options/ResourcesBlueprint'
import { MetaResourceRouteMiddleware, ResourceRouteMiddleware } from '../../src/middleware/ResourceRouteMiddleware'

interface User { id: number, name: string, passwordHash: string }

const ada: User = { id: 1, name: 'Ada', passwordHash: 'do-not-leak' }
const grace: User = { id: 2, name: 'Grace', passwordHash: 'do-not-leak' }

const validator = {
  validate: <T>(schema: any, data: unknown) => {
    const result = schema.safeParse(data)
    return result.success
      ? { success: true, value: result.data as T }
      : { success: false, issues: result.error.issues.map((i: any) => ({ message: i.message, path: i.path })) }
  }
}

const userResource = defineResource<User>({
  schema: z.object({ id: z.number(), name: z.string() }),
  fragments: { summary: z.object({ id: z.number() }) }
})

const makeEvent = (resource?: unknown, query: Record<string, string> = {}, user?: unknown): any => ({
  get: (key: string, fallback?: unknown) => query[key] ?? fallback,
  // The principal travels through a resolver, exactly as `@stone-js/auth` sets it.
  getUser: () => user,
  getRoute: () => (resource === undefined ? undefined : { getOption: () => resource })
})

/** A blueprint that resolves dotted keys, as the real one does. */
const context = (config: Record<string, any> = {}): any => ({
  blueprint: {
    get: (key: string, fallback?: unknown) => {
      if (key === 'stone.resources') { return config }
      if (key.startsWith('stone.resources.')) { return config[key.slice('stone.resources.'.length)] ?? fallback }
      return fallback
    }
  },
  container: { make: (key: string) => (key === 'validator' ? validator : undefined) }
})

/** A response, as a handler carrying `@JsonHttpResponse(201)` has already produced one. */
const responseWith = (content: unknown, statusCode = 201): any => ({
  statusCode,
  content,
  setContent (value: unknown) { this.content = value; return this }
})

describe('ResourceRouteMiddleware', () => {
  it('shapes what the handler returned, so the model never leaves whole', async () => {
    const middleware = new ResourceRouteMiddleware(context())

    const output: any = await middleware.handle(makeEvent(userResource), async () => ada as any)

    expect(output).toEqual({ id: 1, name: 'Ada' })
    expect(output).not.toHaveProperty('passwordHash')
  })

  it('shapes a collection the same way', async () => {
    const middleware = new ResourceRouteMiddleware(context())

    const output: any = await middleware.handle(makeEvent(userResource), async () => [ada, grace] as any)

    expect(output).toEqual([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }])
  })

  it('shapes the payload of a response, and keeps its status', async () => {
    // The defect this replaces: `@JsonHttpResponse(201)` wraps the method itself, so by the time any
    // route middleware runs the handler has already produced a response. Projecting that object gave
    // an empty payload and dropped 201 to 200. The payload is shaped in place instead.
    const middleware = new ResourceRouteMiddleware(context())

    const output: any = await middleware.handle(makeEvent(userResource), async () => responseWith(ada))

    expect(output.content).toEqual({ id: 1, name: 'Ada' })
    expect(output.statusCode).toBe(201)
  })

  it('shapes a collection inside a response', async () => {
    const middleware = new ResourceRouteMiddleware(context())

    const output: any = await middleware.handle(makeEvent(userResource), async () => responseWith([ada, grace], 200))

    expect(output.content).toEqual([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }])
  })

  it('leaves a response with no payload alone', async () => {
    // A 204 carries nothing to shape.
    const middleware = new ResourceRouteMiddleware(context())

    const output: any = await middleware.handle(makeEvent(userResource), async () => responseWith(undefined, 204))

    expect(output.statusCode).toBe(204)
    expect(output.content).toBeUndefined()
  })

  it('honours the fragment the caller asked for', async () => {
    const middleware = new ResourceRouteMiddleware(context())

    const output: any = await middleware.handle(makeEvent(userResource, { view: 'summary' }), async () => ada as any)

    expect(output).toEqual({ id: 1 })
  })

  it('lets the application name that query parameter', async () => {
    // An API that already answers `?only=` keeps its vocabulary instead of gaining a second one.
    const middleware = new ResourceRouteMiddleware(context({ params: { fragment: 'only' } }))

    const output: any = await middleware.handle(makeEvent(userResource, { only: 'summary' }), async () => ada as any)

    expect(output).toEqual({ id: 1 })
  })

  it('hands the resource the authenticated principal', async () => {
    // Deciding what a caller may see is the most common reason two callers get different shapes, and a
    // resource that cannot see who is asking has to be told by the handler.
    const seen: unknown[] = []
    const spy = defineResource<User>({
      schema: (ctx) => { seen.push(ctx.principal); return z.object({ id: z.number() }) }
    })
    const middleware = new ResourceRouteMiddleware(context())

    await middleware.handle(makeEvent(spy, {}, { id: 7, role: 'admin' }), async () => ada as any)

    expect(seen[0]).toEqual({ id: 7, role: 'admin' })
  })

  it('leaves the result untouched when the route declares no resource', async () => {
    const middleware = new ResourceRouteMiddleware(context())

    await expect(middleware.handle(makeEvent(), async () => ada as any)).resolves.toBe(ada)
  })

  it('leaves an empty result alone rather than shaping nothing', async () => {
    const middleware = new ResourceRouteMiddleware(context())

    await expect(middleware.handle(makeEvent(userResource), async () => undefined as any)).resolves.toBeUndefined()
    await expect(middleware.handle(makeEvent(userResource), async () => null as any)).resolves.toBeNull()
  })

  it('resolves a resource named on the route from the registry', async () => {
    const middleware = new ResourceRouteMiddleware(context({ registry: { user: userResource } }))

    const output: any = await middleware.handle(makeEvent('user'), async () => ada as any)

    expect(output).toEqual({ id: 1, name: 'Ada' })
  })

  it('fails loudly when the route names a resource nobody registered', async () => {
    // Returning the model unshaped is exactly what a resource exists to prevent.
    const middleware = new ResourceRouteMiddleware(context({ registry: {} }))

    await expect(middleware.handle(makeEvent('doesNotExist'), async () => ada as any))
      .rejects.toThrow(/no resource is registered/)
  })

  it('resolves a resource class through the container', async () => {
    class Registered { item = async (): Promise<unknown> => ({ resolved: true }) }
    const middleware = new ResourceRouteMiddleware({
      blueprint: { get: (_k: string, fallback: unknown) => fallback },
      container: { make: () => validator, resolve: (Klass: any) => new Klass() }
    } as any)

    const output: any = await middleware.handle(makeEvent(Registered), async () => ada as any)

    expect(output).toEqual({ resolved: true })
  })

  it('runs outside validation, so input is checked before output is shaped', () => {
    expect(MetaResourceRouteMiddleware).toEqual(
      expect.objectContaining({ module: ResourceRouteMiddleware, isClass: true, priority: 4 })
    )
    expect(resourcesBlueprint.stone.router?.middleware).toEqual([MetaResourceRouteMiddleware])
  })
})
