import { RawHttpResponseWrapper } from './RawHttpResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, RawResponseOptions } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * Represents a raw HTTP response, extending from `RawHttpResponseOptions`.
 */
export type RawHttpResponse = RawHttpResponseOptions

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
export type AwsLambdaEventHandlerFunction<RawResponseType = RawHttpResponse> = (
  rawEvent: AwsLambdaHttpEvent,
  context: AwsLambdaContext
) => Promise<RawResponseType>

/**
 * Represents the response builder for the AWS Lambda http Adapter.
 */
export type AwsLambdaHttpAdapterResponseBuilder = IAdapterEventBuilder<RawHttpResponseOptions, RawHttpResponseWrapper>

/**
 * Represents the structure of an AWS Lambda HTTP event across every supported trigger:
 * API Gateway REST (payload v1), API Gateway HTTP API and Lambda Function URLs (payload v2),
 * and Application Load Balancer (ALB). Every field is optional because each trigger populates a
 * different subset; use {@link normalizeHttpEvent} to reduce it to a canonical shape.
 */
export interface AwsLambdaHttpEvent extends Record<string, unknown> {
  /** Payload format version, e.g. `'1.0'` (REST) or `'2.0'` (HTTP API / Function URL). */
  version?: string

  /** The path of the HTTP request (v1/ALB). */
  path?: string

  /** The body of the HTTP request. */
  body?: unknown

  /** The encoding format of the body, such as `base64`. */
  encoding?: string

  /** The raw path of the HTTP request (v2). */
  rawPath?: string

  /** The raw query string, without leading `?` (v2). */
  rawQueryString?: string

  /** Indicates whether the request body is base64-encoded. */
  isBase64Encoded?: boolean

  /** The headers of the HTTP request as key-value pairs (may be null/absent on some triggers). */
  headers?: Record<string, string> | null

  /** Multi-value headers (v1 / ALB with multi-value enabled). */
  multiValueHeaders?: Record<string, string[]>

  /** Raw cookie strings (v2 / Function URLs). */
  cookies?: string[]

  /** The HTTP method of the request (v1/ALB). */
  httpMethod?: string

  /** The single-value query string parameters. */
  queryStringParameters?: Record<string, string> | null

  /** The multi-value query string parameters (v1 / ALB with multi-value enabled). */
  multiValueQueryStringParameters?: Record<string, string[]>

  /** The request context, whose shape varies by trigger. */
  requestContext?: {
    elb?: unknown
    identity?: {
      sourceIp?: string
    }
    httpMethod?: string
    http?: {
      path?: string
      method?: string
      sourceIp?: string
    }
  }
}

/**
 * Represents the context for the AWS Lambda HTTP Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties specific
 * to HTTP events in AWS Lambda.
 */
export interface AwsLambdaHttpAdapterContext extends AdapterContext<
AwsLambdaHttpEvent,
RawHttpResponse,
AwsLambdaContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {
  /**
   * The raw HTTP response associated with the current context.
   */
  rawResponse: RawHttpResponse
}

/**
 * Represents options for configuring a raw HTTP response.
 *
 * Extends the `RawResponseOptions` interface to include additional properties
 * for managing response content, headers, status codes, and streaming files.
 */
export interface RawHttpResponseOptions extends RawResponseOptions {
  /**
   * The body of the HTTP response. Can be of any type, including strings, objects, or buffers.
   */
  body?: unknown

  /**
   * The HTTP status code of the response (e.g., `200`, `404`).
   */
  statusCode: number

  /**
   * The status message accompanying the HTTP status code (e.g., `OK`, `Not Found`).
   */
  statusMessage?: string

  /**
   * Headers to include in the HTTP response. May be a `Headers` instance (from http-core) or a
   * plain record; the wrapper normalizes it and lifts out `Set-Cookie`.
   */
  headers?: Headers | Record<string, string>

  /**
   * Multi-value response headers (used by API Gateway REST v1 / ALB to emit multiple `Set-Cookie`).
   */
  multiValueHeaders?: Record<string, string[]>

  /**
   * Response cookies as raw `Set-Cookie` strings (used by API Gateway HTTP API v2 / Function URLs).
   */
  cookies?: string[]

  /**
   * The detected trigger family, used to choose the correct multi-cookie response shape.
   */
  version?: 'v1' | 'v2' | 'alb'

  /**
   * The encoding format of the response body, such as `base64`.
   */
  isBase64Encoded?: boolean
}
