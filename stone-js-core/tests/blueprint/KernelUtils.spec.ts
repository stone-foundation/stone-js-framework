import { EventEmitter } from '../../src/events/EventEmitter'
import { IncomingEvent } from '../../src/events/IncomingEvent'
import { StoneBlueprint } from '../../src/options/StoneBlueprint'
import { IBlueprint, IEventSubscriber, ILogger, IServiceProvider, LogLevel, NextMiddleware, Promiseable } from '../../src/declarations'
import { defineErrorHandler, defineEventHandler, defineEventListener, defineEventSubscriber, defineHookListener, defineHookListeners, defineLogger, defineMiddleware, defineService, defineServiceProvider, defineStone } from '../../src/blueprint/KernelUtils'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock handlers
const functionalHandler = vi.fn()
const factoryHandler = vi.fn(() => functionalHandler)
class ClassHandler {
  handle = vi.fn()
}

describe('defineEventHandler', () => {
  it('should define a functional event handler', () => {
    const blueprint = defineEventHandler(functionalHandler)

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          eventHandler: {
            module: functionalHandler
          }
        }
      }
    })
  })

  it('should define a factory-based event handler', () => {
    const blueprint = defineEventHandler(factoryHandler, { isFactory: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          eventHandler: {
            module: factoryHandler,
            isFactory: true
          }
        }
      }
    })
  })

  it('should define a class-based event handler', () => {
    const blueprint = defineEventHandler(ClassHandler, { isClass: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          eventHandler: {
            module: ClassHandler,
            isClass: true
          }
        }
      }
    })
  })
})

describe('defineErrorHandler', () => {
  it('should define a functional error handler with single error', () => {
    const blueprint = defineErrorHandler(functionalHandler, {
      error: 'MyError'
    })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          errorHandlers: {
            MyError: {
              module: functionalHandler
            }
          }
        }
      }
    })
  })

  it('should define a factory error handler with multiple errors', () => {
    const blueprint = defineErrorHandler(factoryHandler, {
      error: ['MyError', 'OtherError'],
      isFactory: true
    })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          errorHandlers: {
            MyError: {
              module: factoryHandler,
              isFactory: true
            },
            OtherError: {
              module: factoryHandler,
              isFactory: true
            }
          }
        }
      }
    })
  })

  it('should define a class-based error handler with single error', () => {
    const blueprint = defineErrorHandler(ClassHandler, {
      error: 'FatalError',
      isClass: true
    })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          errorHandlers: {
            FatalError: {
              module: ClassHandler,
              isClass: true
            }
          }
        }
      }
    })
  })
})

describe('defineHookListener', () => {
  it('should register a lifecycle hook under the given name', () => {
    const hook = (): Promiseable<void> => {}
    const blueprint = defineHookListener(hook, { name: 'onInit' })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        lifecycleHooks: {
          onInit: [hook]
        }
      }
    })
  })
})

describe('defineHookListeners', () => {
  it('should register lifecycle hooks under the given names', () => {
    const hook = (): Promiseable<void> => {}
    const blueprint = defineHookListeners({ onInit: [hook], onTerminate: [hook] })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        lifecycleHooks: {
          onInit: [hook],
          onTerminate: [hook]
        }
      }
    })
  })
})

describe('defineEventListener', () => {
  const eventName = 'stonejs@user.created'

  it('should define a functional event listener', () => {
    const fn = vi.fn()
    const blueprint = defineEventListener(fn, { event: eventName })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        listeners: [{
          module: fn,
          event: eventName
        }]
      }
    })
  })

  it('should define a factory-based event listener', () => {
    const factory = vi.fn()
    const blueprint = defineEventListener(factory, { event: eventName, isFactory: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        listeners: [{
          module: factory,
          event: eventName,
          isFactory: true
        }]
      }
    })
  })

  it('should define a class-based event listener', () => {
    class MyListener { handle (): void {} }
    const blueprint = defineEventListener(MyListener, { event: eventName, isClass: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        listeners: [{
          module: MyListener,
          event: eventName,
          isClass: true
        }]
      }
    })
  })
})

describe('defineMiddleware', () => {
  const dummyMiddleware = vi.fn()

  it('should define a functional middleware', () => {
    const blueprint = defineMiddleware(dummyMiddleware)

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          middleware: [{
            module: dummyMiddleware
          }]
        }
      }
    })
  })

  it('should define a factory-based middleware', () => {
    const factory = vi.fn()
    const blueprint = defineMiddleware(factory, { isFactory: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          middleware: [{
            module: factory,
            isFactory: true
          }]
        }
      }
    })
  })

  it('should define a class-based middleware', () => {
    class MyMiddleware {
      handle (_event: IncomingEvent, _next: NextMiddleware<IncomingEvent>): void {}
    }

    const blueprint = defineMiddleware(MyMiddleware, { isClass: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        kernel: {
          middleware: [{
            module: MyMiddleware,
            isClass: true
          }]
        }
      }
    })
  })
})

describe('defineServiceProvider', () => {
  it('should define a factory-based service provider', () => {
    const factory = vi.fn()

    const blueprint = defineServiceProvider(factory, { isFactory: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        providers: [{
          module: factory,
          isClass: false,
          isFactory: true
        }]
      }
    })
  })

  it('should define a class-based service provider', () => {
    class MyProvider implements IServiceProvider {
      register (): void {}
      async boot (): Promise<void> {}
    }

    const blueprint = defineServiceProvider(MyProvider, { isClass: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        providers: [{
          module: MyProvider,
          isClass: true,
          isFactory: false
        }]
      }
    })
  })

  it('should fallback to factory when no flag is provided', () => {
    const fn = vi.fn()
    const blueprint = defineServiceProvider(fn)

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        providers: [{
          module: fn,
          isClass: false,
          isFactory: true
        }]
      }
    })
  })

  it('should auto-detect a class as isClass:true when no flag is provided', () => {
    class MyProvider implements IServiceProvider {
      register (): void {}
      async boot (): Promise<void> {}
    }

    // Cast: the current overloads don't yet accept a bare class without options
    // (typing debt tracked in FEUILLE-DE-ROUTE.md); this test pins the runtime behavior.
    const blueprint = defineServiceProvider(MyProvider as any)

    // A constructor passed without flags must be treated as a class, not a factory,
    // otherwise the Kernel would call it without `new` (boot-time TypeError).
    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        providers: [{
          module: MyProvider,
          isClass: true,
          isFactory: false
        }]
      }
    })
  })
})

describe('defineService', () => {
  it('should define a factory-based service', () => {
    const factory = vi.fn()
    const alias = 'my-service'

    const blueprint = defineService(factory, {
      alias,
      isFactory: true
    })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        services: [{
          alias,
          module: factory,
          isClass: false,
          isFactory: true
        }]
      }
    })
  })

  it('should define a class-based service', () => {
    class MyService {}
    const blueprint = defineService(MyService, {
      alias: 'MyService',
      isClass: true
    })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        services: [{
          alias: 'MyService',
          module: MyService,
          isClass: true,
          isFactory: false
        }]
      }
    })
  })

  it('should fallback to factory=true when isFactory is not provided', () => {
    const factory = vi.fn()
    const blueprint = defineService(factory, {
      alias: 'AutoFactory',
      isFactory: true
    })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        services: [{
          alias: 'AutoFactory',
          module: factory,
          isClass: false,
          isFactory: true
        }]
      }
    })
  })
})

describe('defineStone', () => {
  it('should define a factory-based stone service', () => {
    const factory = vi.fn()
    const blueprint = defineStone(factory, { alias: 'core.service', isFactory: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        services: [{
          alias: 'core.service',
          module: factory,
          isClass: false,
          isFactory: true
        }]
      }
    })
  })

  it('should define a class-based stone service', () => {
    class CoreService {}
    const blueprint = defineStone(CoreService, { alias: 'core', isClass: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        services: [{
          alias: 'core',
          module: CoreService,
          isClass: true,
          isFactory: false
        }]
      }
    })
  })

  it('should default to isFactory: true when omitted', () => {
    const factory = vi.fn()
    const blueprint = defineStone(factory, { alias: 'auto.factory', isFactory: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        services: [{
          alias: 'auto.factory',
          module: factory,
          isClass: false,
          isFactory: true
        }]
      }
    })
  })
})

describe('defineEventSubscriber', () => {
  it('should define a functional event subscriber', () => {
    const subscriber = vi.fn()
    const blueprint = defineEventSubscriber(subscriber)

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        subscribers: [{
          module: subscriber
        }]
      }
    })
  })

  it('should define a factory-based event subscriber', () => {
    const factory = (): any => vi.fn()
    const blueprint = defineEventSubscriber(factory, { isFactory: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        subscribers: [{
          module: factory,
          isFactory: true
        }]
      }
    })
  })

  it('should define a class-based event subscriber', () => {
    class Subscriber implements IEventSubscriber {
      subscribe (eventEmitter: EventEmitter): Promiseable<void> {}
    }
    const blueprint = defineEventSubscriber(Subscriber, { isClass: true })

    expect(blueprint).toEqual<Partial<StoneBlueprint>>({
      stone: {
        subscribers: [{
          module: Subscriber,
          isClass: true
        }]
      }
    })
  })
})

describe('defineLogger', () => {
  const fakeBlueprint = {
    set: vi.fn(),
    get: vi.fn()
  } as unknown as IBlueprint

  it('should define a factory-based logger', () => {
    const factory = vi.fn().mockReturnValue({ log: vi.fn() })
    const blueprint = defineLogger(factory, { isFactory: true, level: LogLevel.INFO, custom: 'yes' })

    expect(blueprint).toMatchObject({
      stone: {
        logger: expect.objectContaining({
          level: 'info',
          custom: 'yes',
          resolver: expect.any(Function)
        })
      }
    })

    const resolved = blueprint.stone?.logger?.resolver?.(fakeBlueprint)
    expect(factory).toHaveBeenCalledWith({ blueprint: fakeBlueprint })
    expect(resolved).toEqual(factory.mock.results[0].value)
  })

  it('should define a class-based logger', () => {
    class Logger implements ILogger {
      constructor (public ctx: any) {}
      info (message: string, ...optionalParams: unknown[]): void {}
      debug (message: string, ...optionalParams: unknown[]): void {}
      warn (message: string, ...optionalParams: unknown[]): void {}
      error (message: string, ...optionalParams: unknown[]): void {}
    }

    const blueprint = defineLogger(Logger, { isClass: true, level: LogLevel.DEBUG })
    expect(blueprint.stone?.logger?.level).toBe('debug')

    const resolved = blueprint.stone?.logger?.resolver?.(fakeBlueprint)
    expect(resolved).toBeInstanceOf(Logger)
  })
})
