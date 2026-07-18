import { Hook } from '../../src/decorators/Hook'
import { Stone } from '../../src/decorators/Stone'
import { Service } from '../../src/decorators/Service'
import { Provider } from '../../src/decorators/Provider'
import { Listener } from '../../src/decorators/Listener'
import { Middleware } from '../../src/decorators/Middleware'
import { Subscriber } from '../../src/decorators/Subscriber'
import { ErrorHandler } from '../../src/decorators/ErrorHandler'
import { Configuration } from '../../src/decorators/Configuration'
import { StoneApp, StoneAppOptions } from '../../src/decorators/StoneApp'
import { AdapterMiddleware } from '../../src/decorators/AdapterMiddleware'
import { AdapterErrorHandler } from '../../src/decorators/AdapterErrorHandler'
import { ConfigMiddleware, ConfigMiddlewareOptions } from '../../src/decorators/ConfigMiddleware'
import { addBlueprint, setClassMetadata, setMetadata, addMetadata, MetadataSymbol } from '../../src/decorators/Metadata'
import { AdapterMiddlewareOptions, ServiceOptions, ErrorHandlerOptions, AdapterErrorHandlerOptions, ListenerOptions, MiddlewareOptions } from '../../src/declarations'
import { ADAPTER_ERROR_HANDLER_KEY, ADAPTER_MIDDLEWARE_KEY, LIFECYCLE_HOOK_KEY, CONFIG_MIDDLEWARE_KEY, CONFIGURATION_KEY, ERROR_HANDLER_KEY, LISTENER_KEY, STONE_APP_KEY, MIDDLEWARE_KEY, PROVIDER_KEY, SERVICE_KEY, SUBSCRIBER_KEY } from '../../src/decorators/constants'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock setClassMetadata
vi.mock('../../src/decorators/Metadata', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    setMetadata: vi.fn(),
    addMetadata: vi.fn(),
    addBlueprint: vi.fn(),
    setClassMetadata: vi.fn(),
    classDecoratorLegacyWrapper: vi.fn((fn) => fn),
    methodDecoratorLegacyWrapper: vi.fn((fn) => fn)
  }
})

describe('AdapterMiddleware', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: AdapterMiddlewareOptions = { priority: 1, platform: 'testPlatform' }
    AdapterMiddleware(options)
    expect(MetadataSymbol).toBe(Symbol.for('Symbol.metadata'))
    expect(setClassMetadata).toHaveBeenCalledWith(ADAPTER_MIDDLEWARE_KEY, { ...options, isClass: true })
  })

  it('should call setClassMetadata with default options if none are provided', () => {
    AdapterMiddleware()
    expect(setClassMetadata).toHaveBeenCalledWith(ADAPTER_MIDDLEWARE_KEY, { isClass: true })
  })
})

describe('ConfigMiddleware', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: ConfigMiddlewareOptions = { priority: 1, params: ['input'] }
    ConfigMiddleware(options)
    expect(setClassMetadata).toHaveBeenCalledWith(CONFIG_MIDDLEWARE_KEY, { ...options, isClass: true })
  })

  it('should call setClassMetadata with default options if none are provided', () => {
    ConfigMiddleware()
    expect(setClassMetadata).toHaveBeenCalledWith(CONFIG_MIDDLEWARE_KEY, { isClass: true })
  })
})

describe('Configuration', () => {
  it('should call setClassMetadata with default options if none are provided', () => {
    Configuration()
    expect(setClassMetadata).toHaveBeenCalledWith(CONFIGURATION_KEY, { isClass: true })
  })
})

describe('Service', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: ServiceOptions = { singleton: true, alias: ['inputService'] }
    Service(options)
    expect(setClassMetadata).toHaveBeenCalledWith(SERVICE_KEY, { ...options, isClass: true })
  })

  it('should call setClassMetadata with default options if none are provided', () => {
    Service()
    expect(setClassMetadata).toHaveBeenCalledWith(SERVICE_KEY, { isClass: true })
  })
})

describe('Hook', () => {
  it('should call methodDecoratorLegacyWrapper with correct parameters', () => {
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    Hook('onStart')(function () {}, { name: 'onStarting' })
    expect(addMetadata).toHaveBeenCalledWith({ name: 'onStarting' }, LIFECYCLE_HOOK_KEY, { name: 'onStart', method: 'onStarting' })
  })
})

describe('Stone', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: ServiceOptions = { singleton: true, alias: ['inputService'] }
    Stone(options)
    expect(setClassMetadata).toHaveBeenCalledWith(SERVICE_KEY, { ...options, isClass: true })
  })

  it('should call setClassMetadata with default options if none are provided', () => {
    Stone()
    expect(setClassMetadata).toHaveBeenCalledWith(SERVICE_KEY, { isClass: true })
  })
})

describe('ErrorHandler', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: ErrorHandlerOptions = { error: 'Error' }
    ErrorHandler(options)
    expect(setClassMetadata).toHaveBeenCalledWith(ERROR_HANDLER_KEY, { ...options, isClass: true })
  })
})

describe('AdapterErrorHandler', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: AdapterErrorHandlerOptions = { error: 'Error' }
    AdapterErrorHandler(options)
    expect(setClassMetadata).toHaveBeenCalledWith(ADAPTER_ERROR_HANDLER_KEY, { ...options, isClass: true })
  })
})

describe('Listener', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: ListenerOptions = { event: 'inputService' }
    Listener(options)
    expect(setClassMetadata).toHaveBeenCalledWith(LISTENER_KEY, { ...options, isClass: true })
  })
})

describe('Middleware', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: MiddlewareOptions = {}
    Middleware(options)
    expect(setClassMetadata).toHaveBeenCalledWith(MIDDLEWARE_KEY, { ...options, isClass: true })
  })

  it('should call setClassMetadata with default options if none are provided', () => {
    Middleware()
    expect(setClassMetadata).toHaveBeenCalledWith(MIDDLEWARE_KEY, { isClass: true })
  })
})

describe('Provider', () => {
  it('should call setClassMetadata with default options if none are provided', () => {
    Provider()
    expect(setClassMetadata).toHaveBeenCalledWith(PROVIDER_KEY, { isClass: true })
  })
})

describe('Subscriber', () => {
  it('should call setClassMetadata with default options if none are provided', () => {
    Subscriber()
    expect(setClassMetadata).toHaveBeenCalledWith(SUBSCRIBER_KEY, { isClass: true })
  })
})

describe('StoneApp', () => {
  it('should call setClassMetadata with correct parameters', () => {
    const options: StoneAppOptions = { name: 'Stone.js' }
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    StoneApp(options)(class {}, {} as any)
    expect(addBlueprint).toHaveBeenCalled()
    expect(setMetadata).toHaveBeenCalledWith({}, STONE_APP_KEY, { isClass: true })
  })

  it('should call setClassMetadata with default options if none are provided', () => {
    // @ts-expect-error - Testing legacy decorator as 2023-11 proposal decorator
    StoneApp()(class {}, {} as any)
    expect(addBlueprint).toHaveBeenCalled()
    expect(setMetadata).toHaveBeenCalledWith({}, STONE_APP_KEY, { isClass: true })
  })
})
