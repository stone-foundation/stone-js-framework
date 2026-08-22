import { CanRouteMiddleware } from '../../src/middleware/CanRouteMiddleware'
import { AuthorizationError } from '../../src/errors/AuthorizationError'

const eventWith = (authz: unknown): any => ({
  getRoute: () => ({ getOption: <T>(key: string): T | undefined => (key === 'authz' ? authz as T : undefined) }),
  getMetadataValue: () => undefined
})

const middlewareWith = (policies: Record<string, unknown>): CanRouteMiddleware =>
  new CanRouteMiddleware({
    blueprint: { get: (key: string, fallback: unknown) => (key === 'stone.authz' ? { policies } : fallback) } as any
  })

describe('a policy chain is a conjunction of gates', () => {
  it('lets the request through only when every gate says yes', async () => {
    const middleware = middlewareWith({
      'policy.parent': { authorize: () => true },
      'platform.operate': { authorize: () => true }
    })

    await expect(middleware.handle(eventWith(['policy.parent', 'platform.operate']), (async () => 'ok') as any))
      .resolves.toBe('ok')
  })

  it('denies on the first gate that says no, naming it, and never runs the next', async () => {
    // The outer gate is the one that must not be reachable past: a child policy has no business
    // running for a caller the group already refused.
    const childRan: unknown[] = []
    const middleware = middlewareWith({
      'policy.parent': { authorize: () => false },
      'platform.operate': { authorize: () => { childRan.push(true); return true } }
    })

    await expect(middleware.handle(eventWith(['policy.parent', 'platform.operate']), (async () => 'ok') as any))
      .rejects.toThrow(/policy.parent/)
    expect(childRan).toHaveLength(0)
  })

  it('denies when the child gate says no, even after the parent said yes', async () => {
    const middleware = middlewareWith({
      'policy.parent': { authorize: () => true },
      'platform.operate': { authorize: () => false }
    })

    await expect(middleware.handle(eventWith(['policy.parent', 'platform.operate']), (async () => 'ok') as any))
      .rejects.toThrow(/platform.operate/)
  })

  it('accepts a one-element array, so authz: [x] and authz: x say the same thing', async () => {
    const middleware = middlewareWith({ 'platform.operate': { authorize: () => true } })

    await expect(middleware.handle(eventWith(['platform.operate']), (async () => 'ok') as any)).resolves.toBe('ok')
    await expect(middleware.handle(eventWith('platform.operate'), (async () => 'ok') as any)).resolves.toBe('ok')
  })

  it('still denies loudly on a chain naming an unregistered policy', async () => {
    // A missing policy must never read as permission, chained or not.
    const middleware = middlewareWith({ 'policy.parent': { authorize: () => true } })

    await expect(middleware.handle(eventWith(['policy.parent', 'ghost']), (async () => 'ok') as any))
      .rejects.toThrow(AuthorizationError)
  })
})

describe('the exact shape a group declares', () => {
  it('a parent gate composes with the child gate, parent first, through the real mapper', async () => {
    // Evens' example, verbatim in structure: @EventHandler('/', { authz: 'policy.parent' }) with
    // @Get('/name', { authz: 'platform.operate' }). The router composes because authz declared its
    // key composable; the middleware then enforces the chain in that order.
    const { RouteMapper } = await import('@stone-js/router')
    const mapper = (RouteMapper as any).create({
      maxDepth: 5,
      composableProps: ['authz'],
      matchers: [],
      dispatchers: { callable: class { static create (): any { return new this() } dispatch (): any {} } }
    })

    const [route] = mapper.toRoutes([{
      path: '/',
      authz: 'policy.parent',
      children: [{ path: '/name', method: 'GET', authz: 'platform.operate', handler: () => ({} as any) }]
    }])

    expect(route.getOption('authz')).toEqual(['policy.parent', 'platform.operate'])

    const order: string[] = []
    const middleware = middlewareWith({
      'policy.parent': { authorize: () => { order.push('parent'); return true } },
      'platform.operate': { authorize: () => { order.push('child'); return true } }
    })
    const event: any = {
      getRoute: () => ({ getOption: <T>(key: string): T | undefined => route.getOption(key) }),
      getMetadataValue: () => undefined
    }

    await expect(middleware.handle(event, (async () => 'ok') as any)).resolves.toBe('ok')
    expect(order).toEqual(['parent', 'child'])
  })
})
