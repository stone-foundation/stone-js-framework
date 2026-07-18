import { CoreServiceProvider } from '../../src/providers/CoreServiceProvider'

/* eslint-disable @typescript-eslint/no-extraneous-class */

describe('CoreServiceProvider', () => {
  describe('register', () => {
    it('should call all internal register* methods', () => {
      const container = {}
      const blueprint = {}
      const logger = {}
      const eventEmitter = {}

      const provider = new CoreServiceProvider({ container, blueprint, logger, eventEmitter } as any)

      const s = vi.spyOn(provider as any, 'registerServices').mockImplementation(() => {})
      const m = vi.spyOn(provider as any, 'registerMiddleware').mockImplementation(() => {})
      const a = vi.spyOn(provider as any, 'registerAliases').mockImplementation(() => {})

      provider.register()

      expect(s).toHaveBeenCalled()
      expect(m).toHaveBeenCalled()
      expect(a).toHaveBeenCalled()
    })
  })

  describe('boot', () => {
    it('should call bootSubscribers', async () => {
      const container = {}
      const blueprint = {}
      const logger = {}
      const eventEmitter = {}

      const provider = new CoreServiceProvider({ container, blueprint, logger, eventEmitter } as any)

      const bootSpy = vi.spyOn(provider as any, 'bootSubscribers').mockImplementation(() => {})
      const l = vi.spyOn(provider as any, 'registerListeners').mockImplementation(() => {})

      await provider.boot()

      expect(l).toHaveBeenCalled()
      expect(bootSpy).toHaveBeenCalled()
    })
  })

  describe('registerAliases', () => {
    it('should register all constructor aliases into the container', () => {
      const MyService = class {}

      const container = { alias: vi.fn() }
      const blueprint = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'stone.aliases') {
            return {
              MyServiceAlias: MyService,
              NonConstructor: 'not-a-class'
            }
          }
          return undefined
        })
      }

      const provider = new CoreServiceProvider({
        container: container as any,
        blueprint: blueprint as any,
        eventEmitter: {} as any,
        logger: {} as any
      })

      // @ts-expect-error access private
      provider.registerAliases()

      expect(container.alias).toHaveBeenCalledTimes(1)
      expect(container.alias).toHaveBeenCalledWith(MyService, 'MyServiceAlias')
    })
  })

  describe('registerServices', () => {
    it('should register meta class services via autoBinding', () => {
      const container = { autoBinding: vi.fn() }
      const logger = {}
      const eventEmitter = {}
      const MyService = class {}

      const blueprint = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'stone.services') {
            return [
              {
                isClass: true,
                module: MyService,
                singleton: true,
                alias: ['Alpha']
              }
            ]
          }
        })
      }

      const provider = new CoreServiceProvider({ container, blueprint, eventEmitter, logger } as any)

      // @ts-expect-error access private
      provider.registerServices()

      expect(container.autoBinding).toHaveBeenCalledWith(MyService, MyService, true, ['Alpha'])
    })

    it('should register meta factory services via autoBinding', () => {
      const container = { autoBinding: vi.fn() }
      const factory = (): unknown => ({})
      const blueprint = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'stone.services') {
            return [
              {
                isFactory: true,
                module: factory,
                alias: ['MainService']
              }
            ]
          }
        })
      }

      const provider = new CoreServiceProvider({
        container,
        blueprint,
        logger: {},
        eventEmitter: {}
      } as any)

      // @ts-expect-error access private
      provider.registerServices()

      expect(container.autoBinding).toHaveBeenCalledWith(
        'MainService',
        factory,
        true,
        []
      )
    })
  })

  describe('registerMiddleware', () => {
    it('should register class-based middleware using autoBinding', () => {
      const container = { autoBinding: vi.fn() }
      const logger = {}
      const eventEmitter = {}

      const MyMiddleware = class {}

      const blueprint = {
        get: vi.fn().mockImplementation((key: string, fallback: any[]) => {
          if (key === 'stone.kernel.middleware') {
            return [
              {
                isClass: true,
                module: MyMiddleware,
                singleton: true,
                alias: ['log'],
                global: true
              }
            ]
          }
          return fallback
        })
      }

      const provider = new CoreServiceProvider({ container, blueprint, logger, eventEmitter } as any)

      // @ts-expect-error access private
      provider.registerMiddleware()

      expect(blueprint.get).toHaveBeenCalledWith('stone.middleware', [])
      expect(blueprint.get).toHaveBeenCalledWith('stone.kernel.middleware', [])
      expect(container.autoBinding).toHaveBeenCalledWith(
        MyMiddleware,
        MyMiddleware,
        true,
        ['log']
      )
    })

    it('should skip non-class middleware', () => {
      const container = { autoBinding: vi.fn() }

      const blueprint = {
        get: vi.fn().mockReturnValue([
          { module: 'not-a-class', alias: ['noop'] }
        ])
      }

      const provider = new CoreServiceProvider({
        container,
        blueprint,
        logger: {},
        eventEmitter: {}
      } as any)

      // @ts-expect-error access private
      provider.registerMiddleware()

      expect(container.autoBinding).not.toHaveBeenCalled()
    })
  })

  describe('registerListeners', () => {
    it('should register class-based listeners in eventEmitter', async () => {
      const handleSpy = vi.fn()
      const ListenerClass = class {}
      const container = {
        resolve: vi.fn().mockReturnValue({ handle: handleSpy })
      }

      const listenerMeta = {
        isClass: true,
        module: ListenerClass,
        event: 'user.created'
      }

      const eventEmitter = {
        on: vi.fn((event, listener) => {
          expect(event).toBe('user.created')
          listener({}) // simulate event
        })
      }

      const logger = { error: vi.fn() }

      const blueprint = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'stone.listeners') return [listenerMeta]
        })
      }

      const provider = new CoreServiceProvider({ container, blueprint, logger, eventEmitter } as any)

      // @ts-expect-error access private
      provider.registerListeners()

      expect(container.resolve).toHaveBeenCalledWith(ListenerClass, true)
      expect(eventEmitter.on).toHaveBeenCalled()
      expect(handleSpy).toHaveBeenCalled()
    })

    it('should register factory-based listeners in eventEmitter', async () => {
      const handler = vi.fn().mockReturnValue(vi.fn())
      const listenerMeta = {
        isFactory: true,
        module: () => handler,
        event: 'order.paid'
      }

      const container = {}
      const eventEmitter = {
        on: vi.fn((event, listener) => listener({}))
      }
      const blueprint = {
        get: vi.fn().mockReturnValue([listenerMeta])
      }

      const provider = new CoreServiceProvider({
        container,
        blueprint,
        eventEmitter,
        logger: { error: vi.fn() }
      } as any)

      // @ts-expect-error access private
      provider.registerListeners()

      expect(eventEmitter.on).toHaveBeenCalledWith('order.paid', expect.any(Function))
      expect(handler).toHaveBeenCalled()
    })

    it('should register function-based listeners in eventEmitter', async () => {
      const handle = vi.fn()
      const listenerMeta = {
        module: handle,
        event: 'session.destroyed'
      }

      const eventEmitter = {
        on: vi.fn((event, listener) => listener({}))
      }

      const blueprint = {
        get: vi.fn().mockReturnValue([listenerMeta])
      }

      const provider = new CoreServiceProvider({
        container: {},
        blueprint,
        eventEmitter,
        logger: { error: vi.fn() }
      } as any)

      // @ts-expect-error access private
      provider.registerListeners()

      expect(eventEmitter.on).toHaveBeenCalledWith('session.destroyed', expect.any(Function))
      expect(handle).toHaveBeenCalled()
    })

    it('should catch errors from listeners and log them', async () => {
      const error = new Error('fail')
      const faulty = vi.fn().mockRejectedValue(error)

      const listenerMeta = {
        module: faulty,
        event: 'boom'
      }

      const eventEmitter = {
        listener: async (_: any) => await Promise.resolve(),
        on: vi.fn(async (_, listener) => { eventEmitter.listener = listener })
      }

      const logger = {
        error: vi.fn()
      }

      const blueprint = {
        get: vi.fn().mockReturnValue([listenerMeta])
      }

      const provider = new CoreServiceProvider({
        container: {},
        blueprint,
        eventEmitter,
        logger
      } as any)

      // @ts-expect-error access private
      provider.registerListeners()

      await eventEmitter.listener({})

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('fail'))
    })
  })

  describe('bootSubscribers', () => {
    it('should call subscribe() on class-based subscribers', async () => {
      const subscribeSpy = vi.fn()

      const SubscriberClass = class {}

      const container = {
        resolve: vi.fn().mockReturnValue({ subscribe: subscribeSpy })
      }

      const blueprint = {
        get: vi.fn().mockReturnValue([
          { module: SubscriberClass, isClass: true }
        ])
      }

      const provider = new CoreServiceProvider({
        container,
        blueprint,
        eventEmitter: {},
        logger: { error: vi.fn() }
      } as any)

      // @ts-expect-error access private
      await provider.bootSubscribers()

      expect(container.resolve).toHaveBeenCalledWith(SubscriberClass, true)
      expect(subscribeSpy).toHaveBeenCalled()
    })

    it('should call subscribe() on factory-based subscribers', async () => {
      const subscribe = vi.fn()

      const blueprint = {
        get: vi.fn().mockReturnValue([
          { module: () => subscribe, isFactory: true }
        ])
      }

      const provider = new CoreServiceProvider({
        container: {},
        blueprint,
        eventEmitter: {},
        logger: { error: vi.fn() }
      } as any)

      // @ts-expect-error access private
      await provider.bootSubscribers()

      expect(subscribe).toHaveBeenCalled()
    })

    it('should call subscribe() on function-based subscribers', async () => {
      const subscribe = vi.fn()

      const blueprint = {
        get: vi.fn().mockReturnValue([
          { module: subscribe }
        ])
      }

      const provider = new CoreServiceProvider({
        container: {},
        blueprint,
        eventEmitter: {},
        logger: { error: vi.fn() }
      } as any)

      // @ts-expect-error access private
      await provider.bootSubscribers()

      expect(subscribe).toHaveBeenCalled()
    })

    it('should call subscribe() on raw constructor subscribers', async () => {
      const subscribeSpy = vi.fn()
      const RawClass = class {}

      const container = {
        resolve: vi.fn().mockReturnValue({ subscribe: subscribeSpy })
      }

      const blueprint = {
        get: vi.fn().mockReturnValue([RawClass])
      }

      const provider = new CoreServiceProvider({
        container,
        blueprint,
        eventEmitter: {},
        logger: { error: vi.fn() }
      } as any)

      // @ts-expect-error access private
      await provider.bootSubscribers()

      expect(container.resolve).toHaveBeenCalledWith(RawClass, true)
      expect(subscribeSpy).toHaveBeenCalled()
    })

    it('should catch errors thrown by subscribe() and log them', async () => {
      const error = new Error('fail')
      const logger = { error: vi.fn() }

      const subscriber = {
        module: () => { throw error }
      }

      const blueprint = {
        get: vi.fn().mockReturnValue([subscriber])
      }

      const provider = new CoreServiceProvider({
        container: {},
        blueprint,
        eventEmitter: {},
        logger
      } as any)

      // @ts-expect-error access private
      await provider.bootSubscribers()

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('fail'))
    })
  })
})
