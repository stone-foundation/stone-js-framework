import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, IncomingEvent, IncomingEventOptions, OutgoingResponse, RawResponseOptions } from '@stone-js/core'

/**
 * Represents a generic raw response as a key-value pair.
 */
export type RawResponse = Record<string, unknown>

/**
 * Represents a generic AWS Lambda event as a key-value pair.
 */
export type AwsLambdaEvent = Record<string, unknown>

/**
 * Represents the AWS Lambda execution context as a key-value pair.
 */
export type AwsLambdaContext = Record<string, unknown>

/**
 * Represents an AWS Lambda event handler function.
 *
 * @template RawResponseType - The type of the response returned by the handler.
 * @param rawEvent - The raw event received by the AWS Lambda function.
 * @param context - The AWS Lambda execution context.
 * @returns A promise resolving to the response of type `RawResponseType`.
 */
export type AwsLambdaEventHandlerFunction<RawResponseType = RawResponse> = (
  rawEvent: AwsLambdaEvent,
  context: AwsLambdaContext
) => Promise<RawResponseType>

/**
 * Represents the response builder for the AWS Lambda Adapter.
 */
export type AwsLambdaAdapterResponseBuilder = IAdapterEventBuilder<RawResponseOptions, RawResponseWrapper>

/**
 * Represents the context for the AWS Lambda Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties
 * specific to generic AWS Lambda events.
 */
export interface AwsLambdaAdapterContext extends AdapterContext<
AwsLambdaEvent,
RawResponse,
AwsLambdaContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /**
   * The raw response associated with the current context.
   */
  rawResponse: RawResponse
}
