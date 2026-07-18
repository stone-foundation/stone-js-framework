import { MixedPipe } from '@stone-js/pipeline'
import { defaultResponseResolver } from '../resolvers'
import { IncomingEvent } from '../events/IncomingEvent'
import { OutgoingResponse } from '../events/OutgoingResponse'
import { ResponseResolver, MetaErrorHandler, MixedEventHandler } from '../declarations'

/**
 * Kernel options.
 *
 * This interface defines the configuration for kernel-level options.
 */
export interface KernelConfig<
TEvent extends IncomingEvent = IncomingEvent,
UResponse extends OutgoingResponse = OutgoingResponse
> {
  /**
   * A flag indicating whether to skip middleware processing.
   * This flag can be used to bypass middleware processing in the kernel.
   */
  skipMiddleware?: boolean

  /**
   * Middleware configuration options for different stages of the kernel's lifecycle.
   */
  middleware?: Array<MixedPipe<TEvent, UResponse>>

  /**
   * The main event handler for the application.
   * Every Stone.js application must have a main event handler.
   */
  eventHandler?: MixedEventHandler<TEvent, UResponse | unknown>

  /**
   * Error handlers used to manage and report errors that occur within the kernel.
   * These handlers can be used to customize error handling behavior and logging.
   */
  errorHandlers?: Record<string, MetaErrorHandler<TEvent, UResponse | unknown>>

  /**
   * The response resolver, used to create instances of the response object.
   */
  responseResolver?: ResponseResolver<UResponse>
}

/**
 * Global app-level settings for all adapters.
 *
 * This object defines the kernel-level settings for middleware, which apply to all adapters.
 * It allows you to configure middleware behavior, including event processing, response handling,
 * and termination processing.
 */
export const kernel: KernelConfig = {
  middleware: [],
  responseResolver: defaultResponseResolver
}
