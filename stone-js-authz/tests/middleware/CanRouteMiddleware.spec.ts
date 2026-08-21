import { Can } from '../../src/decorators/Can'
import { getBlueprint, getMetadata, hasMetadata, SERVICE_KEY } from '@stone-js/core'
import { Policy } from '../../src/decorators/Policy'
import { CAN_KEY, POLICY_KEY } from '../../src/decorators/constants'
import { AuthorizationError } from '../../src/errors/AuthorizationError'
import { definePolicy, isPolicy, isPolicyClass } from '../../src/policy'
import { CanRouteMiddleware, MetaCanRouteMiddleware } from '../../src/middleware/CanRouteMiddleware'

/** A policy that loads the record it protects: the case an ability cannot express. */
@Policy('post.update')
class UpdatePostPolicy {
  private readonly posts: { find: (id: string) => { authorId: string } }
  constructor ({ posts }: any) { this.posts = posts }
  authorize (event: any): boolean {
    return this.posts.find(event.get('id')).authorId === event.getMetadataValue('auth').sub
  }
}

const makeEvent = (opts: { ability?: any, authz?: unknown, handler?: unknown, auth?: any, id?: string } = {}): any => ({
  get: (key: string) => (key === 'id' ? opts.id ?? '1' : undefined),
  getMetadataValue: (key: string) => (key === 'ability' ? opts.ability : key === 'auth' ? opts.auth : undefined),
  getRoute: () => (opts.authz === undefined && opts.handler === undefined
    ? undefined
    : { getOption: (k: string) => (k === 'handler' ? opts.handler : opts.authz) })
})

const blueprint = (policies?: Record<string, unknown>, eventHandler?: unknown): any => ({
  get: (key: string, fallback: unknown) => {
    if (key === 'stone.kernel.eventHandler') return eventHandler ?? fallback
    return policies === undefined ? fallback : { policies }
  }
})

const next = vi.fn(async () => 'response' as any)
const allowAll = { can: () => true }
const denyAll = { can: () => false }

describe('CanRouteMiddleware: abilities', () => {
  beforeEach(() => next.mockClear())

  it('lets a route that declares nothing through', async () => {
    const middleware = new CanRouteMiddleware({ blueprint: blueprint() })
    await expect(middleware.handle(makeEvent(), next)).resolves.toBe('response')
  })

  it('allows what the ability allows', async () => {
    const middleware = new CanRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ ability: allowAll, authz: { action: 'update', subject: 'Post' } })

    await expect(middleware.handle(event, next)).resolves.toBe('response')
  })

  it('refuses what the ability refuses, naming the action and the subject', async () => {
    const middleware = new CanRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ ability: denyAll, authz: { action: 'delete', subject: 'Post' } })

    await expect(middleware.handle(event, next)).rejects.toThrow(/Not allowed to delete Post/)
    expect(next).not.toHaveBeenCalled()
  })

  it('refuses when no ability was attached at all, rather than assuming permission', async () => {
    const middleware = new CanRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ authz: { action: 'update', subject: 'Post' } })

    await expect(middleware.handle(event, next)).rejects.toThrow(AuthorizationError)
  })
})

describe('CanRouteMiddleware: policies', () => {
  beforeEach(() => next.mockClear())

  it('resolves a named policy through the container, so it can load the record', async () => {
    // "May update THIS post" needs the post, which an ability cannot fetch.
    const container: any = {
      resolve: (Class: any) => new Class({ posts: { find: () => ({ authorId: 'user-1' }) } })
    }
    const middleware = new CanRouteMiddleware({ blueprint: blueprint({ 'post.update': UpdatePostPolicy }), container })

    await expect(middleware.handle(makeEvent({ authz: 'post.update', auth: { sub: 'user-1' } }), next))
      .resolves.toBe('response')

    await expect(middleware.handle(makeEvent({ authz: 'post.update', auth: { sub: 'someone-else' } }), next))
      .rejects.toThrow(/policy 'post.update' denied/)
  })

  it('denies when the named policy is not registered, because a gap must never read as permission', async () => {
    const middleware = new CanRouteMiddleware({ blueprint: blueprint({}) })

    await expect(middleware.handle(makeEvent({ authz: 'post.publish' }), next))
      .rejects.toThrow(/no policy is registered/)
  })

  it('denies when the registry holds something that is not a policy', async () => {
    const middleware = new CanRouteMiddleware({ blueprint: blueprint({ broken: 42 }) })

    await expect(middleware.handle(makeEvent({ authz: 'broken' }), next)).rejects.toThrow(AuthorizationError)
  })

  it('denies the same way when the bucket exists but declares no policies', async () => {
    // `stone.authz` is always present once the module is enabled; `policies` is not.
    const middleware = new CanRouteMiddleware({ blueprint: { get: () => ({}) } as any })

    await expect(middleware.handle(makeEvent({ authz: 'post.update' }), next))
      .rejects.toThrow(/no policy is registered/)
  })

  it('falls back to the route when a route exists but declares no handler', async () => {
    // A functional route carries no handler module; nothing is declared, so nothing is enforced.
    const middleware = new CanRouteMiddleware({ blueprint: blueprint() })
    const event: any = {
      get: () => undefined,
      getMetadataValue: () => undefined,
      getRoute: () => ({ getOption: () => undefined })
    }

    await expect(middleware.handle(event, next)).resolves.toBe('response')
  })

  it('accepts an already-built policy in the registry', async () => {
    const middleware = new CanRouteMiddleware({ blueprint: blueprint({ ok: { authorize: () => true } }) })

    await expect(middleware.handle(makeEvent({ authz: 'ok' }), next)).resolves.toBe('response')
  })

  it('works with no container, building the policy with no dependencies', async () => {
    class Always { authorize (): boolean { return true } }
    const middleware = new CanRouteMiddleware({ blueprint: blueprint({ always: Always }) })

    await expect(middleware.handle(makeEvent({ authz: 'always' }), next)).resolves.toBe('response')
  })
})

describe('@Can and @Policy', () => {
  beforeEach(() => next.mockClear())

  it('records an ability rule, and a policy name when given alone', () => {
    class Controller {
      @Can('update', 'Post', 'title')
      patch (): void {}

      @Can('post.update')
      update (): void {}
    }

    expect(hasMetadata(Controller, CAN_KEY)).toBe(true)
    expect(getMetadata<any, any[]>(Controller, CAN_KEY, [])).toEqual(expect.arrayContaining([
      { action: 'patch', authz: { action: 'update', subject: 'Post', field: 'title' } },
      { action: 'update', authz: 'post.update' }
    ]))
  })

  it('is enforced from the handler metadata, with no router at all', async () => {
    class Handler {
      @Can('delete', 'Post')
      handle (): void {}
    }

    const middleware = new CanRouteMiddleware({ blueprint: blueprint(undefined, { module: Handler, action: 'handle' }) })

    await expect(middleware.handle(makeEvent({ ability: denyAll }), next)).rejects.toThrow(AuthorizationError)
  })

  it('reads the single declaration of a handler with no named action', async () => {
    class Handler {
      @Can('read', 'Post')
      handle (): void {}
    }

    const middleware = new CanRouteMiddleware({ blueprint: blueprint(undefined, { module: Handler }) })

    await expect(middleware.handle(makeEvent({ ability: allowAll }), next)).resolves.toBe('response')
  })

  it('lets the route option win over the method', async () => {
    class Controller {
      @Can('delete', 'Post')
      patch (): void {}
    }

    const middleware = new CanRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({
      ability: { can: (action: string) => action === 'update' },
      authz: { action: 'update', subject: 'Post' },
      handler: { module: Controller, action: 'patch' }
    })

    await expect(middleware.handle(event, next)).resolves.toBe('response')
  })

  it('registers itself, with the class name as the default alias', () => {
    // The decorator carries its own registration, the way `@KeyHandler` and `@JobHandler` do: no
    // discovery pass reads the metadata back out, and the module is activated by the same gesture.
    @Policy()
    class ArchivePolicy { authorize (): boolean { return true } }

    expect(hasMetadata(UpdatePostPolicy, POLICY_KEY)).toBe(true)
    expect(getBlueprint(UpdatePostPolicy as any).stone.authz.policies).toEqual({ 'post.update': UpdatePostPolicy })
    expect(getBlueprint(ArchivePolicy as any).stone.authz.policies).toEqual({ ArchivePolicy })
  })

  it('declares itself a singleton service, so a policy can load what it protects', () => {
    // The reason `constructor ({ posts })` above works at all.
    const service: any = getMetadata(UpdatePostPolicy as any, SERVICE_KEY as any, {})

    expect(service).toMatchObject({ singleton: true, isClass: true, alias: 'policy:post.update' })
  })

  it('leaves an undecorated class alone, carrying nothing', () => {
    class Unrelated {}

    expect(hasMetadata(Unrelated as any, POLICY_KEY)).toBe(false)
  })

  it('recognises policies, classes and other things apart, and has an imperative counterpart', async () => {
    expect(isPolicyClass(UpdatePostPolicy)).toBe(true)
    expect(isPolicyClass(42)).toBe(false)
    expect(isPolicy({ authorize: () => true })).toBe(true)
    expect(isPolicy(null)).toBe(false)

    const policy = definePolicy(({ allowed }: any) => () => allowed)({ allowed: true })
    expect(await policy.authorize({} as any)).toBe(true)
  })

  it('runs between authentication and validation: who, then may, then what', () => {
    expect(MetaCanRouteMiddleware).toEqual(
      expect.objectContaining({ module: CanRouteMiddleware, isClass: true, priority: 4 })
    )
  })
})
