import { Route } from './Route'
import { MatcherOptions } from './matchers'
import { MixedPipe, PipeType } from '@stone-js/pipeline'
import { Event, FunctionalEventListener, IContainer, IncomingEvent, OutgoingResponse, Promiseable } from '@stone-js/core'

/**
 * Parameters passed in a route.
 */
export type RouteParams = Record<string, unknown>

/**
 * Supported HTTP methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'

/**
 * Represents a valid resolver for dependency binding.
 */
export type BindingResolver = (key: string, value: unknown, resolver?: DependencyResolver) => Promiseable<unknown>

/**
 * Represents a model bound to a route.
 */
export type IBoundModel = Function & { resolveRouteBinding: BindingResolver }

/**
 * Represents a bound instance.
 */
export type IBoundInstance = Record<string, (key: string, value: unknown) => Promiseable<unknown>>

/**
 * Represents a valid key for dependency binding.
 */
export type BindingKey = number | boolean | string | Function | object | symbol

/**
 * Represents a valid value for dependency binding.
 */
export type BindingValue = BindingKey

/**
 * Represents an outgoing response.
 */
export type IOutgoingResponse = OutgoingResponse

/**
 * Represents an incoming event.
 * Generic interface for incoming events.
 * Standalone interface for incoming events.
 */
export interface IIncomingEvent extends IncomingEvent {
  url: URL
  host: string
  body?: unknown
  pathname: string
  method: HttpMethod
  query?: URLSearchParams
  decodedPathname?: string
  readonly isSecure?: boolean
  isMethod: (method: HttpMethod) => boolean
  getUri: (withDomain: boolean) => string | undefined
  setRouteResolver: <U extends IIncomingEvent, V = unknown>(resolver: () => Route<U, V>) => void
}

/**
 * Represents a Stone incoming event.
 * Used only in StoneJS.
 */
export interface StoneIncomingEvent extends IncomingEvent {
  url: URL
  host: string
  body?: unknown
  pathname: string
  method: HttpMethod
  query?: URLSearchParams
  decodedPathname?: string
  readonly isSecure?: boolean
  is: (key: string, value: unknown) => boolean
  isMethod: (method: HttpMethod) => boolean
  getUri: (withDomain: boolean) => string | undefined
  acceptsTypes: (...types: string[]) => boolean | string
  preferredType: (types: string[], defaultType?: string) => string
  setRouteResolver: <U extends IIncomingEvent, V = unknown>(resolver: () => Route<U, V>) => void
}

/**
 * Head meta descriptor.
*/
export interface HTMLMetaDescriptor {
  name?: string
  property?: string
  content: string
}

/**
 * Head link descriptor.
*/
export interface HTMLLinkDescriptor {
  rel: string
  href: string
  type?: string
  media?: string
  [attr: string]: any // optional: allow custom attributes
}

/**
 * Head script descriptor.
*/
export interface HTMLScriptDescriptor {
  src: string
  type?: string
  async?: boolean
  defer?: boolean
  [attr: string]: any
}

/**
 * Head style descriptor.
*/
export interface HTMLStyleDescriptor {
  content: string
  type?: string
  media?: string
}

/**
 * Head context.
*/
export interface HeadContext {
  title?: string
  description?: string
  metas?: HTMLMetaDescriptor[]
  links?: HTMLLinkDescriptor[]
  styles?: HTMLStyleDescriptor[]
  scripts?: HTMLScriptDescriptor[]
}

/**
 * Defines the structure for route matchers.
 */
export type IMatcher<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = (options: MatcherOptions<IncomingEventType, OutgoingResponseType>) => boolean

/**
 * Represents a dispatcher context.
 */
export interface DispatcherContext<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> {
  event: IncomingEventType
  route: Route<IncomingEventType, OutgoingResponseType>
}

/**
 * Represents a class dispatcher.
 */
export type DispacheClass<
IncomingEventType extends IIncomingEvent,
OutgoingResponseType = unknown
> = new (...args: any[]) => IDispacher<IncomingEventType, OutgoingResponseType>

/**
 * Defines the structure for route dispatchers.
 */
export interface IDispacher<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> {
  getName: (
    route: Route<IncomingEventType, OutgoingResponseType>
  ) => Promiseable<string>
  dispatch: (context: DispatcherContext<IncomingEventType, OutgoingResponseType>) => Promiseable<OutgoingResponseType>
}

/**
 * Collection of dispatchers for route handling.
 */
export type IDispatchers<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = Record<DispacherType, DispacheClass<IncomingEventType, OutgoingResponseType>>

/**
 * Represents dispatcher types.
 */
export type DispacherType = 'callable' | 'class' | 'component' | 'redirect'

/**
 * Represents an event handler class.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export type EventHandlerClass<
IncomingEventType extends IIncomingEvent,
OutgoingResponseType = unknown
> = new (...args: any[]) => IEventHandler<IncomingEventType, OutgoingResponseType> | unknown

/**
 * Represents an event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 * @param IncomingEventType - The type representing the incoming event.
 * @param OutgoingResponseType - The type representing the outgoing response.
 * @returns An event handler.
*/
export interface IEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> {
  [k: string]: FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
}

/**
 * Represents a factory event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 * @param resolver - The route resolver.
 * @returns A functional event handler.
*/
export type FactoryEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = (resolver?: DependencyResolver | IContainer) => FunctionalEventHandler<IncomingEventType, OutgoingResponseType>

/**
 * Represents a functional event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 * @param event - The incoming event.
 * @returns The outgoing response.
*/
export type FunctionalEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = (event: IncomingEventType) => Promiseable<OutgoingResponseType>

/**
 * Represents an event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export type EventHandlerType<IncomingEventType extends IIncomingEvent, OutgoingResponseType = unknown> =
  | EventHandlerClass<IncomingEventType, OutgoingResponseType>
  | FactoryEventHandler<IncomingEventType, OutgoingResponseType>
  | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>

/**
 * Represents a meta event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export interface MetaEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> {
  action?: string
  isClass?: boolean
  isFactory?: boolean
  module: EventHandlerType<IncomingEventType, OutgoingResponseType>
}

/**
 * Represents a mixed event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export type MixedEventHandler<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> = MetaEventHandler<IncomingEventType, OutgoingResponseType>
| FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
| MetaComponentEventHandler<IncomingEventType, OutgoingResponseType>
| { action: string }

/**
 * Represents a component event handler class.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export type ComponentEventHandlerClass<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = new (...args: any[]) => IComponentEventHandler<IncomingEventType, OutgoingResponseType>

/**
 * Represents a component event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export interface IComponentEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> {
  render: (options: any) => Promiseable<unknown>
  head?: (options: any) => Promiseable<HeadContext>
  handle?: FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
}

/**
 * Represents a factory component event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export type FactoryComponentEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = (resolver?: DependencyResolver | IContainer) => IComponentEventHandler<IncomingEventType, OutgoingResponseType>

/**
 * Represents a component event handler type.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export type ComponentEventHandlerType<IncomingEventType extends IIncomingEvent, OutgoingResponseType = unknown> =
  | ComponentEventHandlerClass<IncomingEventType, OutgoingResponseType>
  | FactoryComponentEventHandler<IncomingEventType, OutgoingResponseType>

/**
 * Represents a meta component event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export interface MetaComponentEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> {
  lazy?: boolean
  layout?: unknown
  isClass?: boolean
  isFactory?: boolean
  isComponent?: boolean
  module: ComponentEventHandlerType<IncomingEventType, OutgoingResponseType> | LazyComponentEventHandler<IncomingEventType, OutgoingResponseType>
}

/**
 * Represents a lazy component event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export type LazyComponentEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = () => Promise<ComponentEventHandlerType<IncomingEventType, OutgoingResponseType>>

/**
 * Represents a lazy factory component event handler.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export type LazyFactoryComponentEventHandler<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = () => Promise<FactoryComponentEventHandler<IncomingEventType, OutgoingResponseType>>

/**
 * Represents a lazy component event handler class.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export type LazyComponentEventHandlerClass<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> = () => Promise<ComponentEventHandlerClass<IncomingEventType, OutgoingResponseType>>

/**
 * Dependency resolver.
 * Used to resolve dependencies for a given module.
 *
 * @param module - The module to resolve.
 * @returns The resolved module.
 */
export interface DependencyResolver {
  has: (key: BindingKey) => boolean
  resolve: <V extends BindingValue>(key: BindingKey, singleton?: boolean) => V
}

/**
 * Defines a route using a decorator.
 */
export type DecoratorRouteDefinition<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> = Omit<RouteDefinition<IncomingEventType, OutgoingResponseType>, 'path' | 'handler' | 'method' | 'children'>

/**
 * Defines a page route using a decorator.
 */
export type DecoratorPageRouteDefinition<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> = Omit<PageRouteDefinition<IncomingEventType, OutgoingResponseType>, 'path' | 'handler' | 'method' | 'children'>

/**
 * Defines a functional route without path, methods, or children.
 */
export type FunctionalRouteDefinition<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> = Omit<RouteDefinition<IncomingEventType, OutgoingResponseType>, 'path' | 'methods' | 'method' | 'children'>

/**
 * Defines a functional page route without path, methods, or children.
 */
export type FunctionalPageRouteDefinition<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> = Omit<PageRouteDefinition<IncomingEventType, OutgoingResponseType>, 'path' | 'methods' | 'method' | 'children'>

/**
 * Defines a decorator route group without fallback, alias, or methods.
 */
export type DecoratorGroupRouteDefinition<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> = Omit<DecoratorRouteDefinition<IncomingEventType, OutgoingResponseType>, 'fallback' | 'alias' | 'methods'>

/**
 * Defines a functional route group with a required path.
 */
export type FunctionalRouteGroupDefinition<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> = Omit<FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>, 'handler' | 'fallback' | 'alias'> & { path: string }

/**
 * Represents a page route definition.
 */
export interface PageRouteDefinition<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> extends RouteDefinition<IncomingEventType, OutgoingResponseType> {
  methods?: never
}

/**
 * Represents the route protocol Policy
 */
export type ProtocolPolicy = 'inherit' | 'force-http' | 'force-https'

/**
 * Represents the structure of a route definition.
 */
export interface RouteDefinition<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> {
  name?: string
  strict?: boolean
  fallback?: boolean
  method?: HttpMethod
  methods?: HttpMethod[]
  path: string | string[]
  domain?: string | string[]
  isInternalHeader?: boolean
  protocol?: string | string[]
  protocolPolicy?: ProtocolPolicy
  defaults?: Record<string, unknown>
  rules?: Record<string, RegExp | string>
  bindings?: Record<string, IBoundModel | BindingResolver | string>
  handler?: MixedEventHandler<IncomingEventType, OutgoingResponseType>
  middleware?: Array<MixedPipe<IncomingEventType, OutgoingResponseType>>
  children?: Array<RouteDefinition<IncomingEventType, OutgoingResponseType>>
  excludeMiddleware?: Array<PipeType<IncomingEventType, OutgoingResponseType>>
  redirect?: string | Record<string, unknown> | RouteDefinitionRedirect<IncomingEventType>
  [k: string]: unknown
}

/**
 * Represents a route definition redirect function.
 */
export type RouteDefinitionRedirect<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> = (route: Route<IncomingEventType, OutgoingResponseType>, event: IncomingEventType) => Promiseable<string | Record<string, unknown>>

/**
 * Options for configuring the router.
 */
export interface RouterOptions<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> {
  /** Base path prefix applied to all routes. */
  prefix?: string

  /** Enables strict path matching. */
  strict?: boolean

  /** Protocol Policy for all routes. */
  protocolPolicy?: ProtocolPolicy

  /** Maximum depth allowed in route definitions. */
  maxDepth: number

  /** Maximum request URI length (characters) accepted before matching. Defaults to 2048. */
  maxUriLength?: number

  /** Skips middleware execution for specific routes. */
  skipMiddleware?: boolean

  /** Custom event emitter for handling application events. */
  eventEmitter?: IEventEmitter

  /** Custom rules for route matching, defined as regular expressions. */
  rules?: Record<string, RegExp>

  /** Default parameter values for routes. */
  defaults?: Record<string, unknown>

  /** Resolver used to resolve dependencies. */
  dependencyResolver?: DependencyResolver

  /** Custom function bindings for specific route behaviors. */
  bindings?: Record<string, IBoundModel | BindingResolver>

  /** List of matchers used to validate and match routes. */
  matchers: Array<IMatcher<IncomingEventType, OutgoingResponseType>>

  /** Dispatchers used for handling callable and controller-based routes. */
  dispatchers: IDispatchers<IncomingEventType, OutgoingResponseType>

  /** Array of route definitions to be included in the router. */
  definitions: Array<RouteDefinition<IncomingEventType, OutgoingResponseType>>

  /** List of middleware applied during route resolution. */
  middleware?: Array<MixedPipe<IncomingEventType, OutgoingResponseType>>
}

/**
 * Options for navigation.
 */
export interface NavigateOptions {
  name: string
  hash?: string
  query?: Record<string, string | number | boolean>
  params?: Record<string, string | number | boolean>
}

/**
 * Options for generating routes.
 */
export interface GenerateOptions extends NavigateOptions {
  protocol?: string
  withDomain?: boolean
}

/**
 * Event emitter for handling application events.
 */
export interface IEventEmitter {
  emit: ((event: Event) => Promiseable<void>) &
  ((event: CustomEvent) => Promiseable<void>) &
  ((event: string, ...args: unknown[]) => Promiseable<void>)
  on: ((event: Event, listener: FunctionalEventListener) => void) &
  ((event: string, listener: FunctionalEventListener) => void) &
  ((event: CustomEvent, listener: FunctionalEventListener) => void)
  off: ((event: Event, listener: FunctionalEventListener) => void) &
  ((event: string, listener: FunctionalEventListener) => void) &
  ((event: CustomEvent, listener: FunctionalEventListener) => void)
}

/**
 * Options for configuring a regular expression pattern.
 */
export interface RegexPatternOptions {
  path: string
  domain?: string
  strict?: boolean
  defaults?: Record<string, unknown>
  rules?: Record<string, RegExp | string>
}

/**
 * Defines route segment constraints.
 */
export interface RouteSegmentConstraint {
  param: string
  match: string
  alias: string
  prefix: string
  suffix: string
  default: unknown
  optional: boolean
  quantifier: string
  rule: RegExp | string
}

/**
 * Represents the yargs argument vector.
 */
export interface IArgv {
  positional: (name: string, options: { type: string, choices: string[], desc: string }) => IArgv
}

/**
 * Command options.
 *
 * Represents the configuration options for a CLI command.
 */
export interface CommandOptions {
  name: string
  desc?: string
  args?: string | string[]
  alias?: string | string[]
  options?: (yargs: IArgv) => IArgv
}

/**
 * Represents CommandHandlerClass.
 */
export type CommandHandlerClass<
  W extends IIncomingEvent = IIncomingEvent,
  X = unknown
> = new (...args: any[]) => ICommandHandler<W, X>

/**
 * Represents the CommandHandler function for the Node Cli Adapter.
 */
export interface ICommandHandler<
  W extends IIncomingEvent = IIncomingEvent,
  X = unknown
> {
  handle: FunctionalEventHandler<W, X>
  match?: (event: IncomingEvent) => boolean
}

/**
 * Represents MetaCommandHandler.
 */
export interface MetaCommandHandler<
  W extends IIncomingEvent = IIncomingEvent,
  X = unknown
> {
  isClass?: boolean
  isFactory?: boolean
  options: CommandOptions
  module: CommandHandlerClass<W, X>
}
