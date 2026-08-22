import {
  createHttpResponse,
  notFoundHttpResponse,
  forbiddenHttpResponse,
  badRequestHttpResponse,
  serverErrorHttpResponse,
  unauthorizedHttpResponse,
  methodNotAllowedHttpResponse
} from './HttpResponse'
import { HttpError } from './errors/HttpError'
import { IncomingHttpEvent } from './IncomingHttpEvent'
import { OutgoingHttpResponse } from './OutgoingHttpResponse'
import { IntegrationError, ILogger, IErrorHandler } from '@stone-js/core'

/**
 * HttpErrorHandler options.
 */
export interface HttpErrorHandlerOptions {
  logger: ILogger
}

/**
 * Class representing an HttpErrorHandler.
 */
export class HttpErrorHandler implements IErrorHandler<IncomingHttpEvent, OutgoingHttpResponse> {
  private readonly logger: ILogger

  /**
   * Create an HttpErrorHandler.
   *
   * @param options - HttpErrorHandler options.
   */
  constructor ({ logger }: HttpErrorHandlerOptions) {
    if (logger === undefined) {
      throw new IntegrationError('Logger is required to create an HttpErrorHandler instance.')
    }

    this.logger = logger
  }

  /**
   * Handle an error.
   *
   * @param error - The error to handle.
   * @param event - The incoming http event.
   * @returns The outgoing http response.
   */
  public handle (error: Error, event: IncomingHttpEvent): OutgoingHttpResponse {
    const httpError = error as HttpError
    const types = ['json', 'html', 'xml', 'text']
    const message = (error: string): string | { error: string } => {
      return event.preferredType(types, 'html') === 'json' ? { error } : error
    }

    this.logger.error(error.message, { error })

    const response = {
      NotFoundError: () => notFoundHttpResponse(message('Not Found')),
      ForbiddenError: () => forbiddenHttpResponse(message('Forbidden')),
      BadRequestError: () => badRequestHttpResponse(message('Bad Request')),
      UnauthorizedError: () => unauthorizedHttpResponse(message('Unauthorized')),
      MethodNotAllowedError: () => methodNotAllowedHttpResponse(message('Method Not Allowed')),
      HttpError: () => createHttpResponse(message(httpError.statusMessage), httpError.statusCode, httpError.headers)
    }[error.name] ?? this.fromDeclaredStatus(httpError, message)

    return response()
  }

  /**
   * The status an error declared, when this handler does not know its name.
   *
   * A platform-agnostic module cannot import this package, so it says what it means on the error
   * itself: `AuthorizationError` carries `403`, a limiter's error carries `429`. Keyed only by name,
   * every one of those answered `500`, which turns a deliberate refusal into a bug report and tells
   * the caller to retry an operation that was never going to succeed. Honouring the declaration is
   * what lets a module choose its status without knowing which platform is answering.
   *
   * Nothing else changes: an error that declares no usable status is still an internal error, and a
   * name this handler knows is still matched first.
   *
   * @param error - The error, read for a declared status and headers.
   * @param message - How to render the body for the negotiated type.
   * @returns The response builder.
   */
  private fromDeclaredStatus (
    error: HttpError,
    message: (error: string) => string | { error: string }
  ): () => OutgoingHttpResponse {
    const statusCode = error.statusCode

    if (typeof statusCode !== 'number' || statusCode < 400 || statusCode > 599) {
      return () => serverErrorHttpResponse(message('Internal Server Error'))
    }

    return () => createHttpResponse(
      message(error.statusMessage ?? error.message),
      statusCode,
      error.headers ?? {}
    )
  }
}
