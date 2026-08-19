import { defineResource } from '../../src/defineResource'
import { resourcesBlueprint } from '../../src/options/ResourcesBlueprint'
import { MetaResourceRouteMiddleware, ResourceRouteMiddleware } from '../../src/middleware/ResourceRouteMiddleware'

interface User { id: number, name: string, passwordHash: string }

const userResource = defineResource<User>((user) => ({ id: user.id, name: user.name }))

const ada: User = { id: 1, name: 'Ada', passwordHash: 'do-not-leak' }
const grace: User = { id: 2, name: 'Grace', passwordHash: 'do-not-leak' }

const makeEvent = (resource?: unknown, query: Record<string, string> = {}): any => ({
  get: (key: string, fallback?: unknown) => query[key] ?? fallback,
  getRoute: () => (resource === undefined ? undefined : { getOption: () => resource })
})

const blueprintWith = (registry?: Record<string, unknown>): any => ({
  get: (_key: string, fallback: unknown) => (registry === undefined ? fallback : { registry })
})

describe('ResourceRouteMiddleware', () => {
  it('shapes what the handler returned, so the model never leaves whole', async () => {
    // The reason the module exists: the service returns its domain model, including the fields it
    // must never expose, and the route decides what the outside world sees.
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprintWith() })

    const output: any = await middleware.handle(makeEvent(userResource), async () => ada as any)

    expect(output).toEqual({ id: 1, name: 'Ada' })
    expect(output).not.toHaveProperty('passwordHash')
  })

  it('shapes a collection the same way', async () => {
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprintWith() })

    const output: any = await middleware.handle(makeEvent(userResource), async () => [ada, grace] as any)

    expect(output).toEqual([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }])
  })

  it('honours the sparse fieldset the caller asked for', async () => {
    // `?fields=id` narrows the output without the route changing.
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprintWith() })

    const output: any = await middleware.handle(makeEvent(userResource, { fields: 'id' }), async () => ada as any)

    expect(output).toEqual({ id: 1 })
  })

  it('leaves the result untouched when the route declares no resource', async () => {
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprintWith() })

    await expect(middleware.handle(makeEvent(), async () => ada as any)).resolves.toBe(ada)
  })

  it('leaves an empty result alone rather than shaping nothing', async () => {
    // A 204-style handler returns nothing; shaping `undefined` would invent an empty object.
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprintWith() })

    await expect(middleware.handle(makeEvent(userResource), async () => undefined as any)).resolves.toBeUndefined()
    await expect(middleware.handle(makeEvent(userResource), async () => null as any)).resolves.toBeNull()
  })

  it('resolves a resource named on the route from the registry', async () => {
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprintWith({ user: userResource }) })

    const output: any = await middleware.handle(makeEvent('user'), async () => ada as any)

    expect(output).toEqual({ id: 1, name: 'Ada' })
  })

  it('fails loudly when the route names a resource nobody registered', async () => {
    // Returning the model unshaped is exactly what a resource exists to prevent, so an unknown name
    // is an error rather than a silent passthrough.
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprintWith({}) })

    await expect(middleware.handle(makeEvent('doesNotExist'), async () => ada as any))
      .rejects.toThrow(/no resource is registered/)
  })

  it('fails the same way when the bucket exists but declares no registry', async () => {
    const middleware = new ResourceRouteMiddleware({ blueprint: { get: () => ({}) } as any })

    await expect(middleware.handle(makeEvent('user'), async () => ada as any))
      .rejects.toThrow(/no resource is registered/)
  })

  it('runs outside validation, so input is checked before output is shaped', () => {
    expect(MetaResourceRouteMiddleware).toEqual(
      expect.objectContaining({ module: ResourceRouteMiddleware, isClass: true, priority: 4 })
    )
    expect(resourcesBlueprint.stone.router?.middleware).toEqual([MetaResourceRouteMiddleware])
  })
})
