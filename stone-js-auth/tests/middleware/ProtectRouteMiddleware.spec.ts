import { getMetadata, hasMetadata } from '@stone-js/core'
import { Protect } from '../../src/decorators/Protect'
import { PROTECT_KEY } from '../../src/decorators/constants'
import { AuthenticationError, AuthorizationError } from '../../src/errors/AuthErrors'
import { MetaProtectRouteMiddleware, ProtectRouteMiddleware } from '../../src/middleware/ProtectRouteMiddleware'

const makeEvent = (claims?: unknown, route?: unknown, handler?: unknown): any => ({
  getMetadataValue: (key: string) => (key === 'auth' ? claims : undefined),
  getRoute: () => (route === undefined && handler === undefined
    ? undefined
    : { getOption: (k: string) => (k === 'handler' ? handler : route) })
})

const blueprint = (eventHandler?: unknown): any => ({
  get: (key: string, fallback: unknown) => (key === 'stone.kernel.eventHandler' ? eventHandler ?? fallback : fallback)
})

const next = vi.fn(async () => 'response' as any)

describe('ProtectRouteMiddleware', () => {
  beforeEach(() => next.mockClear())

  it('lets an unprotected route through untouched', async () => {
    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint() })

    await expect(middleware.handle(makeEvent(), next)).resolves.toBe('response')
  })

  it('refuses an anonymous caller on a protected route', async () => {
    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint() })

    await expect(middleware.handle(makeEvent(undefined, true), next)).rejects.toThrow(AuthenticationError)
    expect(next).not.toHaveBeenCalled()
  })

  it('lets an authenticated caller through when only authentication is required', async () => {
    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint() })

    await expect(middleware.handle(makeEvent({ sub: '1' }, true), next)).resolves.toBe('response')
  })

  it('refuses an authenticated caller missing a scope, with 403 rather than 401', async () => {
    // The distinction matters to the caller: retrying with credentials will not help.
    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ sub: '1', scope: 'tasks:read' }, 'tasks:write')

    await expect(middleware.handle(event, next)).rejects.toThrow(AuthorizationError)
    await expect(middleware.handle(event, next)).rejects.toThrow(/tasks:write/)
  })

  it('accepts several required scopes, and names every missing one at once', async () => {
    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ sub: '1', scope: 'a' }, ['a', 'b', 'c'])

    await expect(middleware.handle(event, next)).rejects.toThrow(/b, c/)
  })

  it('passes when every required scope is granted', async () => {
    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint() })

    await expect(middleware.handle(makeEvent({ sub: '1', scope: 'a b' }, ['a', 'b']), next)).resolves.toBe('response')
  })
})

describe('@Protect: the requirement is declared, not wired', () => {
  it('records what a handler method requires', () => {
    class Controller {
      @Protect()
      me (): void {}

      @Protect('tasks:write')
      create (): void {}
    }

    expect(hasMetadata(Controller, PROTECT_KEY)).toBe(true)
    // Lookup is by action name, so the recorded order is not part of the contract.
    expect(getMetadata<any, any[]>(Controller, PROTECT_KEY, [])).toEqual(expect.arrayContaining([
      { action: 'me', auth: true },
      { action: 'create', auth: 'tasks:write' }
    ]))
  })

  it('is enforced from the handler metadata, with no route option', async () => {
    class Controller {
      @Protect('tasks:write')
      create (): void {}
    }

    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ sub: '1', scope: 'tasks:read' }, undefined, { module: Controller, action: 'create' })

    await expect(middleware.handle(event, next)).rejects.toThrow(AuthorizationError)
  })

  it('is enforced with no router at all, from the application event handler', async () => {
    class Handler {
      @Protect()
      handle (): void {}
    }

    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint({ module: Handler, action: 'handle' }) })

    await expect(middleware.handle(makeEvent(), next)).rejects.toThrow(AuthenticationError)
  })

  it('reads the single declaration of a handler with no named action', async () => {
    class Handler {
      @Protect()
      handle (): void {}
    }

    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint({ module: Handler }) })

    await expect(middleware.handle(makeEvent({ sub: '1' }), next)).resolves.toBe('response')
  })

  it('lets the route option win, since a route is the single description of itself', async () => {
    class Controller {
      @Protect('from:method')
      create (): void {}
    }

    const middleware = new ProtectRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ sub: '1', scope: 'from:route' }, 'from:route', { module: Controller, action: 'create' })

    await expect(middleware.handle(event, next)).resolves.toBe('response')
  })

  it('runs ahead of validation: no point parsing a payload a caller may not send', () => {
    expect(MetaProtectRouteMiddleware).toEqual(
      expect.objectContaining({ module: ProtectRouteMiddleware, isClass: true, priority: 3 })
    )
  })
})
