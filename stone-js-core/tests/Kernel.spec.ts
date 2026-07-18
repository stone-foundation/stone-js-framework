import { Kernel } from '../src/Kernel'
import { Config } from '@stone-js/config'
import { Logger } from '../src/logger/Logger'
import { Container } from '@stone-js/service-container'
import { EventEmitter } from '../src/events/EventEmitter'
import { IncomingEvent } from '../src/events/IncomingEvent'
import { OutgoingResponse } from '../src/events/OutgoingResponse'
import { InitializationError } from '../src/errors/InitializationError'
import { IBlueprint, IServiceProvider, NextMiddleware } from '../src/declarations'

class TestEvent extends IncomingEvent {
  static create (): TestEvent {
    return new TestEvent({ source: { platform: 'test', rawEvent: '', rawContext: '' } })
  }
}

class TestResponse extends OutgoingResponse {}

const createKernel = (blueprint?: IBlueprint): Kernel<TestEvent, TestResponse> => {
  const container = Container.create()
  const eventEmitter = EventEmitter.create()
  const config = blueprint ?? Config.create()
  Logger.init(config)
  return Kernel.create({ blueprint: config, container, eventEmitter })
}

describe('Kernel', () => {
  describe('create', () => {
    it('should create a Kernel instance with valid options', () => {
      expect(createKernel()).toBeInstanceOf(Kernel)
    })

    it('should throw if blueprint is missing or invalid', () => {
      expect(() => {
        Kernel.create({
          // @ts-expect-error
          blueprint: {},
          container: Container.create(),
          eventEmitter: EventEmitter.create()
        })
      }).toThrow(InitializationError)
    })

    it('should throw if container is missing or invalid', () => {
      expect(() => {
        Kernel.create({
          blueprint: Config.create(),
          // @ts-expect-error
          container: {},
          eventEmitter: EventEmitter.create()
        })
      }).toThrow(InitializationError)
    })

    it('should throw if eventEmitter is missing or invalid', () => {
      expect(() => {
        Kernel.create({
          blueprint: Config.create(),
          container: Container.create(),
          // @ts-expect-error
          eventEmitter: {}
        })
      }).toThrow(InitializationError)
    })
  })

  describe('onInit', () => {
    it('should bind base services and run lifecycle', async () => {
      const spyHook = vi.fn()
      const config = Config.create()
      const middleware = (event: TestEvent, next: NextMiddleware): unknown => next(event)

      config.set('stone.kernel.skipMiddleware', true)
      config.set('stone.kernel.middleware', [middleware])
      config.set('stone.lifecycleHooks.onInit', [spyHook])

      const kernel = createKernel(config)

      await kernel.onInit()

      // Base services
      /* eslint-disable-next-line */
      expect(kernel['middleware']).toHaveLength(0)
      /* eslint-disable-next-line */
      expect(kernel['container'].resolve(Config)).toBe(config)
      /* eslint-disable-next-line */
      expect(kernel['container'].resolve(Container)).toBe(kernel['container'])
      /* eslint-disable-next-line */
      expect(kernel['container'].resolve(EventEmitter)).toBeInstanceOf(EventEmitter)

      // Lifecycle hook called
      expect(spyHook).toHaveBeenCalledOnce()
    })

    it('should resolve and register class provider once even called many times', async () => {
      const register = vi.fn()
      class Provider implements IServiceProvider {
        register = register
      }

      const config = Config.create()
      config.set('stone.providers', [Provider, { module: Provider, isClass: true }])

      const kernel = createKernel(config)

      await kernel.onInit()
      await kernel.onInit()

      expect(register).toHaveBeenCalledOnce()
    })

    it('should skip provider if mustSkip returns true', async () => {
      const register = vi.fn()
      const mustSkip = vi.fn().mockResolvedValue(true)
      const Provider = (): IServiceProvider => ({ register, mustSkip })

      const config = Config.create()
      config.set('stone.providers', [{ module: Provider, isFactory: true }])

      const kernel = createKernel(config)
      await kernel.onInit()

      expect(register).not.toHaveBeenCalled()
    })

    it('should run functional live configuration', async () => {
      const spy = vi.fn((bp: IBlueprint) => {
        bp.set('stone.test.config', true)
      })
      const config = Config.create()
      config.set('stone.liveConfigurations', [spy])

      const kernel = createKernel(config)
      await kernel.onInit()

      expect(config.get('stone.test.config')).toBe(true)
    })

    it('should run class-based live configuration', async () => {
      const spy = vi.fn((bp: IBlueprint) => {
        bp.set('stone.test.config', true)
      })
      class LiveConfig {
        configure = spy
      }
      const config = Config.create()
      config.set('stone.liveConfigurations', [{ module: LiveConfig, isClass: true }])

      const kernel = createKernel(config)
      await kernel.onInit()

      expect(config.get('stone.test.config')).toBe(true)
    })
  })

  describe('onHandlingEvent', () => {
    it('should boot providers and run hook', async () => {
      const boot = vi.fn()
      const hook = vi.fn()

      class Provider implements IServiceProvider {
        boot = boot
      }

      const config = Config.create()
      config.set('stone.providers', [Provider])
      config.set('stone.lifecycleHooks.onHandlingEvent', [hook])

      const kernel = createKernel(config)
      await kernel.onInit()
      await kernel.onHandlingEvent()

      expect(boot).toHaveBeenCalled()
      expect(hook).toHaveBeenCalled()
    })
  })

  describe('handle', () => {
    it('should return prepared response after passing through pipeline', async () => {
      const event = TestEvent.create()
      const response = TestResponse.create({ content: 'hello' })
      const handler = vi.fn().mockResolvedValue(response)

      const config = Config.create()
      config.set('stone.kernel.eventHandler', handler)

      const kernel = createKernel(config)
      await kernel.onInit()
      await kernel.onHandlingEvent()
      const result = await kernel.handle(event)

      expect(result).toBe(response)
      expect(result.isPrepared).toBe(true)
      expect(handler).toHaveBeenCalledWith(event)
    })

    it('should handle empty event with error', async () => {
      const kernel = createKernel()
      // @ts-expect-error simulate bad input
      await expect(kernel.handle(undefined)).rejects.toThrow(InitializationError)
    })

    it('should handle empty handler with error', async () => {
      const config = Config.create()
      config.set('stone.kernel.eventHandler', {})
      config.set('stone.kernel.responseResolver', async () => TestResponse.create({ content: 'hello' }))

      const kernel = createKernel(config)
      await kernel.onInit()

      await expect(async () => await kernel.handle(TestEvent.create())).rejects.toThrow(InitializationError)
    })

    it('should handle empty response resolver with empty message with error', async () => {
      const config = Config.create()
      const Handler = vi.fn().mockResolvedValue(undefined)
      config.set('stone.kernel.eventHandler', Handler)

      const kernel = createKernel(config)
      await kernel.onInit()

      await expect(async () => await kernel.handle(TestEvent.create())).rejects.toThrow(InitializationError)
    })

    it('should handle empty response resolver with non outgoing reponse instance with error', async () => {
      const config = Config.create()
      const Handler = vi.fn().mockResolvedValue('Hello')
      config.set('stone.kernel.eventHandler', Handler)

      const kernel = createKernel(config)
      await kernel.onInit()

      await expect(async () => await kernel.handle(TestEvent.create())).rejects.toThrow(InitializationError)
    })

    it('should support response transformation via responseResolver', async () => {
      class Handler {
        handle = vi.fn().mockResolvedValue('hello')
      }
      const factoryMiddleware = () => (event: TestEvent, next: NextMiddleware) => next(event)

      const config = Config.create()
      config.set('stone.kernel.eventHandler', { module: Handler, isClass: true })
      config.set('stone.kernel.middleware', [{ module: factoryMiddleware, isFactory: true, global: true }])
      config.set('stone.kernel.responseResolver', async (content: any) => TestResponse.create(content))

      const kernel = createKernel(config)
      await kernel.onInit()
      const result = await kernel.handle(TestEvent.create())

      /* eslint-disable-next-line */
      expect(kernel['middleware']).toHaveLength(1)
      expect(result).toBeInstanceOf(TestResponse)
      expect(result.content).toBe('hello')
    })

    it('should support response transformation via responseResolver with factory-based handler', async () => {
      const Handler = (): unknown => vi.fn().mockResolvedValue({ statusCode: 200, content: 'hello' })
      class ClassMiddleware {
        handle = (event: TestEvent, next: NextMiddleware): unknown => next(event)
      }

      const config = Config.create()
      config.set('stone.kernel.eventHandler', { module: Handler, isFactory: true })
      config.set('stone.kernel.middleware', [{ module: ClassMiddleware, isClass: true }])
      config.set('stone.kernel.responseResolver', async (content: any) => TestResponse.create(content))

      const kernel = createKernel(config)
      await kernel.onInit()
      const result = await kernel.handle(TestEvent.create())

      expect(result).toBeInstanceOf(TestResponse)
      expect(result.content).toBe('hello')
    })

    it('should support response transformation via responseResolver with functional-based handler', async () => {
      const Handler = vi.fn().mockResolvedValue(undefined)

      const config = Config.create()
      config.set('stone.kernel.eventHandler', { module: Handler })
      config.set('stone.kernel.responseResolver', async (content: any) => TestResponse.create(content))

      const kernel = createKernel(config)
      await kernel.onInit()
      const result = await kernel.handle(TestEvent.create())

      expect(result).toBeInstanceOf(TestResponse)
      expect(result.content).toBeFalsy()
    })
  })

  describe('error handling', () => {
    it('should handle errors via default error handler', async () => {
      const handler = (): void => {
        throw new Error('Boom')
      }

      const errorHandler = vi.fn().mockResolvedValue('error')

      const config = Config.create()
      config.set('stone.kernel.eventHandler', handler)
      config.set('stone.kernel.errorHandlers.default', { module: errorHandler })
      config.set('stone.kernel.responseResolver', async (content: any) => TestResponse.create(content))

      const kernel = createKernel(config)
      await kernel.onInit()

      const response = await kernel.handle(TestEvent.create())

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error), expect.any(TestEvent))
      expect(response.content).toBe('error')
    })

    it('resolves by error.name when it differs from the constructor name', async () => {
      const handler = (): void => {
        const error = new Error('Boom')
        error.name = 'CustomNamedError' // differs from constructor.name ('Error')
        throw error
      }

      const errorHandler = vi.fn().mockResolvedValue('named')

      const config = Config.create()
      config.set('stone.kernel.eventHandler', handler)
      config.set('stone.kernel.errorHandlers.CustomNamedError', { module: errorHandler })
      config.set('stone.kernel.responseResolver', async (content: any) => TestResponse.create(content))

      const kernel = createKernel(config)
      await kernel.onInit()

      const response = await kernel.handle(TestEvent.create())

      expect(errorHandler).toHaveBeenCalled()
      expect(response.content).toBe('named')
    })

    it('should handle errors via default factory error handler', async () => {
      const handler = (): void => {
        throw new Error('Boom')
      }

      const errorHandler = vi.fn().mockResolvedValue('error')

      const config = Config.create()
      config.set('stone.kernel.eventHandler', handler)
      config.set('stone.kernel.errorHandlers.default', { module: () => errorHandler, isFactory: true })
      config.set('stone.kernel.responseResolver', async (content: any) => TestResponse.create(content))

      const kernel = createKernel(config)
      await kernel.onInit()

      const response = await kernel.handle(TestEvent.create())

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error), expect.any(TestEvent))
      expect(response.content).toBe('error')
    })

    it('should handle errors via error-named class error handler', async () => {
      const errorHandler = vi.fn().mockResolvedValue('error')
      class MyError extends Error {
        constructor (message: string) {
          super(message)
          this.name = 'MyError'
        }
      }
      const handler = (): void => {
        throw new MyError('Boom')
      }
      class ErrorHandler {
        handle = errorHandler
      }

      const config = Config.create()
      config.set('stone.kernel.eventHandler', handler)
      config.set('stone.kernel.errorHandlers.MyError', { module: ErrorHandler, isClass: true })
      config.set('stone.kernel.responseResolver', async (content: any) => TestResponse.create(content))

      const kernel = createKernel(config)
      await kernel.onInit()

      const response = await kernel.handle(TestEvent.create())

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error), expect.any(TestEvent))
      expect(response.content).toBe('error')
    })

    it('should throw if no error handler and unknown error', async () => {
      const err = new Error('Unknown')
      const handler = vi.fn().mockRejectedValue(err)

      const config = Config.create()
      config.set('stone.kernel.eventHandler', handler)
      config.set('stone.kernel.errorHandlers', {}) // empty map

      const kernel = createKernel(config)
      await kernel.onInit()

      await expect(kernel.handle(TestEvent.create())).rejects.toThrow('Unknown')
    })
  })

  describe('lifecycle hooks', () => {
    it('should call onEventHandled and onTerminate hooks', async () => {
      const onEventHandled = vi.fn()
      const onTerminate = vi.fn()

      const config = Config.create()
      config.set('stone.lifecycleHooks.onEventHandled', [onEventHandled])
      config.set('stone.lifecycleHooks.onTerminate', [onTerminate])

      const kernel = createKernel(config)
      await kernel.onInit()
      await kernel.onEventHandled()
      await kernel.onTerminate()

      expect(onEventHandled).toHaveBeenCalledOnce()
      expect(onTerminate).toHaveBeenCalledOnce()
    })
  })

  it('should bind originalEvent when event has clone method', async () => {
    const handler = vi.fn().mockResolvedValue(TestResponse.create({}))

    const event = TestEvent.create()
    const clonedEvent = TestEvent.create()

    event.clone = () => clonedEvent as any

    const config = Config.create()
    config.set('stone.kernel.eventHandler', handler)

    const kernel = createKernel(config)

    await kernel.onInit()
    await kernel.handle(event)

    // eslint-disable-next-line
    expect(kernel['container'].resolve('originalEvent')).toBe(clonedEvent)
  })

  it('should resolve factory middleware', async () => {
    const middlewareSpy = vi.fn()

    const factoryMiddleware = () => ({
      handle: async (event: TestEvent, next: NextMiddleware) => {
        middlewareSpy()
        return await next(event)
      }
    })

    const config = Config.create()

    config.set('stone.kernel.middleware', [
      { module: factoryMiddleware, isFactory: true }
    ])

    config.set(
      'stone.kernel.eventHandler',
      vi.fn().mockResolvedValue(TestResponse.create({}))
    )

    const kernel = createKernel(config)

    await kernel.onInit()
    await kernel.handle(TestEvent.create())

    expect(middlewareSpy).toHaveBeenCalled()
  })

  it('should cache resolved event handler', async () => {
    const handler = vi.fn().mockResolvedValue(TestResponse.create({}))

    const config = Config.create()
    config.set('stone.kernel.eventHandler', handler)

    const kernel = createKernel(config)

    await kernel.onInit()

    // eslint-disable-next-line
    const first = kernel['resolveEventHandler']()

    // eslint-disable-next-line
    const second = kernel['resolveEventHandler']()

    expect(first).toBe(second)
  })

  it('should cache resolved error handler', async () => {
    const errorHandler = vi.fn()

    const config = Config.create()

    config.set('stone.kernel.errorHandlers.default', {
      module: errorHandler
    })

    const kernel = createKernel(config)

    const error = new Error('boom')

    // eslint-disable-next-line
    const first = kernel['resolveErrorHandler'](error)

    // eslint-disable-next-line
    const second = kernel['resolveErrorHandler'](error)

    expect(first).toBe(second)
  })

  it('should resolve constructor provider branch', async () => {
    const register = vi.fn()

    class Provider implements IServiceProvider {
      register = register
    }

    const config = Config.create()

    config.set('stone.providers', [Provider])

    const kernel = createKernel(config)

    await kernel.onInit()

    expect(register).toHaveBeenCalledOnce()
  })

  it('should execute functional live configuration branch', async () => {
    const fn = vi.fn()

    const config = Config.create()

    config.set('stone.liveConfigurations', [
      async (blueprint: IBlueprint) => {
        fn()
        blueprint.set('stone.live.executed', true)
      }
    ])

    const kernel = createKernel(config)

    await kernel.onInit()

    expect(fn).toHaveBeenCalledOnce()
    expect(config.get('stone.live.executed')).toBe(true)
  })

  it('should execute response lifecycle hooks', async () => {
    const onPreparingResponse = vi.fn()
    const onResponsePrepared = vi.fn()

    const config = Config.create()

    config.set(
      'stone.kernel.eventHandler',
      vi.fn().mockResolvedValue(TestResponse.create({}))
    )

    config.set('stone.lifecycleHooks.onPreparingResponse', [onPreparingResponse])
    config.set('stone.lifecycleHooks.onResponsePrepared', [onResponsePrepared])

    const kernel = createKernel(config)

    await kernel.onInit()
    await kernel.handle(TestEvent.create())

    expect(onPreparingResponse).toHaveBeenCalled()
    expect(onResponsePrepared).toHaveBeenCalled()
  })

  it('should execute onExecutingEventHandler hook', async () => {
    const hook = vi.fn()

    const config = Config.create()

    config.set(
      'stone.kernel.eventHandler',
      vi.fn().mockResolvedValue(TestResponse.create({}))
    )

    config.set('stone.lifecycleHooks.onExecutingEventHandler', [hook])

    const kernel = createKernel(config)

    await kernel.onInit()
    await kernel.handle(TestEvent.create())

    expect(hook).toHaveBeenCalled()
  })
})
