import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, IncomingEvent, IncomingEventOptions, OutgoingResponse, RawResponseOptions } from '@stone-js/core'

/**
 * Represents a generic raw response as a key-value pair.
 */
export type RawResponse = Record<string, unknown>

/**
 * Represents a GCP Cloud Functions event (a CloudEvent).
 *
 * 2nd-gen Cloud Functions deliver every non-HTTP trigger (Pub/Sub, Cloud Storage, Eventarc,
 * Firestore, …) as a CloudEvent. The well-known envelope fields are typed here; the trigger-specific
 * payload lives on `data`, and the index signature keeps any extension attributes accessible.
 */
export interface GcpCloudFunctionsEvent extends Record<string, unknown> {
  /** Identifies the event (unique per source). */
  id?: string
  /** Identifies the context in which the event happened. */
  source?: string
  /** The event type, e.g. `google.cloud.pubsub.topic.v1.messagePublished`. */
  type?: string
  /** The subject of the event in the context of the source. */
  subject?: string
  /** RFC 3339 timestamp of when the event occurred. */
  time?: string
  /** The CloudEvents spec version, e.g. `1.0`. */
  specversion?: string
  /** The trigger-specific payload. */
  data?: unknown
}

/**
 * Represents the GCP Cloud Functions execution context.
 *
 * 2nd-gen CloudEvent functions receive no separate context argument (the metadata is on the event),
 * so this is optional and only present for 1st-gen background functions `(data, context)`.
 */
export type GcpCloudFunctionsContext = Record<string, unknown>

/**
 * Represents a GCP Cloud Functions event handler function.
 *
 * This is the value returned by `run()`, registered with the Functions Framework:
 * `functions.cloudEvent('stone', await adapter.run())`.
 *
 * @template RawResponseType - The type of the response returned by the handler.
 * @param rawEvent - The CloudEvent received by the function.
 * @param executionContext - The 1st-gen background context, if any (absent for CloudEvents).
 * @returns A promise resolving to the response of type `RawResponseType`.
 */
export type GcpCloudFunctionsEventHandlerFunction<RawResponseType = RawResponse> = (
  rawEvent: GcpCloudFunctionsEvent,
  executionContext?: GcpCloudFunctionsContext
) => Promise<RawResponseType>

/**
 * Represents the response builder for the GCP Cloud Functions Adapter.
 */
export type GcpCloudFunctionsAdapterResponseBuilder = IAdapterEventBuilder<RawResponseOptions, RawResponseWrapper>

/**
 * Represents the context for the GCP Cloud Functions Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties
 * specific to generic GCP Cloud Functions events.
 */
export interface GcpCloudFunctionsAdapterContext extends AdapterContext<
GcpCloudFunctionsEvent,
RawResponse,
GcpCloudFunctionsContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /**
   * The raw response associated with the current context.
   */
  rawResponse: RawResponse
}
