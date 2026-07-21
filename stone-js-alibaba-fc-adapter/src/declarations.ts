import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, IncomingEvent, IncomingEventOptions, OutgoingResponse, RawResponseOptions } from '@stone-js/core'

/**
 * Represents a generic raw response as a key-value pair.
 */
export type RawResponse = Record<string, unknown>

/**
 * The event payload delivered to a non-HTTP Alibaba FC function.
 *
 * The shape depends on the trigger, the OSS object event, the MNS/queue message, the Timer payload,
 * the EventBridge event, etc. FC passes it as a `Buffer` (or a string), which the handler receives
 * and the normalizer exposes on the event metadata. Kept generic.
 */
export type AlibabaFcEvent = Buffer | string | Record<string, unknown>

/**
 * The Alibaba FC invocation context (`context` argument).
 *
 * Carries `requestId`, `function`, `service`, `credentials`, the region and the logger.
 */
export type AlibabaFcContext = Record<string, unknown>

/**
 * The Alibaba FC event handler: `(event, context) => Promise<...>`, the signature the FC event
 * (non-HTTP) trigger invokes.
 *
 * @template RawResponseType - The type of the response returned by the handler.
 */
export type AlibabaFcEventHandlerFunction<RawResponseType = RawResponse> = (
  rawEvent: AlibabaFcEvent,
  context: AlibabaFcContext
) => Promise<RawResponseType>

/**
 * Represents the response builder for the Alibaba FC Adapter.
 */
export type AlibabaFcAdapterResponseBuilder = IAdapterEventBuilder<RawResponseOptions, RawResponseWrapper>

/**
 * Represents the context for the Alibaba FC Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties
 * specific to generic Alibaba FC events.
 */
export interface AlibabaFcAdapterContext extends AdapterContext<
AlibabaFcEvent,
RawResponse,
AlibabaFcContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /**
   * The raw response associated with the current context.
   */
  rawResponse: RawResponse
}
