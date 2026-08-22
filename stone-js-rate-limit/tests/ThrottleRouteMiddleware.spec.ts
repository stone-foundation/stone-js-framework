import { RateLimitManager } from '../src/RateLimitManager'
import { RateLimitError } from '../src/errors/RateLimitError'
import { MemoryRateLimiter } from '../src/drivers/MemoryRateLimiter'
import { rateLimitBlueprint } from '../src/options/RateLimitBlueprint'
import { MetaThrottleRouteMiddleware, ThrottleRouteMiddleware } from '../src/middleware/ThrottleRouteMiddleware'

const makeEvent = (over: {
  rateLimit?: unknown
  body?: Record<string, unknown>
  address?: string
  headers?: Record<string, string>
  user?: unknown
  handler?: unknown
} = {}): any => ({
  ip: over.address ?? '1.2.3.4',
  pathname: '/login',
  get: <T>(key: string, fallback?: T) => (over.body?.[key] as T) ?? fallback,
  getHeader: <T>(name: string, fallback?: T) => (over.headers?.[name.toLowerCase()] as T) ?? fallback,
  getUser: () => over.user,
  getRoute: () => ({
    getOption: <T>(key: string): T | undefined => ({
      name: 'login',
      method: 'POST',
      path: '/login',
      rateLimit: over.rateLimit,
      handler: over.handler
    } as any)[key]
  })
})

const middlewareWith = (config: Record<string, unknown> = {}): ThrottleRouteMiddleware => {
  const manager = RateLimitManager.create()
  manager.register('memory', MemoryRateLimiter.create())

  return new ThrottleRouteMiddleware({
    blueprint: { get: (key: string, fallback?: unknown) => (key === 'stone.rateLimit' ? config : fallback) } as any,
    container: {
      has: (key: unknown) => key === RateLimitManager,
      make: () => manager
    } as any
  })
}

const next = (async () => ({ setHeader: () => {} })) as any

describe('what a route declared about its budget', () => {
  it('lets the allowance through and refuses past it', async () => {
    const middleware = middlewareWith()
    const rule = { max: 2, window: 60 }

    await expect(middleware.handle(makeEvent({ rateLimit: rule }), next)).resolves.toBeDefined()
    await expect(middleware.handle(makeEvent({ rateLimit: rule }), next)).resolves.toBeDefined()
    await expect(middleware.handle(makeEvent({ rateLimit: rule }), next)).rejects.toThrow(RateLimitError)
  })

  it('says when to come back, so a refusal does not invite a retry storm', async () => {
    const middleware = middlewareWith()

    await middleware.handle(makeEvent({ rateLimit: { max: 1, window: 60 } }), next)

    await middleware.handle(makeEvent({ rateLimit: { max: 1, window: 60 } }), next).catch((error: RateLimitError) => {
      expect(error.retryAfter).toBeGreaterThan(0)
      expect(error.statusCode).toBe(429)
      expect(error.headers['Retry-After']).toBe(String(error.retryAfter))
    })
  })

  it('passes everything through when nothing is declared', async () => {
    await expect(middlewareWith().handle(makeEvent(), next)).resolves.toBeDefined()
  })

  it('applies the global rule to a route that declares none', async () => {
    const middleware = middlewareWith({ global: { max: 1, window: 60 } })

    await middleware.handle(makeEvent(), next)

    await expect(middleware.handle(makeEvent(), next)).rejects.toThrow(RateLimitError)
  })
})

describe('throttling the subject rather than the address', () => {
  it('gives each subject its own budget, whatever address it arrives from', async () => {
    // The reason the module works this way: on a carrier-grade NAT network hundreds of unrelated
    // subscribers share one address, and a per-address quota punishes them at random.
    const middleware = middlewareWith()
    const rule = { max: 1, window: 900, by: 'email' }

    await middleware.handle(makeEvent({ rateLimit: rule, body: { email: 'a@x.test' }, address: '9.9.9.9' }), next)

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, body: { email: 'b@x.test' }, address: '9.9.9.9' }), next
    )).resolves.toBeDefined()
  })

  it('holds one subject to its budget across addresses', async () => {
    const middleware = middlewareWith()
    const rule = { max: 1, window: 900, by: 'email' }

    await middleware.handle(makeEvent({ rateLimit: rule, body: { email: 'a@x.test' }, address: '1.1.1.1' }), next)

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, body: { email: 'a@x.test' }, address: '2.2.2.2' }), next
    )).rejects.toThrow(RateLimitError)
  })

  it('normalises the subject, so one identity cannot buy two budgets', async () => {
    const middleware = middlewareWith()
    const rule = { max: 1, window: 900, by: 'email' }

    await middleware.handle(makeEvent({ rateLimit: rule, body: { email: 'a@x.test' } }), next)

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, body: { email: ' A@X.test ' } }), next
    )).rejects.toThrow(RateLimitError)
  })

  it('takes the first of several alternatives, each in its own bucket', async () => {
    const middleware = middlewareWith()
    const rule = { max: 1, window: 900, by: 'phone|email' }

    await middleware.handle(makeEvent({ rateLimit: rule, body: { phone: '+123' } }), next)

    // A phone and an email are different buckets: prefixed by field, they cannot collide.
    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, body: { email: '+123' } }), next
    )).resolves.toBeDefined()
  })

  it('keeps an address backstop against bulk enumeration, looser than the subject budget', async () => {
    const middleware = middlewareWith()
    const rule = { max: 1, window: 900, by: 'email', backstop: 2 }

    await middleware.handle(makeEvent({ rateLimit: rule, body: { email: 'a@x.test' } }), next)
    await middleware.handle(makeEvent({ rateLimit: rule, body: { email: 'b@x.test' } }), next)

    // Two subjects were fine; the third from the same machine hits the backstop.
    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, body: { email: 'c@x.test' } }), next
    )).rejects.toThrow(RateLimitError)
  })

  it('can run the subject budget alone', async () => {
    const middleware = middlewareWith()
    const rule = { max: 1, window: 900, by: 'email', backstop: false as const }

    for (const email of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']) {
      await middleware.handle(makeEvent({ rateLimit: rule, body: { email: `${email}@x.test` } }), next)
    }

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, body: { email: 'a@x.test' } }), next
    )).rejects.toThrow(RateLimitError)
  })

  it('falls back to the looser address bucket when the subject is absent', async () => {
    // A malformed request must not spend the strict per-subject budget, and must not be waved through
    // either.
    const middleware = middlewareWith()
    const rule = { max: 1, window: 900, by: 'email', backstop: 3 }

    await middleware.handle(makeEvent({ rateLimit: rule, body: {} }), next)
    await middleware.handle(makeEvent({ rateLimit: rule, body: {} }), next)
    await middleware.handle(makeEvent({ rateLimit: rule, body: {} }), next)

    await expect(middleware.handle(makeEvent({ rateLimit: rule, body: {} }), next)).rejects.toThrow(RateLimitError)
  })

  it('falls back to the address when the caller is not authenticated yet', async () => {
    // `by: 'user'` on a route reachable before sign-in has no principal to bill, and the request still
    // has to be bounded.
    const middleware = middlewareWith()
    const rule = { max: 1, window: 60, by: 'user', backstop: 2 }

    await middleware.handle(makeEvent({ rateLimit: rule }), next)
    await middleware.handle(makeEvent({ rateLimit: rule }), next)

    await expect(middleware.handle(makeEvent({ rateLimit: rule }), next)).rejects.toThrow(RateLimitError)
  })

  it('bills a principal the platform identifies by a plain value', async () => {
    // Not every application models its principal as an object with an id.
    const middleware = middlewareWith()
    const rule = { max: 1, window: 60, by: 'user', backstop: false as const }

    await middleware.handle(makeEvent({ rateLimit: rule, user: 'u1' as any }), next)

    await expect(middleware.handle(makeEvent({ rateLimit: rule, user: 'u2' as any }), next)).resolves.toBeDefined()
    await expect(middleware.handle(makeEvent({ rateLimit: rule, user: 'u1' as any }), next)).rejects.toThrow(RateLimitError)
  })

  it('treats a principal with no id as none at all', async () => {
    // Billing every such caller to one bucket named after an empty id would put unrelated people on a
    // shared budget, which is the exact failure a subject budget exists to avoid.
    const middleware = middlewareWith()
    const rule = { max: 1, window: 60, by: 'user', backstop: 2 }

    await middleware.handle(makeEvent({ rateLimit: rule, user: {} }), next)
    await middleware.handle(makeEvent({ rateLimit: rule, user: {} }), next)

    await expect(middleware.handle(makeEvent({ rateLimit: rule, user: {} }), next)).rejects.toThrow(RateLimitError)
  })

  it('throttles the authenticated principal when the rule says user', async () => {
    const middleware = middlewareWith()
    const rule = { max: 1, window: 60, by: 'user', backstop: false as const }

    await middleware.handle(makeEvent({ rateLimit: rule, user: { id: 'u1' } }), next)

    await expect(middleware.handle(makeEvent({ rateLimit: rule, user: { id: 'u2' } }), next)).resolves.toBeDefined()
    await expect(middleware.handle(makeEvent({ rateLimit: rule, user: { id: 'u1' } }), next)).rejects.toThrow(RateLimitError)
  })
})

describe('the address the budget is keyed on', () => {
  it('ignores a forwarded header unless the application named it trusted', async () => {
    // A forwarded header is client-spoofable unless a proxy overwrites it. Reading one by default
    // would hand every caller an unlimited supply of identities.
    const middleware = middlewareWith()
    const rule = { max: 1, window: 60 }

    await middleware.handle(makeEvent({ rateLimit: rule, headers: { 'x-forwarded-for': '5.5.5.5' } }), next)

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, headers: { 'x-forwarded-for': '6.6.6.6' } }), next
    )).rejects.toThrow(RateLimitError)
  })

  it('reads the header the application does trust', async () => {
    const middleware = middlewareWith({ trustedAddressHeaders: ['cloudfront-viewer-address'] })
    const rule = { max: 1, window: 60 }

    await middleware.handle(makeEvent({ rateLimit: rule, headers: { 'cloudfront-viewer-address': '5.5.5.5:1234' } }), next)

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, headers: { 'cloudfront-viewer-address': '6.6.6.6:1234' } }), next
    )).resolves.toBeDefined()
  })

  it('skips a trusted header the request did not carry, and keeps looking', async () => {
    const middleware = middlewareWith({ trustedAddressHeaders: ['cloudfront-viewer-address', 'true-client-ip'] })
    const rule = { max: 1, window: 60 }

    await middleware.handle(makeEvent({ rateLimit: rule, headers: { 'true-client-ip': '7.7.7.7' } }), next)

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, headers: { 'true-client-ip': '8.8.8.8' } }), next
    )).resolves.toBeDefined()
  })

  it('ignores a trusted header that arrived empty', async () => {
    // An edge that sets the header unconditionally sends an empty one for a request it could not
    // resolve, and an empty string is one bucket for everybody.
    const middleware = middlewareWith({ trustedAddressHeaders: ['cloudfront-viewer-address'] })
    const rule = { max: 1, window: 60 }

    await middleware.handle(makeEvent({ rateLimit: rule, headers: { 'cloudfront-viewer-address': '  ' }, address: '4.4.4.4' }), next)

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, headers: { 'cloudfront-viewer-address': '  ' }, address: '5.5.5.5' }), next
    )).resolves.toBeDefined()
  })

  it('still counts an event that reports no address at all', async () => {
    // Some transports do not carry one. A limit that quietly stopped applying there would be worse
    // than one bucket shared by those callers.
    const middleware = middlewareWith()
    const event = (): any => ({
      pathname: '/login',
      get: <T>(_k: string, fallback?: T) => fallback,
      getRoute: () => ({
        getOption: <T>(key: string): T | undefined => (
          { name: 'login', method: 'POST', path: '/login', rateLimit: { max: 1, window: 60 } } as any
        )[key]
      })
    })

    await middleware.handle(event(), next)

    await expect(middleware.handle(event(), next)).rejects.toThrow(RateLimitError)
  })

  it('strips the port, so one caller cannot reconnect for a fresh budget', async () => {
    const middleware = middlewareWith({ trustedAddressHeaders: ['cloudfront-viewer-address'] })
    const rule = { max: 1, window: 60 }

    await middleware.handle(makeEvent({ rateLimit: rule, headers: { 'cloudfront-viewer-address': '5.5.5.5:1111' } }), next)

    await expect(middleware.handle(
      makeEvent({ rateLimit: rule, headers: { 'cloudfront-viewer-address': '5.5.5.5:2222' } }), next
    )).rejects.toThrow(RateLimitError)
  })
})

describe('several rules that all apply', () => {
  it('enforces them in order and refuses on the first exceeded', async () => {
    // What a group's budget composed with a route's looks like once the router has flattened them.
    const middleware = middlewareWith()
    const rules = [{ max: 5, window: 60 }, { max: 1, window: 60 }]

    await middleware.handle(makeEvent({ rateLimit: rules }), next)

    await expect(middleware.handle(makeEvent({ rateLimit: rules }), next)).rejects.toThrow(RateLimitError)
  })
})

describe('telling the caller where it stands', () => {
  it('publishes the budget on the response when it can carry headers', async () => {
    const headers: Record<string, string> = {}
    const middleware = middlewareWith()

    await middleware.handle(
      makeEvent({ rateLimit: { max: 5, window: 60 } }),
      (async () => ({ setHeader: (name: string, value: string) => { headers[name] = value } })) as any
    )

    expect(headers['RateLimit-Limit']).toBe('5')
    expect(headers['RateLimit-Remaining']).toBe('4')
    expect(headers['RateLimit-Reset']).toBeDefined()
  })

  it('publishes what a driver that cannot count what is left reports', async () => {
    // A driver refusing through a conditional write may know only allowed or not, and the headers must
    // still be well formed rather than say `undefined`.
    const headers: Record<string, string> = {}
    const manager = RateLimitManager.create('sparse')
    manager.register('sparse', { hit: async () => ({ allowed: true, resetAt: Date.now() + 60_000 }) })

    const middleware = new ThrottleRouteMiddleware({
      blueprint: { get: (_key: string, fallback?: unknown) => fallback } as any,
      container: { has: (key: unknown) => key === RateLimitManager, make: () => manager } as any
    })

    await middleware.handle(
      makeEvent({ rateLimit: { max: 5, window: 60 } }),
      (async () => ({ setHeader: (name: string, value: string) => { headers[name] = value } })) as any
    )

    expect(headers['RateLimit-Remaining']).toBe('0')
  })

  it('reports one budget even when no driver can say what is left', async () => {
    const headers: Record<string, string> = {}
    const manager = RateLimitManager.create('sparse')
    manager.register('sparse', { hit: async () => ({ allowed: true, resetAt: Date.now() + 60_000 }) })

    const middleware = new ThrottleRouteMiddleware({
      blueprint: { get: (_key: string, fallback?: unknown) => fallback } as any,
      container: { has: (key: unknown) => key === RateLimitManager, make: () => manager } as any
    })

    await middleware.handle(
      makeEvent({ rateLimit: [{ max: 5, window: 60 }, { max: 2, window: 60 }] }),
      (async () => ({ setHeader: (name: string, value: string) => { headers[name] = value } })) as any
    )

    // Nothing distinguishes them, so the first one counted is reported rather than none.
    expect(headers['RateLimit-Limit']).toBe('5')
  })

  it('says nothing when the application would rather not publish its budget', async () => {
    const headers: Record<string, string> = {}
    const middleware = middlewareWith({ headers: false })

    await middleware.handle(
      makeEvent({ rateLimit: { max: 5, window: 60 } }),
      (async () => ({ setHeader: (name: string, value: string) => { headers[name] = value } })) as any
    )

    expect(headers).toEqual({})
  })

  it('leaves a response that carries no headers alone', async () => {
    const middleware = middlewareWith()

    await expect(middleware.handle(
      makeEvent({ rateLimit: { max: 5, window: 60 } }),
      (async () => 'a plain value') as any
    )).resolves.toBe('a plain value')
  })
})

describe('reaching the limiter and the log', () => {
  afterEach(() => { RateLimitManager.setInstance(undefined) })

  it('uses the published manager when no container is around', async () => {
    // A single-handler application or a command has no route middleware container to read from, and a
    // limit must still be a limit there.
    const manager = RateLimitManager.create()
    manager.register('memory', MemoryRateLimiter.create())
    RateLimitManager.setInstance(manager)

    const middleware = new ThrottleRouteMiddleware({
      blueprint: { get: (_key: string, fallback?: unknown) => fallback } as any
    })

    await middleware.handle(makeEvent({ rateLimit: { max: 1, window: 60 } }), next)

    await expect(middleware.handle(makeEvent({ rateLimit: { max: 1, window: 60 } }), next))
      .rejects.toThrow(RateLimitError)
  })

  it('still limits when nothing was published either', async () => {
    const middleware = new ThrottleRouteMiddleware({
      blueprint: { get: (_key: string, fallback?: unknown) => fallback } as any
    })

    await expect(middleware.handle(makeEvent({ rateLimit: { max: 1, window: 60 } }), next)).resolves.toBeDefined()
  })

  it('logs a refusal without the subject, the address or the body', async () => {
    // A log line is read by more people than a database row, so it carries what is needed to see abuse
    // and nothing that identifies whoever was refused.
    const warned: any[] = []
    const manager = RateLimitManager.create()
    manager.register('memory', MemoryRateLimiter.create())

    const middleware = new ThrottleRouteMiddleware({
      blueprint: { get: (key: string, fallback?: unknown) => (key === 'stone.rateLimit' ? {} : fallback) } as any,
      container: {
        has: (key: unknown) => key === RateLimitManager || key === 'logger',
        make: (key: unknown) => (key === 'logger' ? { warn: (...args: any[]) => warned.push(args) } : manager)
      } as any
    })

    const rule = { max: 1, window: 60, by: 'email', backstop: false as const }
    await middleware.handle(makeEvent({ rateLimit: rule, body: { email: 'a@x.test' } }), next)
    await middleware.handle(makeEvent({ rateLimit: rule, body: { email: 'a@x.test' } }), next).catch(() => {})

    expect(warned).toHaveLength(1)
    const [message, context] = warned[0]
    expect(message).toBe('Rate limit exceeded')
    expect(context).toMatchObject({ limit: 1, by: 'email' })
    expect(JSON.stringify(context)).not.toContain('a@x.test')
  })
})

describe('an event with no route at all', () => {
  it('is throttled on the global rule, keyed on where it arrived', async () => {
    // A command or a queue consumer carries no route, and a global budget still has to mean something.
    const manager = RateLimitManager.create()
    manager.register('memory', MemoryRateLimiter.create())

    const middleware = new ThrottleRouteMiddleware({
      blueprint: {
        get: (key: string, fallback?: unknown) => (key === 'stone.rateLimit' ? { global: { max: 1, window: 60 } } : fallback)
      } as any,
      container: { has: (key: unknown) => key === RateLimitManager, make: () => manager } as any
    })

    const event = (): any => ({
      ip: '1.2.3.4',
      pathname: '/import',
      get: <T>(_k: string, fallback?: T) => fallback
    })

    await middleware.handle(event(), next)

    await expect(middleware.handle(event(), next)).rejects.toThrow(RateLimitError)
  })

  it('reads what a bare event handler declared with @Throttle', async () => {
    const { Throttle } = await import('../src/decorators/Throttle')

    class ImportCommand {
      @Throttle({ max: 1, window: 60 })
      handle (): string { return 'done' }
    }

    const manager = RateLimitManager.create()
    manager.register('memory', MemoryRateLimiter.create())

    const middleware = new ThrottleRouteMiddleware({
      blueprint: {
        get: (key: string, fallback?: unknown) => (
          key === 'stone.kernel.eventHandler' ? { module: ImportCommand } : fallback
        )
      } as any,
      container: { has: (key: unknown) => key === RateLimitManager, make: () => manager } as any
    })

    // No route, no action, and no path either: a command has none of the three, and its declaration
    // is still what applies.
    const event = (): any => ({ ip: '1.2.3.4', get: <T>(_k: string, f?: T) => f })

    await middleware.handle(event(), next)

    await expect(middleware.handle(event(), next)).rejects.toThrow(RateLimitError)
  })

  it('limits nothing for a handler that declared nothing', async () => {
    class ImportCommand {
      run (): string { return 'done' }
    }

    const manager = RateLimitManager.create()
    manager.register('memory', MemoryRateLimiter.create())

    const middleware = new ThrottleRouteMiddleware({
      blueprint: {
        get: (key: string, fallback?: unknown) => (
          key === 'stone.kernel.eventHandler' ? { module: ImportCommand } : fallback
        )
      } as any,
      container: { has: (key: unknown) => key === RateLimitManager, make: () => manager } as any
    })

    const event = (): any => ({ ip: '1.2.3.4', pathname: '/import', get: <T>(_k: string, f?: T) => f })

    // Nothing is declared on it, so nothing is limited: the handler has to say so itself.
    await expect(middleware.handle(event(), next)).resolves.toBeDefined()
  })
})

describe('where the enforcement sits', () => {
  it('runs before authentication, authorization and validation', () => {
    // Rejecting a caller past its budget is worth nothing once the expensive work is done, so this is
    // the outermost route middleware: auth is 3, authz and resources 4, validation 5.
    expect(MetaThrottleRouteMiddleware).toEqual(
      expect.objectContaining({ module: ThrottleRouteMiddleware, isClass: true, priority: 1 })
    )
    expect(rateLimitBlueprint.stone.router?.middleware).toEqual([MetaThrottleRouteMiddleware])
  })

  it('declares its route prop composable, so a group budget holds for every child', () => {
    expect(rateLimitBlueprint.stone.router?.composableProps).toEqual(['rateLimit'])
  })
})
