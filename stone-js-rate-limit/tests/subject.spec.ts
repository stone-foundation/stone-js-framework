import { IncomingHttpEvent } from '@stone-js/http-core'
import { RateLimitManager } from '../src/RateLimitManager'
import { RateLimitError } from '../src/errors/RateLimitError'
import { MemoryRateLimiter } from '../src/drivers/MemoryRateLimiter'
import { rateLimitBlueprint } from '../src/options/RateLimitBlueprint'
import { ThrottleRouteMiddleware } from '../src/middleware/ThrottleRouteMiddleware'

/**
 * A store nobody else counts in.
 *
 * The memory limiter keeps its counters under its configured name, because a store is where
 * inter-request state belongs. Two tests sharing a name would share the counting, so each test asks
 * for its own, which is also how two limiters are separated in an application.
 */
let stores = 0
const ownStore = (): any => MemoryRateLimiter.create({ name: `test-${++stores}` })

const next = (async () => ({ setHeader: () => {} })) as any

/** Only the downgrade warnings: a refusal warns too, and that is a different event. */
const downgrades = (warnings: any[]): any[] =>
  warnings.filter(([message]) => String(message).includes('falling back to the address bucket'))

const enforcerFor = (config: Record<string, unknown> = {}, extras: Record<string, unknown> = {}): {
  middleware: ThrottleRouteMiddleware
  warnings: any[]
} => {
  const manager = RateLimitManager.create()
  manager.register('memory', ownStore())
  const warnings: any[] = []

  const bound: Record<string, unknown> = { logger: { warn: (...args: any[]) => warnings.push(args), debug: () => {} }, ...extras }

  const middleware = new ThrottleRouteMiddleware({
    blueprint: { get: (key: string, fallback?: unknown) => (key === 'stone.rateLimit' ? config : fallback) } as any,
    container: {
      has: (key: unknown) => key === RateLimitManager || (typeof key === 'string' && key in bound),
      make: (key: unknown) => (key === RateLimitManager ? manager : bound[key as string])
    } as any
  })

  return { middleware, warnings }
}

/** A real HTTP event on a real route, deliberately left unbound, as the router layer sees it. */
const realEventOn = async (rule: unknown, url: string, body: Record<string, unknown> = {}): Promise<any> => {
  const { RouteMapper } = await import('@stone-js/router')
  const routes = (RouteMapper as any).create({
    maxDepth: 5,
    matchers: [],
    composableProps: rateLimitBlueprint.stone.router?.composableProps,
    dispatchers: { callable: class { static create (): any { return new this() } dispatch (): any {} } }
  }).toRoutes([{ path: '/notes/:code', method: 'POST', rateLimit: rule, handler: () => ({}) }])

  const route = routes.find((r: any) => r.getOption('method') === 'POST')
  const event = IncomingHttpEvent.create({
    url: new URL(`http://x${url}`), method: 'POST', body, ip: '1.2.3.4'
  } as any)

  event.setRouteResolver(() => route)

  return event
}

describe('reading the subject of a real request', () => {
  it('never breaks the route it protects, whatever the read costs', async () => {
    // The failure this pins, measured end to end: `event.get()` consults the route parameters first,
    // and on the router layer they are bound only after the route middleware have run. So a rule
    // naming any field, a body field included, raised "Event is not bound" and the route answered 500
    // with a perfectly working limiter behind it.
    const { middleware } = enforcerFor()
    const event = await realEventOn({ max: 3, window: 900, by: 'email' }, '/notes/abc', { email: 'a@x.test' })

    await expect(middleware.handle(event, next)).resolves.toBeDefined()
  })

  it('bills a body field of a real unbound event', async () => {
    const { middleware, warnings } = enforcerFor()
    const rule = { max: 1, window: 900, by: 'email', backstop: false as const }

    await middleware.handle(await realEventOn(rule, '/notes/abc', { email: 'a@x.test' }), next)

    await expect(middleware.handle(await realEventOn(rule, '/notes/abc', { email: 'a@x.test' }), next))
      .rejects.toThrow(RateLimitError)

    // A different mailbox has its own budget, and nothing was downgraded along the way.
    await expect(middleware.handle(await realEventOn(rule, '/notes/abc', { email: 'b@x.test' }), next))
      .resolves.toBeDefined()
    expect(downgrades(warnings)).toHaveLength(0)
  })

  it('treats an empty field as no subject at all', async () => {
    // A form that posted an empty box must not put every such caller on one shared budget: an empty
    // string is a value, and it would hash to a single bucket they all pay into.
    const { middleware, warnings } = enforcerFor()
    const rule = { max: 1, window: 900, by: 'email', backstop: 3 }

    await middleware.handle(await realEventOn(rule, '/notes/abc', { email: '' }), next)

    expect(downgrades(warnings)).toHaveLength(1)
  })

  it('bills a route parameter, through the router rather than the unbound event', async () => {
    // The router owns the find-bind-read dance (`findParam`) precisely because parameters are not
    // bound yet here. It is asked through the container, so this module still imports no router.
    // The router's contract, spelled out: find the route, bind it, read the parameter. This is what
    // `Router.findParam` does and memoizes; asked through the container, duck-typed, so this module
    // still imports no router. The real one is exercised end to end on a server.
    const router = {
      findParam: async (event: any, name: string) => {
        const route = event.getRoute()
        await route.bind(event)
        return route.getParam(name)
      }
    }

    const { middleware } = enforcerFor({}, { router })
    const rule = { max: 1, window: 900, by: 'code', backstop: false as const }

    await middleware.handle(await realEventOn(rule, '/notes/abc'), next)

    await expect(middleware.handle(await realEventOn(rule, '/notes/abc'), next)).rejects.toThrow(RateLimitError)

    // Another code is another subject, so it keeps its own budget.
    await expect(middleware.handle(await realEventOn(rule, '/notes/xyz'), next)).resolves.toBeDefined()
  })

  it('falls back to the address when a router is not around to bind anything', async () => {
    const { middleware, warnings } = enforcerFor()
    const rule = { max: 1, window: 900, by: 'code', backstop: 3 }

    await middleware.handle(await realEventOn(rule, '/notes/abc'), next)

    expect(downgrades(warnings)).toHaveLength(1)
  })
})

describe('a subject the application resolves itself', () => {
  it('bills whatever the resolver returns', async () => {
    // The real answer to "where does the subject live": the application knows, and this module has no
    // business guessing. It also covers every shape no field spec can reach: a claim in a token, a
    // header an edge signs, a lookup an earlier middleware already did.
    const { middleware } = enforcerFor()
    const rule = {
      max: 1,
      window: 60,
      backstop: false as const,
      by: (event: any) => event.getHeader?.('x-account') as string | undefined
    }

    const event = (account: string): any => ({
      ip: '1.2.3.4',
      pathname: '/notes',
      get: () => { throw new Error('Event is not bound') },
      getHeader: (name: string) => (name.toLowerCase() === 'x-account' ? account : undefined),
      getRoute: () => ({
        getOption: <T>(k: string): T | undefined => ({ name: 'notes', method: 'GET', path: '/notes', rateLimit: rule } as any)[k]
      })
    })

    await middleware.handle(event('acct-1'), next)

    await expect(middleware.handle(event('acct-2'), next)).resolves.toBeDefined()
    await expect(middleware.handle(event('acct-1'), next)).rejects.toThrow(RateLimitError)
  })

  it('degrades and says so when the resolver throws', async () => {
    // An application's resolver is application code, and application code throws. A limiter that let
    // that reach the caller would be a limiter that breaks the route it protects.
    const { middleware, warnings } = enforcerFor()
    const rule = { max: 1, window: 60, backstop: 3, by: () => { throw new Error('token expired') } }

    const event = (): any => ({
      ip: '1.2.3.4',
      pathname: '/notes',
      get: () => { throw new Error('Event is not bound') },
      getRoute: () => ({
        getOption: <T>(k: string): T | undefined => ({ name: 'notes', method: 'GET', path: '/notes', rateLimit: rule } as any)[k]
      })
    })

    await expect(middleware.handle(event(), next)).resolves.toBeDefined()
    expect(downgrades(warnings)).toHaveLength(1)
  })
})

describe('the authenticated principal', () => {
  const eventWithUser = (user: unknown, rateLimit: unknown): any => ({
    ip: '1.2.3.4',
    pathname: '/notes',
    get: () => { throw new Error('Event is not bound') },
    getUser: () => user,
    getRoute: () => ({
      getOption: <T>(k: string): T | undefined => ({ name: 'notes', method: 'GET', path: '/notes', rateLimit } as any)[k]
    })
  })

  it('is read through the resolver the application configured', async () => {
    // Needed because this module runs before authentication, deliberately. Where a principal lives,
    // and whether one exists at all this early, is the application's business.
    const { middleware, warnings } = enforcerFor({ principal: (event: any) => event.getUser()?.actor?.userId })
    const rule = { max: 1, window: 60, by: 'user', backstop: false as const }

    await middleware.handle(eventWithUser({ actor: { userId: 'u1' } }, rule), next)

    await expect(middleware.handle(eventWithUser({ actor: { userId: 'u2' } }, rule), next)).resolves.toBeDefined()
    await expect(middleware.handle(eventWithUser({ actor: { userId: 'u1' } }, rule), next)).rejects.toThrow(RateLimitError)
    expect(downgrades(warnings)).toHaveLength(0)
  })

  it('defaults to id, then sub, then userId', async () => {
    // The three shapes a principal almost always has, `sub` being the one a token carries. A
    // principal shaped otherwise is what the resolver above is for, rather than a mirror field an
    // application has to add for this module's benefit.
    for (const user of [{ id: 'u1' }, { sub: 'u1' }, { userId: 'u1' }]) {
      const { middleware, warnings } = enforcerFor()
      const rule = { max: 1, window: 60, by: 'user', backstop: false as const }

      await middleware.handle(eventWithUser(user, rule), next)

      await expect(middleware.handle(eventWithUser(user, rule), next)).rejects.toThrow(RateLimitError)
      expect(downgrades(warnings)).toHaveLength(0)
    }
  })

  it('warns when a rule asks for one and nothing resolved it', async () => {
    // The silence this removes: with no principal, the rule fell back to the address at ten times the
    // limit, so a budget of three allowed thirty. No error, no log, every test green, and behind a
    // shared address unrelated callers paying for one.
    const { middleware, warnings } = enforcerFor()

    await middleware.handle(eventWithUser(undefined, { max: 1, window: 60, by: 'user' }), next)

    expect(downgrades(warnings)).toHaveLength(1)
    expect(downgrades(warnings)[0][1]).toMatchObject({ by: 'user', limit: 1 })
  })

  it('says nothing when the rule asked for the address in the first place', async () => {
    // The warning marks a downgrade, and there is none to report when the address is what was asked
    // for. A limiter that warned on every request would be a limiter nobody reads the logs of.
    const { middleware, warnings } = enforcerFor()

    await middleware.handle(eventWithUser(undefined, { max: 1, window: 60, by: 'address' }), next)

    expect(downgrades(warnings)).toHaveLength(0)
  })
})

describe('what a refusal carries', () => {
  it('names itself with a stable code, so an application maps it without importing the class', async () => {
    const error = new RateLimitError('Too many requests.', { retryAfter: 30, resetAt: 1, limit: 3 })

    expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
  })

  it('lets a caller override the code, since an application may own its taxonomy', () => {
    const error = new RateLimitError('Too many requests.', { retryAfter: 30, resetAt: 1, limit: 3, code: 'MINE' })

    expect(error.code).toBe('MINE')
  })
})

describe('a rule that names no subject at all', () => {
  // `by` is required, and the type enforces that for TypeScript. Stone.js is JavaScript as much as
  // TypeScript, so the doctrine cannot rest on a type: a vanilla application would otherwise get the
  // silent default this module argues against, which is the exact failure the requirement removes.
  const eventWith = (rateLimit: unknown): any => ({
    ip: '1.2.3.4',
    pathname: '/notes',
    get: () => { throw new Error('Event is not bound') },
    getRoute: () => ({
      getOption: <T>(k: string): T | undefined => ({ name: 'notes', method: 'GET', path: '/notes', rateLimit } as any)[k]
    })
  })

  it('says so out loud, naming the route and the way out', async () => {
    const { middleware, warnings } = enforcerFor()

    await middleware.handle(eventWith({ max: 2, window: 60 }), next)

    const said = warnings.filter(([m]) => String(m).includes('declares no `by`'))
    expect(said).toHaveLength(1)
    expect(said[0][0]).toMatch(/by: 'address'/)
    expect(said[0][1]).toMatchObject({ scope: 'notes:GET /notes', limit: 2 })
  })

  it('is still enforced, on the address, rather than waved through', async () => {
    const { middleware } = enforcerFor()

    await middleware.handle(eventWith({ max: 1, window: 60 }), next)

    await expect(middleware.handle(eventWith({ max: 1, window: 60 }), next)).rejects.toThrow(RateLimitError)
  })

  it('says nothing once the word is there', async () => {
    const { middleware, warnings } = enforcerFor()

    await middleware.handle(eventWith({ max: 2, window: 60, by: 'address' }), next)

    expect(warnings.filter(([m]) => String(m).includes('declares no `by`'))).toHaveLength(0)
  })
})

describe('a subject that does not say who it is', () => {
  const eventWithUser = (user: unknown, rateLimit: unknown): any => ({
    ip: '1.2.3.4',
    pathname: '/notes',
    get: () => { throw new Error('Event is not bound') },
    getUser: () => user,
    getRoute: () => ({
      getOption: <T>(k: string): T | undefined => ({ name: 'notes', method: 'GET', path: '/notes', rateLimit } as any)[k]
    })
  })

  it('does not put two principals in one bucket because their ids stringify alike', async () => {
    // `String({})` is `'[object Object]'`, and that is a perfectly good bucket key. So every caller
    // whose id happened to be a plain object shared one counter and spent each other's budget: two
    // strangers, one limit, silently. The subject is refused instead, which sends the request to the
    // address bucket, and that path warns.
    const { middleware, warnings } = enforcerFor()
    const rule = { max: 1, window: 60, by: 'user', backstop: false as const }

    await middleware.handle(eventWithUser({ id: { oid: 'a' } }, rule), next)

    // The second caller is a different principal. Under the shared '[object Object]' key it was
    // refused on its first request, having spent nothing.
    await expect(middleware.handle(eventWithUser({ id: { oid: 'b' } }, rule), next)).resolves.toBeDefined()
    expect(downgrades(warnings)).toHaveLength(2)
  })

  it('keeps an id that defines its own toString, which is what a database driver hands over', async () => {
    // An ObjectId, a branded identifier, a `Date`: these say something distinct, and refusing them
    // would downgrade a perfectly identified caller to the address bucket.
    const { middleware, warnings } = enforcerFor()
    const rule = { max: 1, window: 60, by: 'user', backstop: false as const }
    const id = (value: string): unknown => ({ toString: () => value })

    await middleware.handle(eventWithUser({ id: id('u1') }, rule), next)

    await expect(middleware.handle(eventWithUser({ id: id('u2') }, rule), next)).resolves.toBeDefined()
    await expect(middleware.handle(eventWithUser({ id: id('u1') }, rule), next)).rejects.toThrow(RateLimitError)
    expect(downgrades(warnings)).toHaveLength(0)
  })

  it('refuses a field of the request that stringifies to nothing useful', async () => {
    // Same failure through the other door: a body field declared as the subject, arriving as an
    // object because a client sent one. Every such request would have shared a bucket.
    const { middleware, warnings } = enforcerFor()
    const rule = { max: 1, window: 900, by: 'email', backstop: false as const }
    const event = await realEventOn(rule, '/notes/abc', { email: { address: 'a@x.test' } })

    await expect(middleware.handle(event, next)).resolves.toBeDefined()
    expect(downgrades(warnings)).toHaveLength(1)
  })
})
