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
   * The class type of the adapter.
   * This is used to identify the category of the adapter.
   */
  variant: 'server' | 'browser' | 'console'

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
