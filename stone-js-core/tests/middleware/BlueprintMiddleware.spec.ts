import {
  ServiceMiddleware,
  ProviderMiddleware,
  ListenerMiddleware,
  SubscriberMiddleware,
  MiddlewareMiddleware,
  ErrorHandlerMiddleware,
  MainEventHandlerMiddleware,
  SetCurrentAdapterMiddleware,
  AdapterMiddlewareMiddleware,
  AdapterErrorHandlerMiddleware
} from '../../src/middleware/BlueprintMiddleware'
import { SetupError } from '../../src/errors/SetupError'
import { MetadataSymbol } from '../../src/decorators/Metadata'
import { STONE_APP_KEY, SERVICE_KEY, ADAPTER_MIDDLEWARE_KEY, MIDDLEWARE_KEY, ADAPTER_ERROR_HANDLER_KEY, SUBSCRIBER_KEY, LISTENER_KEY, PROVIDER_KEY, ERROR_HANDLER_KEY } from '../../src/decorators/constants'

/* eslint-disable @typescript-eslint/no-extraneous-class */

const createMockBlueprint = (): any => ({
  set: vi.fn(),
  add: vi.fn(),
  setIf: vi.fn(),
  is: vi.fn().mockReturnValue(false),
  get: vi.fn().mockReturnValue(undefined)
})

describe('MainEventHandlerMiddleware', () => {
  it('should set the main event handler if found', async () => {
    const blueprint = createMockBlueprint()
    const handler = class {
      handle (): void {}
      public static [MetadataSymbol] = { [STONE_APP_KEY]: { stone: { name: 'test handler' } } }
    }
    const context = { modules: [handler], blueprint }
    blueprint.get.mockReturnValueOnce({ module: handler })

    const next = vi.fn().mockResolvedValue(blueprint)
    const result = await MainEventHandlerMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.get).toHaveBeenCalledWith('stone.kernel.eventHandler')
    expect(blueprint.setIf).toHaveBeenCalledWith('stone.kernel.eventHandler', expect.objectContaining({
      stone: { name: 'test handler' }
    }))
  })

  it('should throw if no valid event handler is found', async () => {
    const blueprint = createMockBlueprint()
    const broken = class {
      public static [MetadataSymbol] = { [STONE_APP_KEY]: {} }
    }
    blueprint.get.mockReturnValueOnce({ module: { prototype: {} } })

    const context = { modules: [broken], blueprint }
    const next = vi.fn().mockResolvedValue(blueprint)

    await expect(MainEventHandlerMiddleware(context, next)).rejects.toThrow(SetupError)
  })
})

describe('SetCurrentAdapterMiddleware', () => {
  it('should set the single adapter if only one is provided', async () => {
    const blueprint = createMockBlueprint()
    const adapter = { platform: 'node' }
    blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.adapters') return [adapter]
      if (key === 'stone.adapter') return undefined
    })

    const context = { modules: [], blueprint }
    const next = vi.fn().mockResolvedValue(blueprint)

    const result = await SetCurrentAdapterMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter', adapter)
  })

  it('should select the adapter with `current` set to true', async () => {
    const adapter1 = { platform: 'node' }
    const adapter2 = { platform: 'lambda', current: true }

    const blueprint = createMockBlueprint()
    blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.adapters') return [adapter1, adapter2]
      if (key === 'stone.adapter') return undefined
    })

    const context = { modules: [], blueprint }
    const next = vi.fn().mockResolvedValue(blueprint)

    await SetCurrentAdapterMiddleware(context, next)

    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter', adapter2)
  })

  it('should fallback to matching alias or platform', async () => {
    const adapter1 = { alias: 'cli' }
    const adapter2 = { platform: 'browser' }
    const current = { alias: 'cli', platform: 'ignored' }

    const blueprint = createMockBlueprint()
    blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.adapters') return [adapter1, adapter2]
      if (key === 'stone.adapter') return current
    })

    const context = { modules: [], blueprint }
    const next = vi.fn().mockResolvedValue(blueprint)

    await SetCurrentAdapterMiddleware(context, next)

    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter', adapter1)
  })

  it('should fallback to default adapter if nothing else matches', async () => {
    const adapter1 = { platform: 'cli' }
    const adapter2 = { platform: 'node', default: true }

    const blueprint = createMockBlueprint()
    blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.adapters') return [adapter1, adapter2]
      if (key === 'stone.adapter') return { alias: 'none', platform: 'none' }
    })

    const context = { modules: [], blueprint }
    const next = vi.fn().mockResolvedValue(blueprint)

    await SetCurrentAdapterMiddleware(context, next)

    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter', adapter2)
  })

  it('should fallback to empty object if nothing else matches', async () => {
    const adapter1 = { platform: 'cli' }
    const adapter2 = { platform: 'node' }

    const blueprint = createMockBlueprint()
    blueprint.get.mockImplementation((key: string) => {
      if (key === 'stone.adapters') return [adapter1, adapter2]
      if (key === 'stone.adapter') return { alias: 'none', platform: 'none' }
    })

    const context = { modules: [], blueprint }
    const next = vi.fn().mockResolvedValue(blueprint)

    await SetCurrentAdapterMiddleware(context, next)

    expect(blueprint.set).toHaveBeenCalledWith('stone.adapter', {})
  })
})

describe('ProviderMiddleware', () => {
  it('should add all providers with metadata to the blueprint', async () => {
    const blueprint = createMockBlueprint()

    const Provider1 = class {
      public static [MetadataSymbol] = { [PROVIDER_KEY]: { name: 'ServiceA' } }
    }

    const Provider2 = class {
      public static [MetadataSymbol] = { [PROVIDER_KEY]: { name: 'ServiceB' } }
    }

    const context = {
      modules: [Provider1, Provider2],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)

    const result = await ProviderMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).toHaveBeenCalledWith('stone.providers', [
      { name: 'ServiceA', module: Provider1 },
      { name: 'ServiceB', module: Provider2 }
    ])
  })

  it('should not add anything if no provider metadata is found', async () => {
    const blueprint = createMockBlueprint()

    const NotAProvider = class {}

    const context = {
      modules: [NotAProvider],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)

    const result = await ProviderMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).toHaveBeenCalledWith('stone.providers', [])
  })
})

describe('ServiceMiddleware', () => {
  it('should add all services with metadata to the blueprint', async () => {
    const blueprint = createMockBlueprint()

    const Service1 = class {
      public static [MetadataSymbol] = { [SERVICE_KEY]: { alias: 'alpha' } }
    }

    const Service2 = class {
      public static [MetadataSymbol] = { [SERVICE_KEY]: { alias: 'beta' } }
    }

    const context = {
      modules: [Service1, Service2],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)

    const result = await ServiceMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).toHaveBeenCalledWith('stone.services', [
      { alias: 'alpha', module: Service1 }
    ])
    expect(blueprint.add).toHaveBeenCalledWith('stone.services', [
      { alias: 'beta', module: Service2 }
    ])
  })

  it('should not add anything if no service metadata is found', async () => {
    const blueprint = createMockBlueprint()

    const NotAService = class {}

    const context = {
      modules: [NotAService],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)

    const result = await ServiceMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).not.toHaveBeenCalled()
  })
})

describe('ListenerMiddleware', () => {
  it('should add all valid listeners to the blueprint', async () => {
    const blueprint = createMockBlueprint()

    const Listener1 = class {
      public static [MetadataSymbol] = { [LISTENER_KEY]: { event: 'user.created' } }
    }

    const Listener2 = class {
      public static [MetadataSymbol] = { [LISTENER_KEY]: { event: 'order.paid' } }
    }

    const context = {
      modules: [Listener1, Listener2],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    const result = await ListenerMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).toHaveBeenCalledWith('stone.listeners', [
      { event: 'user.created', module: Listener1 }
    ])
    expect(blueprint.add).toHaveBeenCalledWith('stone.listeners', [
      { event: 'order.paid', module: Listener2 }
    ])
  })

  it('should throw SetupError if a listener has no event name', async () => {
    const blueprint = createMockBlueprint()

    const BrokenListener = class {
      public static [MetadataSymbol] = { [LISTENER_KEY]: { event: '' } }
    }

    const context = {
      modules: [BrokenListener],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)

    await expect(async () => await ListenerMiddleware(context, next)).rejects.toThrow(SetupError)
  })
})

describe('SubscriberMiddleware', () => {
  it('should add all subscribers with metadata to the blueprint', async () => {
    const blueprint = createMockBlueprint()

    const Subscriber1 = class {
      public static [MetadataSymbol] = { [SUBSCRIBER_KEY]: { topic: 'alpha' } }
    }

    const Subscriber2 = class {
      public static [MetadataSymbol] = { [SUBSCRIBER_KEY]: { topic: 'beta' } }
    }

    const context = {
      modules: [Subscriber1, Subscriber2],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)

    const result = await SubscriberMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).toHaveBeenCalledWith('stone.subscribers', [
      { topic: 'alpha', module: Subscriber1 },
      { topic: 'beta', module: Subscriber2 }
    ])
  })

  it('should not add anything if no subscriber metadata is found', async () => {
    const blueprint = createMockBlueprint()

    const NotASubscriber = class {}

    const context = {
      modules: [NotASubscriber],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)

    const result = await SubscriberMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).toHaveBeenCalledWith('stone.subscribers', [])
  })
})

describe('ErrorHandlerMiddleware', () => {
  it('should register single error handler in blueprint', async () => {
    const blueprint = createMockBlueprint()

    const MyHandler = class {
      public static [MetadataSymbol] = {
        [ERROR_HANDLER_KEY]: { error: 'TypeError', scope: 'app' }
      }
    }

    const context = {
      modules: [MyHandler],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    const result = await ErrorHandlerMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.set).toHaveBeenCalledWith(
      'stone.kernel.errorHandlers.TypeError',
      { error: 'TypeError', scope: 'app', module: MyHandler }
    )
  })

  it('should register multiple error keys when error is an array', async () => {
    const blueprint = createMockBlueprint()

    const MultiErrorHandler = class {
      public static [MetadataSymbol] = {
        [ERROR_HANDLER_KEY]: { error: ['EvalError', 'URIError'], tag: 'multi' }
      }
    }

    const context = {
      modules: [MultiErrorHandler],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    await ErrorHandlerMiddleware(context, next)

    expect(blueprint.set).toHaveBeenCalledWith(
      'stone.kernel.errorHandlers.EvalError',
      expect.objectContaining({ error: 'EvalError', module: MultiErrorHandler })
    )

    expect(blueprint.set).toHaveBeenCalledWith(
      'stone.kernel.errorHandlers.URIError',
      expect.objectContaining({ error: 'URIError', module: MultiErrorHandler })
    )
  })

  it('should skip modules without ERROR_HANDLER_KEY metadata', async () => {
    const blueprint = createMockBlueprint()
    const NotAnErrorHandler = class {}

    const context = {
      modules: [NotAnErrorHandler],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    const result = await ErrorHandlerMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.set).not.toHaveBeenCalled()
  })
})

describe('AdapterErrorHandlerMiddleware', () => {
  it('should attach adapter error handler globally if no platform/alias is set', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.platform' && value === 'node')

    const AdapterHandler = class {
      public static [MetadataSymbol] = {
        [ADAPTER_ERROR_HANDLER_KEY]: { error: 'MyCustomError' }
      }
    }

    const context = {
      modules: [AdapterHandler],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    await AdapterErrorHandlerMiddleware(context, next)

    expect(blueprint.set).toHaveBeenCalledWith(
      'stone.adapter.errorHandlers.MyCustomError',
      expect.objectContaining({
        error: 'MyCustomError',
        module: AdapterHandler
      })
    )
  })

  it('should attach adapter error handler only to matching alias', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.alias' && value === 'cli')

    const AdapterHandler = class {
      public static [MetadataSymbol] = {
        [ADAPTER_ERROR_HANDLER_KEY]: { adapterAlias: 'cli', error: 'MyCustomError' }
      }
    }

    const context = {
      modules: [AdapterHandler],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    await AdapterErrorHandlerMiddleware(context, next)

    expect(blueprint.set).toHaveBeenCalledWith(
      'stone.adapter.errorHandlers.MyCustomError',
      expect.objectContaining({
        error: 'MyCustomError',
        module: AdapterHandler
      })
    )
  })

  it('should attach adapter error handler only to matching platform', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.platform' && value === 'lambda')

    const AdapterHandler = class {
      public static [MetadataSymbol] = {
        [ADAPTER_ERROR_HANDLER_KEY]: { platform: 'lambda', error: 'MyCustomError' }
      }
    }

    const context = {
      modules: [AdapterHandler],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    await AdapterErrorHandlerMiddleware(context, next)

    expect(blueprint.set).toHaveBeenCalledWith(
      'stone.adapter.errorHandlers.MyCustomError',
      expect.objectContaining({
        error: 'MyCustomError',
        module: AdapterHandler
      })
    )
  })

  it('should skip modules without adapter error handler metadata', async () => {
    const blueprint = createMockBlueprint()
    const NotAdapterHandler = class {}

    const context = {
      modules: [NotAdapterHandler],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    await AdapterErrorHandlerMiddleware(context, next)

    expect(blueprint.set).not.toHaveBeenCalled()
  })
})

describe('AdapterMiddlewareMiddleware', () => {
  it('should attach adapter middleware globally if no platform/alias is set', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.platform' && value === 'node')

    const MiddlewareClass = class {
      public static [MetadataSymbol] = {
        [ADAPTER_MIDDLEWARE_KEY]: { priority: 100 }
      }
    }

    const context = {
      modules: [MiddlewareClass],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    await AdapterMiddlewareMiddleware(context, next)

    expect(blueprint.add).toHaveBeenCalledWith('stone.adapter.middleware', [{
      module: MiddlewareClass,
      priority: 100,
      isClass: true
    }])
  })

  it('should attach adapter middleware only to matching alias', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.alias' && value === 'cli')

    const MiddlewareClass = class {
      public static [MetadataSymbol] = {
        [ADAPTER_MIDDLEWARE_KEY]: { adapterAlias: 'cli', priority: 200 }
      }
    }

    const context = { modules: [MiddlewareClass], blueprint }
    const next = vi.fn().mockResolvedValue(blueprint)
    await AdapterMiddlewareMiddleware(context, next)

    expect(blueprint.add).toHaveBeenCalledWith('stone.adapter.middleware', [{
      module: MiddlewareClass,
      priority: 200,
      isClass: true,
      adapterAlias: 'cli'
    }])
  })

  it('should attach adapter middleware only to matching platform', async () => {
    const blueprint = createMockBlueprint()
    blueprint.is = vi.fn().mockImplementation((key, value) => key === 'stone.adapter.platform' && value === 'lambda')

    const MiddlewareClass = class {
      public static [MetadataSymbol] = {
        [ADAPTER_MIDDLEWARE_KEY]: { platform: 'lambda', priority: 1 }
      }
    }

    const context = { modules: [MiddlewareClass], blueprint }
    const next = vi.fn().mockResolvedValue(blueprint)
    await AdapterMiddlewareMiddleware(context, next)

    expect(blueprint.add).toHaveBeenCalledWith('stone.adapter.middleware', [{
      module: MiddlewareClass,
      priority: 1,
      isClass: true,
      platform: 'lambda'
    }])
  })

  it('should do nothing if module has no metadata', async () => {
    const blueprint = createMockBlueprint()

    const NotAMiddleware = class {}

    const context = {
      modules: [NotAMiddleware],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    await AdapterMiddlewareMiddleware(context, next)

    expect(blueprint.add).not.toHaveBeenCalled()
  })
})

describe('MiddlewareMiddleware', () => {
  it('should add global middleware to stone.kernel.middleware', async () => {
    const blueprint = createMockBlueprint()

    const GlobalMiddleware = class {
      public static [MetadataSymbol] = {
        [MIDDLEWARE_KEY]: { global: true, priority: 1 }
      }
    }

    const context = {
      modules: [GlobalMiddleware],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    const result = await MiddlewareMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).toHaveBeenCalledWith('stone.kernel.middleware', [
      { global: true, priority: 1, module: GlobalMiddleware }
    ])
  })

  it('should not add non-global middleware', async () => {
    const blueprint = createMockBlueprint()

    const LocalMiddleware = class {
      public static [MetadataSymbol] = {
        [MIDDLEWARE_KEY]: { priority: 1 }
      }
    }

    const context = {
      modules: [LocalMiddleware],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    const result = await MiddlewareMiddleware(context, next)

    expect(result).toBe(blueprint)
    expect(blueprint.add).toHaveBeenCalledWith('stone.middleware', [
      { priority: 1, module: LocalMiddleware }
    ])
  })

  it('should do nothing if no MIDDLEWARE_KEY is present', async () => {
    const blueprint = createMockBlueprint()
    const NotMiddleware = class {}

    const context = {
      modules: [NotMiddleware],
      blueprint
    }

    const next = vi.fn().mockResolvedValue(blueprint)
    await MiddlewareMiddleware(context, next)

    expect(blueprint.add).not.toHaveBeenCalled()
  })
})
