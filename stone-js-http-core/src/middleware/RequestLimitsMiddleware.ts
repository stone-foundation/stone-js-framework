import { HttpError } from '../errors/HttpError'
import { IncomingHttpEvent } from '../IncomingHttpEvent'
import { OutgoingHttpResponse } from '../OutgoingHttpResponse'
import { IBlueprint, NextMiddleware } from '@stone-js/core'

/**
 * Kernel middleware that rejects requests carrying too many headers or cookies.
 *
 * Defence-in-depth against denial-of-service. The Node HTTP server already bounds header
 * count/size, but that protection is unavailable on serverless runtimes (AWS Lambda, edge),
 * so this adapter-agnostic guard enforces the limits uniformly wherever an `IncomingHttpEvent`
 * is processed. Limits come from `stone.http.limits` (`0` disables a given check).
 *
 * @template TEvent - The incoming HTTP event type.
 * @template UResponse - The outgoing HTTP response type.
 */
export class RequestLimitsMiddleware {
  private readonly blueprint: IBlueprint

  /**
   * Create a RequestLimitsMiddleware.
   *
   * @param blueprint - The configuration blueprint.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Reject over-sized requests, otherwise continue the pipeline.
   *
   * @param event - The incoming HTTP event.
   * @param next - The next middleware.
   * @returns The outgoing HTTP response.
   * @throws {HttpError} 431 when the header or cookie count exceeds the configured limit.
   */
  async handle (event: IncomingHttpEvent, next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>): Promise<OutgoingHttpResponse> {
    const maxHeaders = this.blueprint.get<number>('stone.http.limits.maxHeaders', 0)
    const maxCookies = this.blueprint.get<number>('stone.http.limits.maxCookies', 0)

    if (maxHeaders > 0) {
      const headerCount = Object.keys(event.headers).length
      if (headerCount > maxHeaders) {
        throw new HttpError(`Too many request headers (${headerCount} > ${maxHeaders}).`, 431)
      }
    }

    if (maxCookies > 0) {
      const cookieCount = Object.keys(event.cookies.all()).length
      if (cookieCount > maxCookies) {
        throw new HttpError(`Too many cookies (${cookieCount} > ${maxCookies}).`, 431)
      }
    }

    return await next(event)
  }
}
