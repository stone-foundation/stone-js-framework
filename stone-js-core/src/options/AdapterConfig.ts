import {
  AdapterContext,
  AdapterResolver,
  AdapterMixedPipeType,
  MetaAdapterErrorHandler,
  AdapterEventHandlerResolver
} from '../declarations'
import { OutgoingResponse } from '../events/OutgoingResponse'
import { IncomingEvent, IncomingEventOptions } from '../events/IncomingEvent'

/**
 * The category of platform an adapter integrates.
 *
 * The four known ones are named so editors can complete them, and any other string is
 * accepted: the core must not hold a closed list of the platforms that will ever exist.
 */
export type AdapterVariant = 'server' | 'browser' | 'console' | 'native' | (string & {})

/**
 * AdapterConfig Interface.
 *
 * This interface defines the configuration options for an adapter within the Stone.js framework.
 * It includes settings for the adapter's alias, resolver, middleware, and hooks, among other properties.
 * The AdapterConfig allows developers to manage how the adapter behaves and how it integrates with the application.
 */
export interface AdapterConfig<
  RawEventType = any,
  RawResponseType = any,
  ExecutionContextType = any,
  IncomingEventType extends IncomingEvent = IncomingEvent,
  IncomingEventOptionsType extends IncomingEventOptions = IncomingEventOptions,
  OutgoingResponseType extends OutgoingResponse = OutgoingResponse,
> {
  /**
   * The platform identifier for the adapter.
   * This is used to categorize the adapter based on the environment or technology it supports.
   */
  platform: string

  /**
   * The category of platform this adapter integrates, for grouping and reporting.
   *
   * Open by design: the core cannot hold the list of platforms that will ever exist, and a
   * closed union would mean every new one needs a core release before it can name itself.
   * The known categories are listed for completion; nothing in the framework branches on
   * this value, which is what makes widening it safe. Match on `platform` instead when you
   * need to identify a specific integration.
   */
  variant: AdapterVariant

  /**
   * The class type resolver used to create instances of the adapter.
   */
  resolver: AdapterResolver

  /**
   * The middleware used for processing incoming or outgoing data in the adapter.
   * Middleware can modify or handle events at different stages of the adapter's lifecycle.
   */
  middleware: Array<AdapterMixedPipeType<AdapterContext<
  RawEventType,
  RawResponseType,
  ExecutionContextType,
  IncomingEventType,
  IncomingEventOptionsType,
  OutgoingResponseType
  >, RawResponseType>>

  /**
   * The event handler resolver used to create instances of the event handler.
   */
  eventHandlerResolver: AdapterEventHandlerResolver<IncomingEventType, OutgoingResponseType>

  /**
   * Error handlers used to manage and report errors that occur within the adapter.
   * These handlers can be used to customize error handling behavior and logging.
   */
  errorHandlers: Record<string, MetaAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>

  /**
   * The alias name for the adapter.
   * This is a unique identifier used to reference the adapter.
   * Optional property.
   */
  alias?: string

  /**
   * The current status identifier for the adapter.
   * Used to indicate if this adapter instance is active or currently in use.
   * Optional property.
   */
  current?: boolean

  /**
   * Defines whether this adapter is the default adapter used by the application.
   * Optional property.
   */
  default?: boolean
}

/**
 * Common adapters settings.
 *
 * This array defines the collection of adapters and their respective configurations.
 */
export const adapters: AdapterConfig[] = []
