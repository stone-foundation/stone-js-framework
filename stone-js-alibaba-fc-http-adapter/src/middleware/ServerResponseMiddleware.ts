import statuses from 'statuses'
import { NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { AlibabaFcHttpAdapterError } from '../errors/AlibabaFcHttpAdapterError'
import { AlibabaFcHttpAdapterContext, AlibabaFcHttpAdapterResponseBuilder } from '../declarations'

/**
 * Maps the Stone.js `OutgoingHttpResponse` onto the Web `Response` options.
 *
 * It lifts the status, headers and body, and emits every `Set-Cookie` as a separate value (never
 * folded). `HEAD` responses carry no body. Binary file responses are deferred to a later release;
 * JSON/text/bytes bodies (the overwhelming majority) are handled here.
 */
export class ServerResponseMiddleware {
  /**
   * @param context - The adapter context.
   * @param next - The next middleware.
   * @returns The raw-response builder.
   * @throws {AlibabaFcHttpAdapterError} When the context is missing required components.
   */
  async handle (context: AlibabaFcHttpAdapterContext, next: NextMiddleware<AlibabaFcHttpAdapterContext, AlibabaFcHttpAdapterResponseBuilder>): Promise<AlibabaFcHttpAdapterResponseBuilder> {
    const rawResponseBuilder = await next(context)

    if (context.incomingEvent === undefined || context.outgoingResponse === undefined || rawResponseBuilder?.add === undefined) {
      throw new AlibabaFcHttpAdapterError('The context is missing required components.')
    }

    const response = context.outgoingResponse
    const statusCode = response.statusCode ?? 500
    const headers = response.headers
    const cookies = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : []

    const headerRecord: Record<string, string> = {}
    headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') { headerRecord[key] = value }
    })

    rawResponseBuilder
      .add('status', statusCode)
      .add('statusText', response.statusMessage ?? statuses.message[statusCode])
      .add('headers', headerRecord)
      .add('cookies', cookies)

    if (!context.incomingEvent.isMethod('HEAD')) {
      rawResponseBuilder.add('body', this.normalizeBody(response.content))
    }

    return rawResponseBuilder
  }

  /**
   * Coerces the prepared response content into a Web `BodyInit`.
   *
   * @param content - The prepared response content.
   * @returns A body suitable for `new Response(...)`.
   */
  private normalizeBody (content: unknown): BodyInit | null {
    if (content === undefined || content === null) { return null }
    if (typeof content === 'string') { return content }
    if (content instanceof Uint8Array || content instanceof ArrayBuffer) { return content as BodyInit }
    return JSON.stringify(content)
  }
}

/**
 * Meta middleware for processing server responses.
 */
export const MetaServerResponseMiddleware: MetaMiddleware<any, any> = { module: ServerResponseMiddleware, isClass: true }
