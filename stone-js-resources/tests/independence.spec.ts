import { z } from 'zod'
import { Resource } from '../src/Resource'
import { getMetadata, hasMetadata } from '@stone-js/core'
import { Returns } from '../src/decorators/Returns'
import { defineResource } from '../src/defineResource'
import { ApiResource } from '../src/decorators/ApiResource'
import { API_RESOURCE_KEY, RETURNS_KEY } from '../src/decorators/constants'
import { ApiResourceMiddleware } from '../src/middleware/BlueprintMiddleware'
import { ResourceRouteMiddleware } from '../src/middleware/ResourceRouteMiddleware'

interface User { id: number, name: string, passwordHash: string }

const ada: User = { id: 1, name: 'Ada', passwordHash: 'do-not-leak' }
const userResource = defineResource<User>({ schema: z.object({ id: z.number(), name: z.string() }) })

const validator = {
  validate: <T>(schema: any, data: unknown) => {
    const result = schema.safeParse(data)
    return result.success
      ? { success: true, value: result.data as T }
      : { success: false, issues: result.error.issues.map((i: any) => ({ message: i.message, path: i.path })) }
  }
}

/** The container the runtime hands the middleware, carrying that engine. */
const container = { make: (key: string) => (key === 'validator' ? validator : undefined) } as any

/** A resource class whose shape depends on an injected service, which is why classes exist. */
@ApiResource('user')
class UserResource extends Resource<User> {
  private readonly locale: string
  constructor ({ i18n }: { i18n: { getLocale: () => string } }) {
    super()
    this.locale = i18n.getLocale()
  }

  schema (): unknown {
    return z.object({ id: z.number(), name: z.string(), locale: z.string() })
  }

  async data (user: User): Promise<unknown> {
    return { id: user.id, name: user.name, locale: this.locale }
  }
}

const makeEvent = (route?: unknown, handler?: unknown): any => ({
  get: (_key: string, fallback?: unknown) => fallback,
  getRoute: () => (route === undefined && handler === undefined
    ? undefined
    : { getOption: (k: string) => (k === 'handler' ? handler : route) })
})

const blueprint = (registry?: Record<string, unknown>, eventHandler?: unknown): any => ({
  get: (key: string, fallback: unknown) => {
    if (key === 'stone.kernel.eventHandler') return eventHandler ?? fallback
    return registry === undefined ? fallback : { registry }
  }
})

describe('@Returns: the module owns its key, so it needs no router', () => {
  it('records the declaration on the handler method', () => {
    class UserController {
      @Returns(userResource)
      show (): void {}
    }

    expect(hasMetadata(UserController, RETURNS_KEY)).toBe(true)
    expect(getMetadata<any, any[]>(UserController, RETURNS_KEY, [])).toEqual([
      { action: 'show', resource: userResource }
    ])
  })

  it('shapes a routed response from the handler metadata, with no route option at all', async () => {
    class UserController {
      @Returns(userResource)
      show (): void {}
    }

    const middleware = new ResourceRouteMiddleware({ blueprint: blueprint(), container })
    const event = makeEvent(undefined, { module: UserController, action: 'show' })

    const output: any = await middleware.handle(event, async () => ada as any)

    expect(output).toEqual({ id: 1, name: 'Ada' })
    expect(output).not.toHaveProperty('passwordHash')
  })

  it('shapes with no router in play, reading the application event handler', async () => {
    class Handler {
      @Returns(userResource)
      handle (): void {}
    }

    const middleware = new ResourceRouteMiddleware({
      blueprint: blueprint(undefined, { module: Handler, action: 'handle' }),
      container
    })

    await expect(middleware.handle(makeEvent(), async () => ada as any))
      .resolves.toEqual({ id: 1, name: 'Ada' })
  })

  it('reads the single declaration of a handler that has no named action', async () => {
    class Handler {
      @Returns(userResource)
      handle (): void {}
    }

    const middleware = new ResourceRouteMiddleware({ blueprint: blueprint(undefined, { module: Handler }), container })

    await expect(middleware.handle(makeEvent(), async () => ada as any))
      .resolves.toEqual({ id: 1, name: 'Ada' })
  })

  it('lets the route option win, since a route is the single description of itself', async () => {
    class UserController {
      @Returns(defineResource<User>(() => ({ from: 'method' })))
      show (): void {}
    }

    const middleware = new ResourceRouteMiddleware({ blueprint: blueprint(), container })
    const event = makeEvent(userResource, { module: UserController, action: 'show' })

    await expect(middleware.handle(event, async () => ada as any))
      .resolves.toEqual({ id: 1, name: 'Ada' })
  })
})

describe('resource classes', () => {
  it('are discovered into the registry by the same scan the router uses', async () => {
    const set = vi.fn()
    const context: any = {
      modules: [UserResource, class Unrelated {}],
      blueprint: { set, get: (_k: string, f: unknown) => f }
    }

    await ApiResourceMiddleware(context, (async (c: any) => c.blueprint) as any)

    expect(hasMetadata(UserResource, API_RESOURCE_KEY)).toBe(true)
    expect(set).toHaveBeenCalledWith('stone.resources.registry', { user: UserResource })
  })

  it('falls back to the class name when no alias is given', async () => {
    @ApiResource()
    class AddressResource extends Resource<any> { schema (): unknown { return z.any() } }

    const set = vi.fn()
    const context: any = { modules: [AddressResource], blueprint: { set, get: (_k: string, f: unknown) => f } }

    await ApiResourceMiddleware(context, (async (c: any) => c.blueprint) as any)

    expect(set).toHaveBeenCalledWith('stone.resources.registry', { AddressResource })
  })

  it('registers nothing when no module declares a resource', async () => {
    const set = vi.fn()
    const context: any = { modules: [class Unrelated {}], blueprint: { set, get: (_k: string, f: unknown) => f } }

    await ApiResourceMiddleware(context, (async (c: any) => c.blueprint) as any)

    expect(set).not.toHaveBeenCalled()
  })

  it('are resolved through the container, so a projection can use injected services', async () => {
    // A resource that formats for the caller's locale needs i18n, and this is how it gets it.
    const container: any = {
      make: (key: string) => (key === 'validator' ? validator : undefined),
      resolve: (Class: any) => new Class({ i18n: { getLocale: () => 'fr' } })
    }
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprint({ user: UserResource }), container })

    await expect(middleware.handle(makeEvent('user'), async () => ada as any))
      .resolves.toEqual({ id: 1, name: 'Ada', locale: 'fr' })
  })

  it('still work with no container, so the same class serves any context', async () => {
    // No container to resolve from, and none needed: the class is constructed with what it was given,
    // and the validator travels with the projection rather than with the instance.
    const middleware = new ResourceRouteMiddleware({
      blueprint: blueprint({ plain: class extends Resource<User> {
        schema (): unknown { return z.object({ id: z.number() }) }
      } }),
      container
    })

    await expect(middleware.handle(makeEvent('plain'), async () => ada as any))
      .resolves.toEqual({ id: 1 })
  })

  it('accepts a class declared inline on the route, not only a registered name', async () => {
    const inline: any = {
      make: (key: string) => (key === 'validator' ? validator : undefined),
      resolve: (Class: any) => new Class({ i18n: { getLocale: () => 'ht' } })
    }
    const middleware = new ResourceRouteMiddleware({ blueprint: blueprint(), container: inline })

    await expect(middleware.handle(makeEvent(UserResource), async () => ada as any))
      .resolves.toEqual({ id: 1, name: 'Ada', locale: 'ht' })
  })
})
