import { OutgoingHttpResponse } from '../OutgoingHttpResponse'
import { HandleCorsMiddleware } from '../middleware/HandleCorsMiddleware'
import { IncomingHttpEvent, IncomingHttpEventOptions } from '../IncomingHttpEvent'
import { AdapterContext, AdapterHookListenerContext, isEmpty, isObjectLikeModule } from '@stone-js/core'

/**
 * Defines the adapter context type for handling HTTP events in a Node.js server or AWS Lambda function.
 */
export type AdapterContextType = AdapterContext<
any,
any,
any,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
>

/**
 * Ensure CORS headers at the "onBuildingRawResponse" stage.
 *
 * This adapter hook ensures that CORS headers are applied even when the middleware is not executed.
 * It is useful for scenarios where an error occurs before reaching the middleware chain
 * or when a request bypasses the intended processing.
 *
 * @param options - The adapter hook listener context containing the blueprint and context.
 */
export const EnsureCorsHeadersHook = async ({
  blueprint,
  context
}: AdapterHookListenerContext<AdapterContextType>): Promise<void> => {
  if (isEmpty(context)) {
    return
  }

  // Ensure `incomingEvent` is initialized from raw event if not already set
  context.incomingEvent ??= makeIncomingEventFromRawEvent(context.rawEvent)

  // Only apply CORS handling to HTTP events
  if (!(context.incomingEvent instanceof IncomingHttpEvent)) {
    return
  }

  // Apply CORS handling, using an existing response or creating a default response if none exists
  context.outgoingResponse = await (new HandleCorsMiddleware({ blueprint })).handle(
    context.incomingEvent,
    () => OutgoingHttpResponse.create({ statusCode: 500 })
  )

  // Update the raw response with CORS headers and appropriate status code
  context.rawResponseBuilder
    .add('headers', getMergedHeaders(context))
    .addIf('statusCode', context.outgoingResponse.statusCode)
}

/**
 * Constructs an `IncomingHttpEvent` from a raw event object.
 *
 * This function extracts necessary HTTP properties from various event formats,
 * ensuring compatibility with both Node.js HTTP servers, AWS Lambda events and so on.
 *
 * @param rawEvent - The raw event containing HTTP request details.
 * @returns An `IncomingHttpEvent` instance.
 */
const makeIncomingEventFromRawEvent = (rawEvent: any): IncomingHttpEvent => {
  return IncomingHttpEvent.create({
    source: {} as any,
    ip: rawEvent.ip ?? '127.0.0.1',
    headers: rawEvent.headers ?? {},
    url: new URL(
      rawEvent.url ?? rawEvent.path ?? rawEvent.rawPath ?? '/',
      'http://localhost'
    ),
    method: rawEvent.method ??
      rawEvent.httpMethod ??
      rawEvent.requestContext?.httpMethod ??
      rawEvent.requestContext?.http?.method ??
      'GET'
  })
}

/**
 * Merges headers from the outgoing response and raw response builder into the raw response builder.
 *
 * Ensures headers are unique, prioritizing those from the outgoing response.
 *
 * @param context - The adapter context containing the outgoing response and raw response builder.
 * @returns The merged headers.
 */
const getMergedHeaders = (context: AdapterContextType): Headers => {
  // Add outgoing response headers first (lower priority)
  let merged = addHeaders(new Map<string, string>(), context.outgoingResponse?.headers)
  // Add raw headers, overwriting duplicates
  merged = addHeaders(merged, context.rawResponseBuilder.options.headers)

  return new Headers(Array.from(merged.entries()))
}

/**
 * Add headers to a map, ensuring that values are strings.
 *
 * @param merged - The map of headers to add to.
 * @param headers - The headers to add.
 * @returns The updated map of headers.
 */
const addHeaders = (merged: Map<string, string>, headers?: unknown): Map<string, string> => {
  if (headers instanceof Headers) {
    headers.forEach((value, key) => merged.set(key, value))
  } else if (headers instanceof Map) {
    headers.forEach((value, key) => {
      merged.set(key, Array.isArray(value) ? value.join(', ') : value.toString())
    })
  } else if (isObjectLikeModule<Record<string, string>>(headers)) {
    Object.entries(headers).forEach(([key, value]) => {
      merged.set(key, Array.isArray(value) ? value.join(', ') : value.toString())
    })
  }

  return merged
}
