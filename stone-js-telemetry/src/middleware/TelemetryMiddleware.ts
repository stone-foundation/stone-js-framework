import { ITelemetry, TelemetryStatus } from '../declarations'
import { IncomingEvent, NextMiddleware, OutgoingResponse } from '@stone-js/core'

/**
 * HTTP status code at or above which a *server* response is considered an error.
 *
 * Follows the OpenTelemetry HTTP semantic conventions: for a server span, only 5xx responses set
 * the span status to error; 4xx are client errors and leave the status `ok`. Responses without a
 * status code (e.g. CLI/other adapters) are treated as `ok` unless the handler throws.
 */
export const SERVER_ERROR_STATUS = 500

/**
 * Kernel middleware that records one span (and a counter) per processed event.
 *
 * It stays platform-agnostic: it spans every `IncomingEvent` with its `type`, reads a
 * `statusCode` off the response only when present, and derives the outcome using the
 * OpenTelemetry convention (thrown error, or status >= 500 → `error`; otherwise `ok`). This
 * matters because the kernel turns handler errors into responses rather than re-throwing, so a
 * failed request surfaces as a 5xx response — not an exception — at the middleware boundary.
 * Errors that *are* thrown are recorded and re-thrown; telemetry never swallows them.
 */
export class TelemetryMiddleware {
  private readonly telemetry: ITelemetry

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ telemetry }: { telemetry: ITelemetry }) {
    this.telemetry = telemetry
  }

  /**
   * Wraps event handling with a telemetry span.
   *
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The outgoing response.
   */
  async handle (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> {
    if (!this.telemetry.isEnabled()) {
      return await next(event)
    }

    const span = this.telemetry.startSpan('stone.event', { type: event.type })

    try {
      const response = await next(event)
      const statusCode = (response as { statusCode?: number })?.statusCode

      if (statusCode !== undefined) { span.setAttribute('statusCode', statusCode) }

      const status: TelemetryStatus = statusCode !== undefined && statusCode >= SERVER_ERROR_STATUS ? 'error' : 'ok'

      span.end(status)
      this.telemetry.counter('stone.events.total', 1, { status })
      return response
    } catch (error: any) {
      span.recordError(error)
      span.end('error')
      this.telemetry.counter('stone.events.total', 1, { status: 'error' })
      throw error
    }
  }
}
