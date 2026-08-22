import { RateLimit } from '../src/decorators/RateLimit'
import { Throttle } from '../src/decorators/Throttle'
import { THROTTLE_KEY } from '../src/decorators/constants'
import { RateLimitManager } from '../src/RateLimitManager'
import { getBlueprint, getMetadata } from '@stone-js/core'
import { MemoryRateLimiter } from '../src/drivers/MemoryRateLimiter'
import { RateLimitError } from '../src/errors/RateLimitError'
import { rateLimitBlueprint } from '../src/options/RateLimitBlueprint'
import { RateLimitServiceProvider } from '../src/RateLimitServiceProvider'
import { ThrottleRouteMiddleware } from '../src/middleware/ThrottleRouteMiddleware'

describe('activating the module', () => {
  it('contributes the provider and the enforcement, declaratively', () => {
    @RateLimit()
    class Application {}

    const blueprint = getBlueprint(Application)

    expect(blueprint?.stone?.providers).toContain(RateLimitServiceProvider)
    expect(blueprint?.stone?.router?.composableProps).toEqual(['rateLimit'])
  })

  it('carries the decorator options into the config bucket', () => {
    @RateLimit({ trustedAddressHeaders: ['cloudfront-viewer-address'], headers: false })
    class Application {}

    expect(getBlueprint(Application)?.stone?.rateLimit).toEqual({
      trustedAddressHeaders: ['cloudfront-viewer-address'],
      headers: false
    })
  })

  it('leaves the shared blueprint alone, so one application cannot configure another', () => {
    // The decorator clones before it writes: the module's blueprint is imported once per process, and
    // an application that mutated it would leak its options into every other one built in the same
    // process, tests and a monorepo build included.
    @RateLimit({ headers: false })
    class Application {}

    expect(getBlueprint(Application)?.stone?.rateLimit?.headers).toBe(false)
    expect(rateLimitBlueprint.stone.rateLimit).toEqual({})
  })

  it('says the same thing as registering the blueprint', () => {
    // The two activation paths are the same declaration: a decorator, or the blueprint, never a third
    // helper that could drift from either.
    @RateLimit()
    class Application {}

    const declarative = getBlueprint(Application)?.stone

    expect(declarative?.providers).toEqual(rateLimitBlueprint.stone.providers)
    expect(declarative?.router?.middleware).toEqual(rateLimitBlueprint.stone.router?.middleware)
  })
})

describe('declaring what a handler is throttled by', () => {
  it('records the rule against the method it decorates', () => {
    class AuthController {
      @Throttle({ max: 3, window: 900, by: 'email' })
      sendCode (): string { return 'sent' }
    }

    expect(getMetadata(AuthController, THROTTLE_KEY, [])).toEqual([
      { action: 'sendCode', rateLimit: { max: 3, window: 900, by: 'email' } }
    ])
  })

  it('keeps the rule of each method, not the last one declared', () => {
    class AuthController {
      @Throttle({ max: 3, window: 900, by: 'email' })
      sendCode (): string { return 'sent' }

      @Throttle({ max: 10, window: 60 })
      verify (): string { return 'ok' }
    }

    const declarations = getMetadata<any, Array<{ action: string, rateLimit: any }>>(AuthController, THROTTLE_KEY, [])

    expect(declarations.find((d) => d.action === 'sendCode')?.rateLimit.max).toBe(3)
    expect(declarations.find((d) => d.action === 'verify')?.rateLimit.max).toBe(10)
  })

  it('is enforced for the action the event is dispatched to', async () => {
    class AuthController {
      @Throttle({ max: 1, window: 60 })
      sendCode (): string { return 'sent' }

      @Throttle({ max: 5, window: 60 })
      verify (): string { return 'ok' }
    }

    const manager = RateLimitManager.create()
    manager.register('memory', MemoryRateLimiter.create())

    const middleware = new ThrottleRouteMiddleware({
      blueprint: { get: (_key: string, fallback?: unknown) => fallback } as any,
      container: { has: (key: unknown) => key === RateLimitManager, make: () => manager } as any
    })

    const event = (action: string): any => ({
      ip: '1.2.3.4',
      pathname: '/auth',
      get: <T>(_k: string, fallback?: T) => fallback,
      getRoute: () => ({
        getOption: <T>(key: string): T | undefined => ({
          name: `auth.${action}`,
          method: 'POST',
          path: `/auth/${action}`,
          handler: { module: AuthController, action }
        } as any)[key]
      })
    })

    const next = (async () => ({ setHeader: () => {} })) as any

    await middleware.handle(event('sendCode'), next)
    await expect(middleware.handle(event('sendCode'), next)).rejects.toThrow(RateLimitError)

    // The other action has its own budget, and the refused one did not spend it.
    await expect(middleware.handle(event('verify'), next)).resolves.toBeDefined()
  })

  it('lets a route override what the handler declared', async () => {
    class AuthController {
      @Throttle({ max: 1, window: 60 })
      sendCode (): string { return 'sent' }
    }

    const manager = RateLimitManager.create()
    manager.register('memory', MemoryRateLimiter.create())

    const middleware = new ThrottleRouteMiddleware({
      blueprint: { get: (_key: string, fallback?: unknown) => fallback } as any,
      container: { has: (key: unknown) => key === RateLimitManager, make: () => manager } as any
    })

    const event = (): any => ({
      ip: '1.2.3.4',
      pathname: '/auth/sendCode',
      get: <T>(_k: string, fallback?: T) => fallback,
      getRoute: () => ({
        getOption: <T>(key: string): T | undefined => ({
          name: 'auth.sendCode',
          method: 'POST',
          path: '/auth/sendCode',
          rateLimit: { max: 3, window: 60 },
          handler: { module: AuthController, action: 'sendCode' }
        } as any)[key]
      })
    })

    const next = (async () => ({ setHeader: () => {} })) as any

    await middleware.handle(event(), next)
    await middleware.handle(event(), next)

    // The route said 3, so the handler's 1 is not what fires.
    await expect(middleware.handle(event(), next)).resolves.toBeDefined()
    await expect(middleware.handle(event(), next)).rejects.toThrow(RateLimitError)
  })
})
