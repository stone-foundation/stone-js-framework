import { IncomingHttpEvent } from '../IncomingHttpEvent'
import { OutgoingHttpResponse } from '../OutgoingHttpResponse'
import { NextMiddleware, MetaMiddleware } from '@stone-js/core'
import { HTTP_FOUND, HTTP_OK } from '../constants'
import { DeclaredResponse, DeclaredResponseType, HeadersType } from '../declarations'
import {
  createHttpResponse, fileHttpResponse, htmlHttpResponse, jsonHttpResponse,
  jsonpHttpResponse, noContentHttpResponse
} from '../HttpResponse'

/**
 * Build the response a route declared, from whatever its handler returned.
 *
 * A route already says what it is: its path, its method, what it accepts, what it answers with. Saying
 * the last part on the route rather than on the method keeps the handler about the domain, and keeps one
 * place to read when you want to know what an endpoint returns.
 *
 * ```ts
 * @Get('/tasks/:id', { response: { type: 'json', status: 200 } })
 * show (event: IncomingHttpEvent): Task { return this.tasks.find(event.get('id')) }
 * ```
 *
 * A method decorator still wins. `@JsonHttpResponse(201)` produces the response itself, and something
 * more specific than a route option must not be overruled by it: when the handler has already answered
 * with a response, this steps aside entirely. The two forms are a choice, not a conflict.
 */
export class RouteResponseMiddleware {
  /**
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The outgoing response.
   */
  async handle (
    event: IncomingHttpEvent,
    next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>
  ): Promise<OutgoingHttpResponse> {
    const result = await next(event)
    const declared = event.getRoute?.()?.getOption?.<DeclaredResponse>('response')

    if (declared === undefined || this.isResponse(result)) { return result }

    return this.build(result, declared) as unknown as OutgoingHttpResponse
  }

  /**
   * Whether the handler already answered with a response of its own.
   *
   * @param value - What the handler returned.
   * @returns True when it is already a response.
   */
  private isResponse (value: unknown): boolean {
    return typeof (value as { setContent?: unknown } | undefined)?.setContent === 'function'
  }

  /**
   * Build the declared response around a payload.
   *
   * @param content - What the handler returned.
   * @param declared - What the route said it answers with.
   * @returns The response.
   */
  private build (content: unknown, declared: DeclaredResponse): OutgoingHttpResponse {
    const headers: HeadersType = declared.headers ?? {}
    const type: DeclaredResponseType = declared.type ?? 'json'

    switch (type) {
      case 'no-content':
        return noContentHttpResponse(headers)
      case 'html':
        return htmlHttpResponse(String(content), declared.status ?? HTTP_OK, headers)
      case 'jsonp':
        return jsonpHttpResponse(content, declared.status ?? HTTP_OK, headers)
      case 'file':
        return fileHttpResponse(String(content), declared.status ?? HTTP_OK, headers)
      case 'redirect':
        // A redirect's payload is its destination, so the status is the one that carries meaning:
        // `302` unless the route says which kind of redirect it means.
        return createHttpResponse(content, declared.status ?? HTTP_FOUND, { ...headers, Location: String(content) })
      case 'text':
        return createHttpResponse(String(content), declared.status ?? HTTP_OK, { 'Content-Type': 'text/plain', ...headers })
      default:
        return jsonHttpResponse(content, declared.status ?? HTTP_OK, headers)
    }
  }
}

/**
 * Meta middleware for a route's declared response.
 *
 * On `stone.router.middleware`, outside every other route middleware: it builds the final response, so
 * it must see the payload after a resource has shaped it and after a guard has had its say.
 */
export const MetaRouteResponseMiddleware: MetaMiddleware<any, any> = {
  module: RouteResponseMiddleware,
  isClass: true,
  priority: 2
}
