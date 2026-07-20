import {
  LogLevel,
  HookName,
  LoggerType,
  IBlueprint,
  ServiceType,
  ILoggerClass,
  FactoryLogger,
  IServiceClass,
  ServiceOptions,
  MiddlewareType,
  FactoryService,
  ListenerOptions,
  MiddlewareClass,
  ErrorHandlerType,
  EventHandlerType,
  EventHandlerClass,
  EventListenerType,
  MiddlewareOptions,
  FactoryMiddleware,
  LifecycleHookType,
  IErrorHandlerClass,
  FactoryEventHandler,
  EventSubscriberType,
  ErrorHandlerOptions,
  ServiceProviderType,
  IEventListenerClass,
  FactoryErrorHandler,
  FactoryEventListener,
  FunctionalMiddleware,
  LifecycleHookListener,
  IServiceProviderClass,
  IEventSubscriberClass,
  FunctionalEventHandler,
  FactoryServiceProvider,
  FactoryEventSubscriber,
  FunctionalErrorHandler,
  FunctionalEventListener,
  FunctionalEventSubscriber
} from '../declarations'
import { Event } from '../events/Event'
import { isClassConstructor } from '../utils'
import { IncomingEvent } from '../events/IncomingEvent'
import { StoneBlueprint } from '../options/StoneBlueprint'
import { OutgoingResponse } from '../events/OutgoingResponse'

/**
 * Defines a function-based error handler.
 *
 * @param module - The error handler function.
 * @param options - The error types and metadata.
 * @returns A partial StoneBlueprint registering the error handler.
 */
export function defineErrorHandler<U extends IncomingEvent = IncomingEvent, V = OutgoingResponse> (
  module: FunctionalErrorHandler<U, V>,
  options: ErrorHandlerOptions & { isFactory?: undefined, isClass?: undefined }
): Partial<StoneBlueprint<U>>

/**
 * Defines a factory-based error handler.
 *
 * @param module - The factory function that returns an error handler.
 * @param options - The error types and metadata.
 * @returns A partial StoneBlueprint registering the error handler.
 */
export function defineErrorHandler<U extends IncomingEvent = IncomingEvent, V = OutgoingResponse> (
  module: FactoryErrorHandler<U, V>,
  options: ErrorHandlerOptions & { isFactory: true, isClass?: undefined }
): Partial<StoneBlueprint<U>>

/**
 * Defines a class-based error handler.
 *
 * @param module - The error handler class.
 * @param options - The error types and metadata.
 * @returns A partial StoneBlueprint registering the error handler.
 */
export function defineErrorHandler<U extends IncomingEvent = IncomingEvent, V = OutgoingResponse> (
  module: IErrorHandlerClass<U, V>,
  options: ErrorHandlerOptions & { isClass: true, isFactory?: undefined }
): Partial<StoneBlueprint<U>>

/**
 * Registers a kernel-level error handler in the blueprint.
 *
 * This utility defines a structured error handler (function, factory, or class) for one or more error types,
 * and adds it to the `stone.kernel.errorHandlers` blueprint section.
 *
 * @param module - The error handler module (function, factory, or class).
 * @param options - Metadata defining the error types it handles, and type flags.
 * @returns A partial StoneBlueprint with the error handler(s) registered.
 */
export function defineErrorHandler<U extends IncomingEvent = IncomingEvent, V = OutgoingResponse> (
  module: ErrorHandlerType<U, V>,
  options: ErrorHandlerOptions & { isFactory?: boolean, isClass?: boolean }
): Partial<StoneBlueprint<U>> {
  const errorHandlers = Object.fromEntries(
    [options.error].flat().map((errorName) => [
      errorName,
      {
        module,
        isClass: options.isClass,
        isFactory: options.isFactory
      }
    ])
  )

  return {
    stone: {
      kernel: {
        errorHandlers
      }
    }
  }
}

/**
 * Utility function to define a function-based event handler.
 *
 * @param module - The EventHandler module.
 * @returns The StoneBlueprint.
 */
export function defineEventHandler <U extends IncomingEvent = IncomingEvent, V = OutgoingResponse> (
  module: FunctionalEventHandler<U, V>
): Partial<StoneBlueprint<U>>

/**
 * Utility function to define a factory-based event handler.
 *
 * @param module - The EventHandler module.
 * @param options - The options for the EventHandler.
 * @returns The StoneBlueprint.
 */
export function defineEventHandler <U extends IncomingEvent = IncomingEvent, V = OutgoingResponse> (
  module: FactoryEventHandler<U, V>,
  options: { isFactory: true }
): Partial<StoneBlueprint<U>>

/**
 * Utility function to define a factory-based event handler.
 *
 * @param module - The EventHandler module.
 * @param options - The options for the EventHandler.
 * @returns The StoneBlueprint.
 */
export function defineEventHandler <U extends IncomingEvent = IncomingEvent, V = OutgoingResponse> (
  module: EventHandlerClass<U, V>,
  options: { isClass: true }
): Partial<StoneBlueprint<U>>

/**
 * Utility function to define an event handler.
 *
 * @param module - The EventHandler module.
 * @param options - The options for the EventHandler.
 * @returns The StoneBlueprint.
 */
export function defineEventHandler <U extends IncomingEvent = IncomingEvent, V = OutgoingResponse> (
  module: EventHandlerType<U, V>,
  options: { isFactory?: boolean, isClass?: boolean } = {}
): Partial<StoneBlueprint<U>> {
  return {
    stone: {
      kernel: {
        eventHandler: {
          module,
          isClass: options.isClass,
          isFactory: options.isFactory
        }
      }
    }
  }
}

/**
 * Defines a lifecycle hook listener for the application.
 *
 * This function allows you to declaratively register a function to a specific lifecycle hook
 * such as `onInit`, `onTerminate`, `onHandlingEvent`, etc.
 *
 * @param module - The hook function to be registered.
 * @param options - Hook configuration, including the `name` of the lifecycle hook.
 *
 * @returns A partial StoneBlueprint with the lifecycle hook injected.
 *
 * @example
 * ```ts
 * defineHookListener(onInitFunction, { name: 'onInit' })
 * ```
 */
export function defineHookListener<U extends IncomingEvent = IncomingEvent> (
  module: LifecycleHookListener<IBlueprint, any, any, U>,
  options: { name: HookName }
): Partial<StoneBlueprint> {
  return {
    stone: {
      lifecycleHooks: {
        [options.name]: [module]
      }
    }
  }
}

/**
 * Defines a lifecycle hooks listeners for the application.
 *
 * @param lifecycleHooks - The hook function listeners to be registered.
 * @returns A partial StoneBlueprint with the lifecycle hook injected.
 */
export function defineHookListeners <
T extends LifecycleHookType<IBlueprint, any, any, any, any> = LifecycleHookType<IBlueprint, any, any, any, any>
> (
  lifecycleHooks: T
): Partial<StoneBlueprint> {
  return { stone: { lifecycleHooks } }
}

/**
 * Defines a function-based event listener.
 *
 * @param module - The listener function to be registered.
 * @param options - Listener options including event name.
 * @returns A partial StoneBlueprint registering the listener.
 */
export function defineEventListener<TEvent extends Event = Event> (
  module: FunctionalEventListener<TEvent>,
  options: ListenerOptions & { isFactory?: undefined, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines a factory-based event listener.
 *
 * @param module - A factory that returns a listener function.
 * @param options - Listener options including event name.
 * @returns A partial StoneBlueprint registering the listener with factory metadata.
 */
export function defineEventListener<TEvent extends Event = Event> (
  module: FactoryEventListener<TEvent>,
  options: ListenerOptions & { isFactory: true, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines a class-based event listener.
 *
 * @param module - A class with a `handle` method.
 * @param options - Listener options including event name.
 * @returns A partial StoneBlueprint registering the listener with class metadata.
 */
export function defineEventListener<TEvent extends Event = Event> (
  module: IEventListenerClass<TEvent>,
  options: ListenerOptions & { isClass: true, isFactory?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines an event listener (function, class, or factory) for a specific event type.
 *
 * This utility supports functional, factory, and class-based listeners and injects the appropriate metadata
 * into the blueprint. The event name must be provided in `options.event`.
 *
 * @param module - The listener implementation (function, class, or factory).
 * @param options - Listener options including event name and factory flag.
 * @returns A partial StoneBlueprint with the listener metadata injected.
 *
 * @example
 * ```ts
 * defineEventListener((event) => console.log(event), { event: 'user.created' })
 * ```
 */
export function defineEventListener<TEvent extends Event = Event> (
  module: EventListenerType<TEvent>,
  options: ListenerOptions & { isFactory?: boolean, isClass?: boolean }
): Partial<StoneBlueprint> {
  return {
    stone: {
      listeners: [{
        ...options,
        module
      }]
    }
  }
}

/**
 * Defines a function-based middleware.
 *
 * @param module - The middleware function to be registered.
 * @param options - Optional middleware options.
 * @returns A partial StoneBlueprint registering the middleware.
 */
export function defineMiddleware<U extends IncomingEvent = IncomingEvent, V extends OutgoingResponse = OutgoingResponse> (
  module: FunctionalMiddleware<U, V>,
  options?: MiddlewareOptions & { isFactory?: undefined, isClass?: undefined }
): Partial<StoneBlueprint<U, V>>

/**
 * Defines a factory-based middleware.
 *
 * @param module - A factory that returns the middleware function.
 * @param options - Middleware options including `isFactory: true`.
 * @returns A partial StoneBlueprint registering the middleware with factory metadata.
 */
export function defineMiddleware<U extends IncomingEvent = IncomingEvent, V extends OutgoingResponse = OutgoingResponse> (
  module: FactoryMiddleware<U, V>,
  options: MiddlewareOptions & { isFactory: true, isClass?: undefined }
): Partial<StoneBlueprint<U, V>>

/**
 * Defines a class-based middleware.
 *
 * @param module - A class-based middleware with a `handle` method.
 * @param options - Middleware options including `isClass: true`.
 * @returns A partial StoneBlueprint registering the middleware with class metadata.
 */
export function defineMiddleware<U extends IncomingEvent = IncomingEvent, V extends OutgoingResponse = OutgoingResponse> (
  module: MiddlewareClass<U, V>,
  options: MiddlewareOptions & { isClass: true, isFactory?: undefined }
): Partial<StoneBlueprint<U, V>>

/**
 * Defines middleware (function, factory, or class) for the Stone.js kernel.
 *
 * This utility injects middleware metadata into the `stone.kernel.middleware` blueprint field.
 * It supports functional, factory, and class-based middleware.
 *
 * @param module - The middleware implementation (function, factory, or class).
 * @param options - Optional middleware options and factory indicator.
 * @returns A partial StoneBlueprint with the middleware metadata.
 *
 * @example
 * ```ts
 * defineMiddleware((event, next) => next(event))
 * ```
 */
export function defineMiddleware<U extends IncomingEvent = IncomingEvent, V extends OutgoingResponse = OutgoingResponse> (
  module: MiddlewareType<U, V>,
  options?: MiddlewareOptions & { isFactory?: boolean, isClass?: boolean }
): Partial<StoneBlueprint<U, V>> {
  return {
    stone: {
      kernel: {
        middleware: [{
          ...options,
          module
        }]
      }
    }
  }
}

/**
 * Defines a factory-based service provider.
 *
 * @param module - The factory function that returns a service provider.
 * @param options - Optional flag indicating this is a factory-based provider.
 * @returns A partial StoneBlueprint registering the provider.
 */
export function defineServiceProvider (
  module: FactoryServiceProvider,
  options?: { isFactory?: true }
): Partial<StoneBlueprint>

/**
 * Defines a class-based service provider.
 *
 * @param module - The class that implements a service provider.
 * @param options - Optional flag indicating this is a class-based provider.
 * @returns A partial StoneBlueprint registering the provider.
 */
export function defineServiceProvider (
  module: IServiceProviderClass,
  options: { isClass: true }
): Partial<StoneBlueprint>

/**
 * Defines a service provider (factory or class) for the Stone.js application.
 *
 * This utility registers a provider into the `stone.providers` blueprint section.
 * It supports both class-based and factory-based providers.
 *
 * @param module - The service provider (factory function or class).
 * @param options - Optional flag to indicate if it's a factory.
 * @returns A partial StoneBlueprint with the provider metadata.
 *
 * @example
 * ```ts
 * defineServiceProvider(MyServiceProviderClass, { isClass: true })
 * defineServiceProvider((container) => new MyProvider(container))
 * ```
 */
export function defineServiceProvider (
  module: ServiceProviderType,
  options?: { isFactory?: boolean, isClass?: boolean }
): Partial<StoneBlueprint> {
  return {
    stone: {
      providers: [resolveModuleKind(module, options)]
    }
  }
}

/**
 * Defines a factory-based service for the Stone.js application.
 *
 * @param module - A factory function that returns the service instance.
 * @param options - Configuration options for the service including alias and factory flag.
 * @returns A partial StoneBlueprint registering the service.
 */
export function defineService (
  module: FactoryService,
  options: ServiceOptions & { isFactory?: true, isClass?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines a class-based service for the Stone.js application.
 *
 * @param module - The service class to be registered.
 * @param options - Configuration options for the service including alias and factory flag.
 * @returns A partial StoneBlueprint registering the service.
 */
export function defineService (
  module: IServiceClass,
  options: ServiceOptions & { isClass: true, isFactory?: undefined }
): Partial<StoneBlueprint>

/**
 * Defines a service (factory or class) for the Stone.js application.
 *
 * This utility registers a service in the `stone.services` section of the blueprint.
 * It supports both factory and class-based service definitions.
 *
 * @param module - The service class or factory function.
 * @param options - Service configuration options including alias and factory flag.
 * @returns A partial StoneBlueprint containing the service metadata.
 *
 * @example
 * ```ts
 * defineService(MyServiceClass, { alias: 'myService', isClass: true })
 * defineService((container) => ({ save(){} }), { alias: 'myService' })
 * ```
 */
export function defineService (
  module: ServiceType,
  options: ServiceOptions & { isFactory?: boolean, isClass?: boolean }
): Partial<StoneBlueprint> {
  return {
    stone: {
      services: [{ ...options, ...resolveModuleKind(module, options) }]
    }
  }
}

/**
 * Resolve the `isClass` / `isFactory` discriminators for a meta module.
 *
 * When neither flag is given, the kind is inferred from the module itself: a constructor
 * becomes a class, anything else a factory. This prevents the boot-time `TypeError` that
 * occurred when a class was passed without `{ isClass: true }` and later invoked without `new`.
 *
 * @param module - The class or factory being registered.
 * @param options - The caller-provided flags, if any.
 * @returns The meta module with resolved `isClass`/`isFactory`.
 */
function resolveModuleKind<T> (
  module: T,
  options?: { isFactory?: boolean, isClass?: boolean }
): { module: T, isClass: boolean, isFactory: boolean } {
  const asClass = options?.isClass ?? (options?.isFactory !== true && isClassConstructor(module))
  const asFactory = options?.isFactory ?? !asClass
  return { module, isClass: asClass, isFactory: asFactory }
}

/**
 * Defines a core Stone.js service.
 *
 * This is a specialized alias for `defineService`, used to register essential services
 * that are part of the application’s foundation. It supports both factory and class-based service definitions.
 *
 * @see defineService
 *
 * @example
 * ```ts
 * defineStone(MyStoneServiceClass, { alias: 'stone.core', isClass: true })
 * defineStone((container) => ({ save(){} }), { alias: 'myService' })
 * ```
 */
export const defineStone: typeof defineService = defineService

/**
 * Registers a **functional event subscriber** into the Stone blueprint.
 *
 * @param module - The functional subscriber.
 * @returns A partial StoneBlueprint with the subscriber metadata.
 */
export function defineEventSubscriber (
  module: FunctionalEventSubscriber
): Partial<StoneBlueprint>

/**
 * Registers a **factory-based event subscriber** into the Stone blueprint.
 *
 * @param module - The factory subscriber.
 * @param options - Must include `isFactory: true`.
 * @returns A partial StoneBlueprint with the subscriber metadata.
 */
export function defineEventSubscriber (
  module: FactoryEventSubscriber,
  options: { isFactory: true }
): Partial<StoneBlueprint>

/**
 * Registers a **class-based event subscriber** into the Stone blueprint.
 *
 * @param module - The subscriber class.
 * @param options - Must include `isClass: true`.
 * @returns A partial StoneBlueprint with the subscriber metadata.
 */
export function defineEventSubscriber (
  module: IEventSubscriberClass,
  options: { isClass: true }
): Partial<StoneBlueprint>

/**
 * Registers an event subscriber into the Stone blueprint.
 * Supports functional, factory-based, and class-based subscribers.
 *
 * @param module - The subscriber implementation.
 * @param options - Optional `isFactory` flag to define subscriber type.
 * @returns A partial StoneBlueprint with the subscriber metadata.
 *
 * @example
 * ```ts
 * defineEventSubscriber(MySubscriberClass, { isClass: true })
 * defineEventSubscriber(() => ({ subscribe: emitter => ... }), { isFactory: true })
 * defineEventSubscriber((emitter) => { ... })
 * ```
 */
export function defineEventSubscriber (
  module: EventSubscriberType,
  options?: { isFactory?: boolean, isClass?: boolean }
): Partial<StoneBlueprint> {
  return {
    stone: {
      subscribers: [{
        ...options,
        module
      }]
    }
  }
}

/**
 * Registers a **class-based logger** into the Stone blueprint.
 *
 * @param module - The logger class that implements `ILogger`.
 * @param options - Optional configuration (must include `isClass: true` if specified).
 * @returns A partial StoneBlueprint with the logger configuration.
 */
export function defineLogger (
  module: ILoggerClass,
  options: { isClass: true, level?: LogLevel } & Record<string, unknown>
): Partial<StoneBlueprint>

/**
 * Registers a **factory-based logger** into the Stone blueprint.
 *
 * @param module - The logger factory function.
 * @param options - Optional configuration (must include `isFactory: true` if specified).
 * @returns A partial StoneBlueprint with the logger configuration.
 */
export function defineLogger (
  module: FactoryLogger,
  options: { isFactory: true, level?: LogLevel } & Record<string, unknown>
): Partial<StoneBlueprint>

/**
 * Registers a logger (class-based or factory-based) into the Stone blueprint.
 *
 * @param module - Either a logger class or factory function.
 * @param options - Optional configuration, including log level and isFactory flag.
 * @returns A partial StoneBlueprint with the logger resolver and settings.
 *
 * @example
 * ```ts
 * defineLogger(MyLogger, { level: 'debug', isClass: true })
 * defineLogger((ctx) => new MyLogger(ctx), { level: 'info', isFactory: true })
 * ```
 */
export function defineLogger (
  module: LoggerType,
  options?: { isFactory?: boolean, isClass?: boolean, level?: LogLevel } & Record<string, unknown>
): Partial<StoneBlueprint> {
  return {
    stone: {
      logger: {
        ...options,
        resolver: (blueprint: IBlueprint) => {
          return options?.isClass === true
            ? new (module as ILoggerClass).prototype.constructor({ blueprint })
            : (module as FactoryLogger)({ blueprint })
        }
      }
    }
  }
}
