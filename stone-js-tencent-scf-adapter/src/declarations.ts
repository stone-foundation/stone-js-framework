import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, IncomingEvent, IncomingEventOptions, OutgoingResponse, RawResponseOptions } from '@stone-js/core'

/**
 * Represents a generic raw response as a key-value pair.
 */
export type RawResponse = Record<string, unknown>

/**
 * The event payload delivered to a non-HTTP Tencent SCF function.
 *
 * The shape depends on the trigger, the COS object event, the CMQ/TDMQ message, the Timer payload,
 * the CKafka records, etc. Kept generic; the handler inspects the event metadata.
 */
export type TencentScfEvent = Record<string, unknown>

/**
 * The Tencent SCF invocation context (`context` argument).
 *
 * Carries `request_id`, `function_name`, `namespace`, the credentials and the logger.
 */
export type TencentScfContext = Record<string, unknown>

/**
 * The Tencent SCF event handler: `(event, context) => Promise<...>`, the signature the SCF event
 * (non-HTTP) trigger invokes.
 *
 * @template RawResponseType - The type of the response returned by the handler.
 */
export type TencentScfEventHandlerFunction<RawResponseType = RawResponse> = (
  rawEvent: TencentScfEvent,
  context: TencentScfContext
) => Promise<RawResponseType>

/**
 * Represents the response builder for the Tencent SCF Adapter.
 */
export type TencentScfAdapterResponseBuilder = IAdapterEventBuilder<RawResponseOptions, RawResponseWrapper>

/**
 * Represents the context for the Tencent SCF Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties
 * specific to generic Tencent SCF events.
 */
export interface TencentScfAdapterContext extends AdapterContext<
TencentScfEvent,
RawResponse,
TencentScfContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /**
   * The raw response associated with the current context.
   */
  rawResponse: RawResponse
}
