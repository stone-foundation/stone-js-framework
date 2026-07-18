import { Router } from '../src/Router'
import { RouterServiceProvider } from '../src/RouterServiceProvider'

describe('RouterServiceProvider', () => {
  const createMocks = (): any => {
    const eventEmitter = {}

    const make = vi.fn()
    make.mockImplementation((token: string) => {
      if (token === 'blueprint') {
        return {
          get: vi.fn(() => ({
            config: true
          }))
        }
      }
      if (token === 'eventEmitter') return eventEmitter
    })

    const container = {
      make,
      singletonIf: vi.fn((_cls, factory) => {
        factory(container)
        return container
      }),
      alias: vi.fn().mockReturnThis()
    }

    return { container, make, eventEmitter }
  }

  it('should register the router using singletonIf and alias', async () => {
    const { container } = createMocks()

    const createSpy = vi.spyOn(Router, 'create').mockReturnValue('routerInstance' as any)

    const provider = new RouterServiceProvider(container)
    await provider.register()

    expect(container.singletonIf).toHaveBeenCalledWith(Router, expect.any(Function))
    expect(container.alias).toHaveBeenCalledWith(Router, ['Router', 'router'])
    expect(createSpy).toHaveBeenCalled()
  })

  it('should construct correct router options using getRouterOptions()', () => {
    const eventEmitter = {}
    const blueprint = {
      get: vi.fn(() => ({}))
    }

    const container = {
      make: vi.fn((token: string) => {
        if (token === 'blueprint') return blueprint
        if (token === 'eventEmitter') return eventEmitter
      })
    }

    const provider = new RouterServiceProvider(container as any)

    // @ts-expect-error - private access
    const options = provider.getRouterOptions(container as any)
    expect(options.eventEmitter).toBe(eventEmitter)
    expect(options.dependencyResolver).toBe(container)
  })
})
