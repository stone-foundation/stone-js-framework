import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, IncomingEvent, IncomingEventOptions, OutgoingResponse, RawResponseOptions } from '@stone-js/core'

/**
 * Represents a generic raw response as a key-value pair.
 */
export type RawResponse = Record<string, unknown>

/**
 * The trigger input delivered to a non-HTTP Azure Function.
 *
 * The shape depends on the binding, the Queue Storage message, the Service Bus message, the Event
 * Grid/Event Hub event, the Timer info, the Blob, etc. It is kept generic; the handler inspects the
 * event metadata (which also carries `context.triggerMetadata`).
 */
export type AzureFunctionsEvent = unknown

/**
 * The Azure Functions invocation context (`@azure/functions` `InvocationContext`).
 *
 * Carries the logger, `invocationId`, and `triggerMetadata` (binding-specific metadata such as the
 * message id, dequeue count, delivery count, …).
 */
export type AzureFunctionsContext = Record<string, unknown>

/**
 * The Azure Functions trigger handler: `(triggerInput, invocationContext) => Promise<...>`, the
 * signature `app.storageQueue(...)`, `app.serviceBusQueue(...)`, `app.timer(...)`, … expect from
 * `@azure/functions` v4.
 *
 * @template RawResponseType - The type of the response returned by the handler.
 */
export type AzureFunctionsEventHandlerFunction<RawResponseType = RawResponse> = (
  rawEvent: AzureFunctionsEvent,
  context: AzureFunctionsContext
) => Promise<RawResponseType>

/**
 * Represents the response builder for the Azure Functions Adapter.
 */
export type AzureFunctionsAdapterResponseBuilder = IAdapterEventBuilder<RawResponseOptions, RawResponseWrapper>

/**
 * Represents the context for the Azure Functions Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties
 * specific to generic Azure Functions events.
 */
export interface AzureFunctionsAdapterContext extends AdapterContext<
AzureFunctionsEvent,
RawResponse,
AzureFunctionsContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /**
   * The raw response associated with the current context.
   */
  rawResponse: RawResponse
}
