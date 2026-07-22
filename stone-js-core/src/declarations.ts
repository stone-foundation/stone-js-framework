import { Event } from './events/Event'
import { Config } from '@stone-js/config'
import { EventEmitter } from './events/EventEmitter'
import { IContainer } from '@stone-js/service-container'
import { IncomingEvent, IncomingEventOptions } from './events/IncomingEvent'
import { OutgoingResponse, OutgoingResponseOptions } from './events/OutgoingResponse'
import { FactoryPipe, FunctionalPipe, MetaPipe, MixedPipe, NextPipe, PipeAlias, PipeClass, PipelineHookContext, PipelineHookListener, PipeType } from '@stone-js/pipeline'

/**
 * Export the Container interface
 */
export { IContainer }

/**
 * The unique symbol type used as the metadata key on decorated classes.
 *
 * `metadataKey` itself is an ambient, module-local declaration (no runtime value):
 * it exists only to type the computed-key positions below. The public, importable
 * surface is the `MetadataKey` type alias — there is deliberately no value export
 * named `metadataKey`, which previously produced a runtime `SyntaxError` on import.
 */
declare const metadataKey: unique symbol

/**
 * Type of the metadata key symbol. Import this (type-only) instead of the phantom value.
 */
export type MetadataKey = typeof metadataKey

/**
 * Represents a BlueprintMiddlewareHookContext type.
 */
export type BlueprintMiddlewareHookContext = PipelineHookContext<BlueprintContext, IBlueprint, any[]>

/**
 * Represents a MiddlewareHookContext type.
 */
export type MiddlewareHookContext<T = unknown, R = T, Args extends any[] = any[]> = PipelineHookContext<T, R, Args>

/**
 * Represents a Promiseable type.
 */
export type Promiseable<T> = T | Promise<T>

/**
 * Represents a lazy-loaded type.
 */
export type Laziable<T> = () => Promise<T>

/**
 * Represents a Arrayable type.
 */
export type Arrayable<T> = T | T[]

/**
 * Represents a Next type.
 */
export type NextMiddleware<T = unknown, R = T> = NextPipe<T, R>

/**
 * Represents a PipeAlias type.
 */
export type MiddlewareAlias = PipeAlias

/**
 * Represents a PipeClass type.
 */
export type MiddlewareClass<T = unknown, R = T> = PipeClass<T, R>

/**
 * Represents a FunctionalMiddleware type.
 */
export type FunctionalMiddleware<T = unknown, R = T> = FunctionalPipe<T, R>

/**
 * Represents a FactoryMiddleware type.
 */
export type FactoryMiddleware<T = unknown, R = T> = FactoryPipe<T, R>

/**
 * Represents a PipeAlias type.
 */
export type MiddlewareType<T = unknown, R = T> = PipeType<T, R>

/**
 * Represents a MetaMiddleware type.
 */
export type MetaMiddleware<T = unknown, R = T> = MetaPipe<T, R> & MiddlewareOptions

/**
 * Represents a MixedMiddleware type.
 */
export type MixedMiddleware<T = unknown, R = T> = MixedPipe<T, R>

/**
 * Represents a PipeInstance type.
 */
export interface IMiddleware<T = unknown, R = T> {
  handle: FunctionalMiddleware<T, R>
}

/**
 * Log level enumeration to define possible log levels.
 */
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  TRACE = 'trace'
}

/**
 * HookName Type.
 */
export type HookName =
  | BlueprintHookName
  | AdapterHookName
  | KernelHookName

/**
 * BlueprintHookName Type.
 */
export type BlueprintHookName =
  | 'onPreparingBlueprint'
  | 'onProcessingBlueprintMiddleware'
  | 'onBlueprintMiddlewareProcessed'
  | 'onBlueprintPrepared'

/**
 * AdapterHookName Type.
 */
export type AdapterHookName =
  | 'onStart'
  | 'onProcessingAdapterMiddleware'
  | 'onAdapterMiddlewareProcessed'
  | 'onBuildingIncomingEvent'
  | 'onHandlingAdapterError'
  | 'onBuildingRawResponse'
  | 'onStop'

/**
 * KernelHookName Type.
 */
export type KernelHookName =
  | 'onInit'
  | 'onHandlingEvent'
  | 'onEvent'
  | 'onExecutingEventHandler'
  | 'onExecutingErrorHandler'
  | 'onKernelMiddlewareProcessed'
  | 'onProcessingKernelMiddleware'
  | 'onPreparingResponse'
  | 'onResponsePrepared'
  | 'onEventHandled'
  | 'onTerminate'

/**
 * Represents a HookOptions type.
 */
export interface HookOptions {
  name: HookName
  method: string
}

/**
 * Represents a BlueprintHookOptions type.
 */
export interface BlueprintHookOptions {
  name: BlueprintHookName
  method: string
}

/**
 * AdapterMiddleware options.
 *
 * This interface defines the configuration options for marking a class as middleware.
 */
export interface AdapterMiddlewareOptions {
  /**
   * The params to pass to the middleware.
   */
  params?: unknown[]

  /**
   * The execution priority of the middleware.
   */
  priority?: number

  /**
   * The alias name for which the middleware is used.
   */
  adapterAlias?: string

  /**
   * The platform name for which the middleware is used.
   */
  platform?: string
}

/**
 * AdapterErrorHandler options.
 *
 * This interface defines the AdapterErrorHandler options for marking a class as a AdapterErrorHandler.
 */
export interface AdapterErrorHandlerOptions {
  /**
   * Additional configuration settings for the AdapterErrorHandler, if needed.
   */
  error: string | string[]

  /**
   * The alias name for which the AdapterErrorHandler is used.
   */
  adapterAlias?: string

  /**
   * The platform name for which the AdapterErrorHandler is used.
   */
  platform?: string
}

/**
 * ErrorHandler options.
 *
 * This interface defines the ErrorHandler options for marking a class as a ErrorHandler.
 */
export interface ErrorHandlerOptions {
  /**
   * Additional configuration settings for the ErrorHandler, if needed.
   */
  error: string | string[]
}

/**
 * Listener options.
 *
 * This interface defines the configuration options for marking a class as a listener.
 */
export interface ListenerOptions {
  /**
   * The event that the listener should handle.
   */
  event: string
}

/**
 * Middleware options.
 *
 * This interface defines the configuration options for marking a class as middleware.
 */
export interface MiddlewareOptions {
  /**
   * Whether the middleware should be treated as a singleton.
   */
  singleton?: boolean

  /**
   * The alias of the middleware.
   */
  alias?: string | string[]

  /**
   * The params to pass to the middleware.
   */
  params?: unknown[]

  /**
   * The execution priority of the middleware.
   */
  priority?: number

  /**
   * Set as Kernel middleware
   */
  global?: boolean
}

/**
 * Service options.
 *
 * This interface defines the configuration options for marking a class as a service.
 */
export interface ServiceOptions {
  /**
   * Whether the service should be treated as a singleton.
   * A singleton service will only have one instance in the container.
   * Optional.
   */
  singleton?: boolean

  /**
   * Alias or aliases for the service, used for identification or access.
   * Can be a single alias or an array of aliases.
   */
  alias: string | string[]
}

/**
 * Logger Interface.
 *
 * Represents a generic logging interface, which can either be a native console object or a popular JavaScript logging library.
 */
export interface ILogger {
  /**
   * Logs informational messages.
   *
   * @param message - The message to log.
   * @param optionalParams - Optional parameters to log.
   */
  info: (message: string, ...optionalParams: unknown[]) => void

  /**
   * Logs debug-level messages, used for debugging purposes.
   *
   * @param message - The message to log.
   * @param optionalParams - Optional parameters to log.
   */
  debug: (message: string, ...optionalParams: unknown[]) => void

  /**
   * Logs warnings, used to indicate potential issues.
   *
   * @param message - The warning message to log.
   * @param optionalParams - Optional parameters to log.
   */
  warn: (message: string, ...optionalParams: unknown[]) => void

  /**
   * Logs errors, used to report errors or exceptions.
   *
   * @param message - The error message to log.
   * @param optionalParams - Optional parameters to log.
   */
  error: (message: string, ...optionalParams: unknown[]) => void

  /**
   * Logs general messages, similar to `info` but less specific.
   *
   * @param message - The message to log.
   * @param optionalParams - Optional parameters to log.
   */
  log?: (message: string, ...optionalParams: unknown[]) => void

  /**
   * Logs trace-level messages, providing the most detailed information, usually for diagnostic purposes.
   *
   * @param message - The trace message to log.
   * @param optionalParams - Optional parameters to log.
   */
  trace?: (message: string, ...optionalParams: unknown[]) => void
}

/**
 * Represents a ILoggerClass type.
 */
export type ILoggerClass = new (...args: any[]) => ILogger

/**
 * Represents a FactoryLogger type.
 *
 * @param container - The dependency injection container.
 * @returns The logger object.
 */
export type FactoryLogger = (container: any) => ILogger

/**
 * Represents a Logger type.
 */
export type LoggerType = ILoggerClass | FactoryLogger

/**
 * Represents an IncomingEvent source.
 */
export interface IncomingEventSource {
  /**
   * The raw event object from the originating platform.
   */
  rawEvent: unknown

  /**
   * The raw context object from the originating platform.
   */
  rawContext: unknown

  /**
   * The raw response object from the originating platform.
   */
  rawResponse?: unknown

  /**
   * The platform from which the event originated.
   */
  platform: string | symbol
}

/**
 * Represents an IServiceProviderClass type.
 */
export type IServiceProviderClass = new (...args: any[]) => IServiceProvider

/**
 * Interface representing a service provider within the system.
 *
 * This interface provides lifecycle hooks for managing the registration,
 * initialization, and termination phases of a provider. Implementations
 * of this interface are expected to define these lifecycle methods as needed.
 */
export interface IServiceProvider {
  /**
   * Registers the provider into the system. Typically used for adding services or bindings to the container.
   */
  register?: () => Promiseable<void>

  /**
   * Boots the provider after registration. This method is used to initialize services that need to be started.
   */
  boot?: () => Promiseable<void>

  /**
   * Skip this provider.
   */
  mustSkip?: () => Promiseable<boolean>
}

/**
 * Represents a FactoryServiceProvider type.
 *
 * @param container - The dependency injection container.
 * @returns The service provider object.
 */
export type FactoryServiceProvider = (container: any) => IServiceProvider

/**
 * Represents a ServiceProvider type.
 */
export type ServiceProviderType = IServiceProviderClass | FactoryServiceProvider

/**
 * Represents a MetaServiceProvider type.
 */
export interface MetaServiceProvider {
  isClass?: boolean
  isFactory?: boolean
  module: ServiceProviderType
}

/**
 * Represents a MixedServiceProvider type.
 */
export type MixedServiceProvider = IServiceProviderClass | MetaServiceProvider

/**
 * Represents a IServiceClass type.
 */
export type IServiceClass = new (...args: any[]) => any

/**
 * Represents a FactoryService type.
 *
 * @param container - The dependency injection container.
 * @returns The service object.
 */
export type FactoryService = (container: any) => Record<PropertyKey, any>

/**
 * Represents a ServiceProvider type.
 */
export type ServiceType = IServiceClass | FactoryService

/**
 * Represents a MetaService type.
 */
export interface MetaService {
  isClass?: boolean
  isFactory?: boolean
  singleton?: boolean
  alias: string | string[]
  module: ServiceType
}

/**
 * Represents a IEventListenerClass type.
 */
export type IEventListenerClass<TEvent extends Event = Event> = new (...args: any[]) => IEventListener<TEvent>

/**
 * Interface representing a listener for handling specific events.
 *
 * Listeners implementing this interface should define a `handle` method
 * that is called whenever the associated event occurs.
 */
export interface IEventListener<TEvent extends Event = Event> {
  /**
   * Handles the event when it occurs. This method contains the logic that runs when the event is triggered.
   *
   * @returns The event listener function.
   */
  handle: FunctionalEventListener<TEvent>
}

/**
 * Represents a FunctionalEventListener type.
 *
 * @param event - The event to handle.
 */
export type FunctionalEventListener<TEvent extends Event = Event> = (event: TEvent) => Promiseable<void>

/**
 * Represents a FactoryEventListener type.
 *
 * @param container - The dependency injection container.
 * @returns The event listener function.
 */
export type FactoryEventListener<TEvent extends Event = Event> = (container: any) => FunctionalEventListener<TEvent>

/**
 * Represents a EventListener type.
 */
export type EventListenerType<TEvent extends Event = Event> =
  | IEventListenerClass<TEvent>
  | FactoryEventListener<TEvent>
  | FunctionalEventListener<TEvent>

/**
 * Represents a MetaEventListener type.
 */
export interface MetaEventListener<TEvent extends Event = Event> {
  event: string
  isClass?: boolean
  isFactory?: boolean
  module: EventListenerType<TEvent>
}

/**
 * Represents an IEventSubscriberClass type.
 *
 */
export type IEventSubscriberClass = new (...args: any[]) => IEventSubscriber

/**
 * Interface representing a subscriber to an event emitter.
 *
 * Subscribers implementing this interface can subscribe to an event emitter
 * and handle multiple types of events.
 */
export interface IEventSubscriber {
  /**
   * Subscribes to an event emitter to handle various events.
   *
   * @param eventEmitter - The event emitter to subscribe to.
   */
  subscribe: FunctionalEventSubscriber
}

/**
 * Represents a FunctionalEventSubscriber type.
 *
 * @param eventEmitter - The event emitter to subscribe to.
 */
export type FunctionalEventSubscriber = (eventEmitter: EventEmitter) => Promiseable<void>

/**
 * Represents a FactoryEventSubscriber type.
 *
 * @param container - The dependency injection container.
 * @returns The event subscriber function.
 */
export type FactoryEventSubscriber = (container: any) => FunctionalEventSubscriber

/**
 * Represents a EventSubscriber type.
 */
export type EventSubscriberType = IEventSubscriberClass | FunctionalEventSubscriber | FactoryEventSubscriber

/**
 * Represents a MetaEventSubscriber type.
 */
export interface MetaEventSubscriber {
  isClass?: boolean
  isFactory?: boolean
  module: EventSubscriberType
}

/**
 * Represents a MixedEventSubscriber type.
 */
export type MixedEventSubscriber = FunctionalEventSubscriber | MetaEventSubscriber

/**
 * Represents a LifecycleEventHandler class.
 *
 * @template TEvent, UResponse
 */
export type EventHandlerClass<TEvent extends IncomingEvent = IncomingEvent, UResponse = unknown> = new (
  ...args: any[]
) => IEventHandler<TEvent, UResponse>

/**
 * EventHandler Interface.
 * Represents an event handler for processing incoming events and returning outgoing responses.
 *
 * @template TEvent, UResponse
 */
export interface IEventHandler<TEvent extends IncomingEvent = IncomingEvent, UResponse = unknown> {
  handle: FunctionalEventHandler<TEvent, UResponse>
}

/**
 * FunctionalEventHandler.
 *
 * Represents a function that handles incoming events and returns an outgoing response.
 *
 * @template TEvent, UResponse
 * @param incomingEvent - The incoming event to handle.
 * @returns The outgoing response.
 */
export type FunctionalEventHandler<TEvent extends IncomingEvent, UResponse = unknown> = (
  incomingEvent: TEvent
) => Promiseable<UResponse>

/**
 * FactoryEventHandler.
 *
 * Represents a factory function that creates an event handler function.
 *
 * @template TEvent, UResponse
 * @param container - The dependency injection container.
 * @returns The event handler function.
 */
export type FactoryEventHandler<TEvent extends IncomingEvent, UResponse = unknown> = (
  container: any
) => FunctionalEventHandler<TEvent, UResponse>

/**
 * EventHandler Interface.
 * Represents an event handler that can handle incoming events and return outgoing responses.
 *
 * @template TEvent, UResponse
 */
export type EventHandlerType<
  TEvent extends IncomingEvent = IncomingEvent,
  UResponse = unknown
> = EventHandlerClass<TEvent, UResponse> | FunctionalEventHandler<TEvent, UResponse> | FactoryEventHandler<TEvent, UResponse>

/**
 * MetaEventHandler Interface.
 *
 * Represents a metadata object for an app event handler.
 *
 * @template TEvent, UResponse
 */
export interface MetaEventHandler<TEvent extends IncomingEvent = IncomingEvent, UResponse = unknown> {
  isClass?: boolean
  isFactory?: boolean
  module: EventHandlerType<TEvent, UResponse>
}

/**
 * MixedEventHandler Type.
 *
 * Represents an event handler that can either be a simple function or a meta event handler.
 *
 * @template TEvent, UResponse
 */
export type MixedEventHandler<TEvent extends IncomingEvent = IncomingEvent, UResponse = unknown> =
  | FunctionalEventHandler<TEvent, UResponse>
  | MetaEventHandler<TEvent, UResponse>

/**
 * Hook Type.
 *
 * Represents a hook that can either be synchronous or asynchronous.
 */
export interface KernelHookType<
IncomingEventType extends IncomingEvent,
OutgoingResponseType extends OutgoingResponse
> {
  onInit?: KernelHookListener[]
  onHandlingEvent?: KernelHookListener[]
  onEvent?: KernelHookListener[]
  onExecutingEventHandler?: KernelHookListener[]
  onExecutingErrorHandler?: KernelHookListener[]
  onPreparingResponse?: KernelHookListener[]
  onResponsePrepared?: KernelHookListener[]
  onProcessingKernelMiddleware?: Array<PipelineHookListener<IncomingEventType, OutgoingResponseType, any[]>>
  onKernelMiddlewareProcessed?: Array<PipelineHookListener<IncomingEventType, OutgoingResponseType, any[]>>
  onEventHandled?: KernelHookListener[]
  onTerminate?: KernelHookListener[]
}

/**
 * Hook interface.
 *
 * Represents a hook that can either be synchronous or asynchronous.
 */
export interface IKernelHook<
IncomingEventType extends IncomingEvent,
OutgoingResponseType extends OutgoingResponse
> {
  onInit?: KernelHookListener
  onHandlingEvent?: KernelHookListener
  onEvent?: KernelHookListener
  onExecutingEventHandler?: KernelHookListener
  onExecutingErrorHandler?: KernelHookListener
  onPreparingResponse?: KernelHookListener
  onResponsePrepared?: KernelHookListener
  onProcessingKernelMiddleware?: PipelineHookListener<IncomingEventType, OutgoingResponseType, any[]>
  onKernelMiddlewareProcessed?: PipelineHookListener<IncomingEventType, OutgoingResponseType, any[]>
  onEventHandled?: KernelHookListener
  onTerminate?: KernelHookListener
}

/**
 * KernelHookListener Type.
 *
 * Represents a listener hook that can either be synchronous or asynchronous.
 */
export type KernelHookListener = (container?: any) => Promiseable<void>

/**
 * Represents a IBlueprintBuilder type.
 *
 * @template BlueprintType
 */
export interface IBlueprintBuilder<BlueprintType extends IBlueprint = IBlueprint> {
  /**
   * Build the configuration blueprint by extracting metadata from the provided modules.
   *
   * @param modules - The modules to build the configuration from.
   * @returns The configuration blueprint.
  */
  build: (modules: unknown[]) => Promise<BlueprintType>
}

/**
 * ConfigContext Interface.
 *
 * Represents the context object for configuration, which contains the modules and blueprint used to configure the system.
 */
export interface BlueprintContext<
BlueprintType extends IBlueprint = IBlueprint,
ModuleType = ClassType | PipeClass
> {
  /**
   * The configuration blueprint.
   */
  readonly blueprint: BlueprintType

  /**
   * List of configuration modules.
   */
  readonly modules: ModuleType[]
}

/**
 * Blueprint Hook Type.
 *
 * Represents a hook that can either be synchronous or asynchronous.
 */
export interface BlueprintHookType<
BlueprintType extends IBlueprint = IBlueprint,
ContextType extends BlueprintContext<BlueprintType> = BlueprintContext<BlueprintType>
> {
  onPreparingBlueprint?: Array<BlueprintHookListener<BlueprintType, ContextType>>
  onBlueprintPrepared?: Array<BlueprintHookListener<BlueprintType, ContextType>>
  onProcessingBlueprintMiddleware?: Array<PipelineHookListener<ContextType, BlueprintType, any[]>>
  onBlueprintMiddlewareProcessed?: Array<PipelineHookListener<ContextType, BlueprintType, any[]>>
}

/**
 * Blueprint Hook interface.
 *
 * Represents a hook that can either be synchronous or asynchronous.
 */
export interface IBlueprintHook<
BlueprintType extends IBlueprint = IBlueprint,
ContextType extends BlueprintContext<BlueprintType> = BlueprintContext<BlueprintType>
> {
  onPreparingBlueprint?: BlueprintHookListener<BlueprintType, ContextType>
  onBlueprintPrepared?: BlueprintHookListener<BlueprintType, ContextType>
  onProcessingBlueprintMiddleware?: PipelineHookListener<ContextType, BlueprintType, any[]>
  onBlueprintMiddlewareProcessed?: PipelineHookListener<ContextType, BlueprintType, any[]>
}

/**
 * BlueprintHookListener Type.
 *
 * Represents a listener hook that can either be synchronous or asynchronous.
 */
export type BlueprintHookListener<
BlueprintType extends IBlueprint = IBlueprint,
ContextType extends BlueprintContext<BlueprintType> = BlueprintContext<BlueprintType>
> = (context: ContextType) => Promiseable<void>

/**
 * LoggerResolver Type.
 *
 * Represents a function that resolves a logger instance based on the provided blueprint.
 *
 * @param blueprint - The application blueprint.
 * @returns The logger instance.
 */
export type LoggerResolver = (blueprint: IBlueprint) => ILogger

/**
 * KernelResolver Type.
 *
 * Represents a function that resolves a lifecycle event handler based on the provided blueprint.
 *
 * @template TEvent, UResponse
 * @param blueprint - The application blueprint.
 * @returns The lifecycle event handler.
 */
export type KernelResolver<TEvent extends IncomingEvent, UResponse extends OutgoingResponse> = (
  blueprint: IBlueprint
) => ILifecycleAdapterEventHandler<TEvent, UResponse>

/**
 * ResponseResolverOptions Type.
 *
 * Represents the options for resolving an outgoing response.
 */
export type ResponseResolverOptions = OutgoingResponseOptions & Record<string, unknown>

/**
 * ResponseResolver Type.
 *
 * Represents a function that resolves an outgoing response based on the provided options.
 *
 * @template TOutgoingResponse, TOptions
 * @param options - The outgoing response options.
 * @returns The outgoing response.
 */
export type ResponseResolver<TOutgoingResponse extends OutgoingResponse> = (
  options: ResponseResolverOptions
) => Promiseable<TOutgoingResponse>

/**
 * IErrorHandlerClass Type.
 *
 * @template TEvent, UResponse
 * @param args - The application constructor params.
 * @returns The error handler.
 */
export type IErrorHandlerClass<
TEvent extends IncomingEvent = IncomingEvent,
UResponse = unknown
> = new (...args: any[]) => IErrorHandler<TEvent, UResponse>

/**
 * ErrorHandler Interface.
 *
 * Represents an error handler that provides methods to report and render errors.
 *
 * @template TEvent, UResponse
 */
export interface IErrorHandler<TEvent extends IncomingEvent, UResponse = unknown> {
  handle: FunctionalErrorHandler<TEvent, UResponse>
}

/**
 * FunctionalErrorHandler Type.
 *
 * Represents a function that handles errors and returns responses.
 *
 * @template TEvent, UResponse
 * @param error - The error to handle.
 * @param event - The incoming event.
 * @returns The outgoing response.
 */
export type FunctionalErrorHandler<
TEvent extends IncomingEvent,
UResponse = unknown
> = (error: any, event: TEvent) => Promiseable<UResponse>

/**
 * FactoryErrorHandler Type.
 *
 * Represents a factory function that creates an error handler function.
 *
 * @template TEvent, UResponse
 * @param container - The dependency injection container.
 * @returns The error handler function.
 */
export type FactoryErrorHandler<TEvent extends IncomingEvent, UResponse = unknown> = (
  container: any
) => FunctionalErrorHandler<TEvent, UResponse>

/**
 * ErrorHandler Type.
 *
 * Represents an error handler which can either be a class, a simple function or a factory function.
 */
export type ErrorHandlerType<TEvent extends IncomingEvent, UResponse = unknown> =
  | IErrorHandlerClass<TEvent, UResponse>
  | FunctionalErrorHandler<TEvent, UResponse> | FactoryErrorHandler<TEvent, UResponse>

/**
 * MetaErrorHandler Interface.
 *
 * Represents a metadata object for an error handler.
 *
 * @template TEvent, UResponse
 */
export interface MetaErrorHandler<TEvent extends IncomingEvent, UResponse = unknown> {
  isClass?: boolean
  isFactory?: boolean
  module: ErrorHandlerType<TEvent, UResponse>
}

/**
 * ConfigurationClass type.
 *
 * @template TValues
 */
export type ConfigurationClass<TValues extends object = any> = new (...args: any[]) => IConfiguration<TValues>

/**
 * Configuration Interface.
 *
 * Represents a configuration object that can be used to configure the system.
 *
 * @param blueprint - The blueprint to configure.
 *
 * @template TValues
 */
export interface IConfiguration<TValues extends object = any> {
  configure?: FunctionalConfiguration<TValues>
  afterConfigure?: FunctionalConfiguration<TValues>
}

/**
 * FunctionalConfiguration Type.
 *
 * Represents a function that configures the system based on the provided blueprint.
 *
 * @template TValues
 * @param blueprint - The blueprint to configure.
 * @returns A promise that resolves when the configuration is complete.
 */
export type FunctionalConfiguration<TValues extends object = any> = (blueprint: IBlueprint<TValues>) => Promiseable<void>

/**
 * MetaConfiguration Interface.
 *
 * Represents a metadata object for a configuration.
 *
 * @template TValues
 */
export interface MetaConfiguration<TValues extends object = any> {
  isClass?: boolean
  module: ConfigurationClass<TValues> | FunctionalConfiguration<TValues>
}

/**
 * MixedConfiguration Type.
 *
 * @template TValues
*/
export type MixedConfiguration<TValues extends object = any> = MetaConfiguration<TValues> | FunctionalConfiguration<TValues>

/**
 * Blueprint Interface.
 *
 * Represents the blueprint configuration object, which is an instance of Config.
 *
 * @template TValues
 */
export type IBlueprint<TValues extends object = any> = Config<TValues>

/**
 * ClassType Type.
 *
 * Represents a class type, including abstract classes.
 */
export type ClassType<Type = any> = (new (...args: any[]) => Type)

/**
 * Abstract ClassType Type.
 *
 * Represents a class type, including abstract classes.
 */
export type AbstractClassType<Type = any> = (abstract new (...args: any[]) => Type)

/**
 * ClassMethodType Type.
 *
 * Represents a method type within a class, with a specific context.
 *
 * @template This
 */
export type ClassMethodType<This = unknown> = (this: This, ...args: any[]) => any

/**
 * Represents options for configuring an error.
 */
export interface ErrorOptions {
  /**
   * A specific error code for identifying the error.
   */
  code?: string

  /**
   * The original error that caused this error, useful for error chaining.
   */
  cause?: Error

  /**
   * Additional information or context about the error.
   */
  metadata?: unknown
}

/**
 * Represents a wildcard event name.
*/
export type WildcardEventName = string | symbol

/**
 * Represents an event listener handler.
 */
export type ListenerHandler<T extends Event = Event> = (event: T) => Promiseable<void>

/**
 * Represents a wildcard event listener handler.
 */
export type WildcardListenerHandler<T = string | symbol, U extends Event = Event> = (eventName: T, event: U) => Promiseable<void>

/**
 * Represents a listener handler that can either be a simple function or a wildcard function.
 */
export type MixedListenerHandler<
  TEventType extends Event,
  UEventName
> = ListenerHandler<TEventType> | WildcardListenerHandler<UEventName, TEventType>

/**
 * Represents the application lifecycle hooks.
 */
export type LifecycleHookType<
BlueprintType extends IBlueprint = IBlueprint,
AdapterContextType = unknown,
RawResponseType = unknown,
IncomingEventType extends IncomingEvent = IncomingEvent,
OutgoingResponseType extends OutgoingResponse = OutgoingResponse
> =
  & BlueprintHookType<BlueprintType>
  & AdapterHookType<AdapterContextType, RawResponseType>
  & KernelHookType<IncomingEventType, OutgoingResponseType>

/**
 * Represents the application lifecycle hooks listeners.
 */
export type LifecycleHookListener<
BlueprintType extends IBlueprint = IBlueprint,
AdapterContextType = unknown,
RawResponseType = unknown,
IncomingEventType extends IncomingEvent = IncomingEvent,
OutgoingResponseType extends OutgoingResponse = OutgoingResponse
> =
  | BlueprintHookListener<BlueprintType>
  | PipelineHookListener<BlueprintContext<BlueprintType>, BlueprintType, any[]>
  | AdapterHookListener<AdapterContextType>
  | PipelineHookListener<AdapterContextType, AdapterEventBuilderType<RawResponseType>, any[]>
  | KernelHookListener
  | PipelineHookListener<IncomingEventType, OutgoingResponseType, any[]>

/** *********************************************** Proposal decorator *************/
/**
 * Represents an object that holds metadata keyed by the `MetadataSymbol`.
 */
export interface MetadataHolder {
  [metadataKey]: Record<PropertyKey, unknown>
}

/**
 * Represents a class decorator using the 2023-11 proposal syntax.
 *
 * A function that decorates a class and optionally returns a new constructor.
 *
 * @template TClass - The type of the class constructor being decorated.
 * @param target - The class constructor to be decorated.
 * @param context - The context object providing metadata about the class.
 * @returns The original or a modified class constructor, or `undefined`.
 */
export type ProposalClassDecorator<TClass extends ClassType = ClassType> = <TFunction extends TClass>(
  target: TFunction,
  context: ClassDecoratorContext<TClass>
) => TFunction | undefined

/**
 * Represents a method decorator using the 2023-11 proposal syntax.
 *
 * A function that decorates a class method and optionally returns a new method implementation.
 *
 * @template T - The type of the method being decorated.
 * @param target - The class prototype or static target containing the method.
 * @param context - The context object providing metadata about the method.
 * @returns The original or a modified method, or `undefined`.
 */
export type ProposalMethodDecorator<T extends Function = Function> = <TFunction extends T>(
  target: TFunction,
  context: ClassMethodDecoratorContext<T>
) => TFunction | undefined

/**
 * Represents a property decorator using the 2023-11 proposal syntax.
 *
 * A function that decorates a class field and optionally returns an initializer function
 * to define the property's initial value.
 *
 * @param target - Always `undefined` for field decorators.
 * @param context - The context object providing metadata about the field.
 * @returns An initializer function for the property value.
 */
export type ProposalPropertyDecorator = (
  target: undefined,
  context: ClassFieldDecoratorContext
) => (initialValue: unknown) => unknown

/**
 * Represents an accessor decorator using the 2023-11 proposal syntax.
 *
 * A function that decorates a getter or setter method and optionally returns a new implementation.
 *
 * @template T - The type of the accessor being decorated.
 * @param target - The class prototype or static target containing the accessor.
 * @param context - The context object providing metadata about the accessor.
 * @returns The original or a modified accessor, or `undefined`.
 */
export type ProposalAccessorDecorator<T extends Function = Function> = <TFunction extends T>(
  target: TFunction,
  context: ClassAccessorDecoratorContext<T>
) => TFunction | undefined

/** *********************************************** Adapter *************/
/**
 * Represents an adapter handler options.
*/
export interface AdapterHandlerOptions {
  blueprint: IBlueprint
}

/**
 * RawResponseBuilder Interface.
 *
 * Represents a wrapper for building raw responses with specific options and a response function.
 *
 * @template TResponse
 */
export interface IRawResponseWrapper<TResponse> {
  respond: () => Promiseable<TResponse>
}

/**
 * IAdapterEventBuilder Interface.
 *
 * Interface representing a builder for adapters that provides methods for adding properties and building the resulting object.
 *
 * @template TValues, UResponse
 */
export interface IAdapterEventBuilder<TValues, UResponse> {
  readonly options: TValues
  build: () => UResponse
  add: (key: keyof TValues, value: TValues[typeof key]) => this
  addIf: (key: keyof TValues, value: TValues[typeof key]) => this
}

/**
 * AdapterEventBuilderType Type.
 *
 * Represents an event builder type for adapters.
 *
 * @template RawResponseType
 */
export type AdapterEventBuilderType<RawResponseType> =
  | IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>

/**
 * AdapterMixedPipeType Type.
 *
 * Represents a mixed pipe type for adapters.
 *
 * @template AdapterContextType, RawResponseType
 */
export type AdapterMixedPipeType<AdapterContextType, RawResponseType> =
  | MixedPipe<AdapterContextType, AdapterEventBuilderType<RawResponseType>>

/**
 * RawResponseOptions.
 *
 * Represents an object where the property keys can be any valid property key and values can be anything.
 */
export interface RawResponseOptions {
  [k: PropertyKey]: unknown
}

/**
 * ILifecycleAdapterEventHandler Interface.
 *
 * Represents a lifecycle event handler with hooks for initialization, pre-handling, handling, and termination phases.
 *
 * @template TEvent, UResponse
 */
export interface ILifecycleAdapterEventHandler<TEvent extends IncomingEvent, UResponse extends OutgoingResponse> {
  onInit?: () => Promiseable<void>
  onHandlingEvent?: () => Promiseable<void>
  onEvent?: () => Promiseable<void>
  handle: FunctionalAdapterEventHandler<TEvent, UResponse>
  onEventHandled?: () => Promiseable<void>
  onTerminate?: () => Promiseable<void>
}

/**
 * FunctionalAdapterEventHandler.
 *
 * Represents a function that handles incoming events and returns an outgoing response.
 *
 * @template TEvent, UResponse
 * @param incomingEvent - The incoming event to handle.
 * @returns The outgoing response.
 */
export type FunctionalAdapterEventHandler<TEvent extends IncomingEvent, UResponse extends OutgoingResponse> = (
  incomingEvent: TEvent
) => Promiseable<UResponse>

/**
 * AdapterEventHandler Type.
 *
 * Represents an event handler which can either be a simple function or a lifecycle event handler object.
 *
 * @template TEvent, UResponse
 */
export type AdapterEventHandlerType<
  TEvent extends IncomingEvent = IncomingEvent,
  UResponse extends OutgoingResponse = OutgoingResponse
> = ILifecycleAdapterEventHandler<TEvent, UResponse> | FunctionalAdapterEventHandler<TEvent, UResponse>

/**
 * AdapterEventHandlerResolver.
 *
 * Represents a resolver that provides an event handler based on the provided blueprint.
 *
 * @template TEvent, UResponse
 * @param blueprint - The application blueprint.
 * @returns The event handler.
 */
export type AdapterEventHandlerResolver<TEvent extends IncomingEvent, UResponse extends OutgoingResponse> = (
  blueprint: IBlueprint
) => AdapterEventHandlerType<TEvent, UResponse>

/**
 * AdapterHookListener Type.
 *
 * Represents a listener hook that can either be synchronous or asynchronous.
 */
export type AdapterHookListener<AdapterContextType = any> = (
  context: AdapterHookListenerContext<AdapterContextType>
) => Promiseable<void>

/**
 * AdapterHookListenerContext Interface.
 *
 * Represents the context object for adapter hook listeners.
 */
export interface AdapterHookListenerContext<AdapterContextType = any> {
  error?: any
  blueprint: IBlueprint
  context?: AdapterContextType
}

/**
 * AdapterHook type.
 *
 * Represents lifecycle hooks that can be defined for the adapter, such as initialization, pre-handling, and termination.
 */
export interface AdapterHookType<AdapterContextType = any, RawResponseType = any> {
  onStart?: Array<AdapterHookListener<AdapterContextType>>
  onProcessingAdapterMiddleware?: Array<PipelineHookListener<AdapterContextType, AdapterEventBuilderType<RawResponseType>, any[]>>
  onAdapterMiddlewareProcessed?: Array<PipelineHookListener<AdapterContextType, AdapterEventBuilderType<RawResponseType>, any[]>>
  onBuildingIncomingEvent?: Array<AdapterHookListener<AdapterContextType>>
  onHandlingAdapterError?: Array<AdapterHookListener<AdapterContextType>>
  onBuildingRawResponse?: Array<AdapterHookListener<AdapterContextType>>
  onStop?: Array<AdapterHookListener<AdapterContextType>>
}

/**
 * AdapterHook Interface.
 *
 * Represents lifecycle hooks that can be defined for the adapter, such as initialization, pre-handling, and termination.
 */
export interface IAdapterHook<AdapterContextType = any, RawResponseType = any> {
  onStart?: AdapterHookListener<AdapterContextType>
  onProcessingAdapterMiddleware?: PipelineHookListener<AdapterContextType, AdapterEventBuilderType<RawResponseType>, any[]>
  onAdapterMiddlewareProcessed?: PipelineHookListener<AdapterContextType, AdapterEventBuilderType<RawResponseType>, any[]>
  onBuildingIncomingEvent?: AdapterHookListener<AdapterContextType>
  onHandlingAdapterError?: AdapterHookListener<AdapterContextType>
  onBuildingRawResponse?: AdapterHookListener<AdapterContextType>
  onStop?: AdapterHookListener<AdapterContextType>
}

/**
 * Adapter Interface.
 *
 * Represents an adapter with a run method that returns a promise of type ExecutionResultType.
 */
export interface IAdapter {
  run: <ExecutionResultType = unknown>() => Promise<ExecutionResultType>
}

/**
 * AdapterResolver Type.
 *
 * Represents a function that resolves an adapter instance based on the provided blueprint.
 *
 * @param blueprint - The application blueprint.
 * @returns The adapter instance.
 */
export type AdapterResolver = (blueprint: IBlueprint) => IAdapter

/**
 * Class representing an AdapterContext.
 *
 * @template RawEventType
 * @template RawResponseType
 * @template ExecutionContextType
 * @template IncomingEventType
 * @template IncomingEventOptionsType
 * @template OutgoingResponseType
 */
export interface AdapterContext<
RawEventType,
RawResponseType,
ExecutionContextType,
IncomingEventType extends IncomingEvent = IncomingEvent,
IncomingEventOptionsType extends IncomingEventOptions = IncomingEventOptions,
OutgoingResponseType extends OutgoingResponse = OutgoingResponse
> {
  /**
   * The rawEvent of type RawEventType.
   */
  readonly rawEvent: RawEventType

  /**
   * The rawResponse of type RawResponseType.
   */
  rawResponse?: RawResponseType

  /**
   * The executionContext of type ExecutionContextType.
   */
  readonly executionContext: ExecutionContextType

  /**
   * The incomingEvent associated with the executionContext.
   */
  incomingEvent?: IncomingEventType

  /**
   * The outgoingResponse associated with the executionContext.
   */
  outgoingResponse?: OutgoingResponseType

  /**
   * The incomingEventBuilder.
   */
  readonly incomingEventBuilder: IAdapterEventBuilder<IncomingEventOptionsType, IncomingEventType>

  /**
   * The rawResponseBuilder.
   */
  readonly rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>
}

/**
 * Class representing an AdapterErrorContext.
 *
 * @template RawEventType
 * @template RawResponseType
 * @template ExecutionContextType
 */
export interface AdapterErrorContext<RawEventType, RawResponseType, ExecutionContextType> {
  /**
   * The rawEvent of type RawEventType.
   */
  readonly rawEvent: RawEventType

  /**
   * The executionContext of type ExecutionContextType.
   */
  readonly executionContext: ExecutionContextType

  /**
   * The rawResponseBuilder.
   */
  readonly rawResponseBuilder: IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>
}

/**
 * AdapterErrorHandlerClass Type.
 *
 * Represents a class type for adapter error handlers.
 *
 * @template RawEventType
 * @template RawResponseType
 * @template ExecutionContextType
 */
export type IAdapterErrorHandlerClass<RawEventType, RawResponseType, ExecutionContextType> = new (
  ...args: any[]
) => IAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>

/**
 * Adapter ErrorHandler Interface.
 *
 * Represents an error handler for the adapters, which can handle errors and return responses.
 */
export interface IAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType> {
  handle: FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>
}

/**
 * FunctionalAdapterErrorHandler Type.
 *
 * Represents a function that handles errors and returns responses.
 *
 * @template RawEventType
 * @template RawResponseType
 * @template ExecutionContextType
 */
export type FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType> = (
  error: any,
  context: AdapterErrorContext<RawEventType, RawResponseType, ExecutionContextType>
) => Promiseable<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>>

/**
 * FactoryAdapterErrorHandler Type.
 *
 * Represents a factory function that creates an adapter error handler function.
 *
 * @template RawEventType
 * @template RawResponseType
 * @template ExecutionContextType
 */
export type FactoryAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType> = (
  options: AdapterHandlerOptions
) => FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>

/**
 * AdapterErrorHandler Type.
 *
 * Represents an error handler which can either be a class, a simple function or a factory function.
 */
export type AdapterErrorHandlerType<RawEventType, RawResponseType, ExecutionContextType> =
  | IAdapterErrorHandlerClass<RawEventType, RawResponseType, ExecutionContextType>
  | FactoryAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>
  | FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>

/**
 * MetaAdapterErrorHandler Interface.
 *
 * Represents a metadata object for an adapter error handler.
 *
 * @template RawEventType
 * @template RawResponseType
 * @template ExecutionContextType
 */
export interface MetaAdapterErrorHandler<RawEventType = any, RawResponseType = any, ExecutionContextType = any> {
  isClass?: boolean
  isFactory?: boolean
  module: AdapterErrorHandlerType<RawEventType, RawResponseType, ExecutionContextType>
}
/** ************** End Adapter *************/
