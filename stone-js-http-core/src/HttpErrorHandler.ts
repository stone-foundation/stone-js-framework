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
    }[error.name] ?? (() => serverErrorHttpResponse(message('Internal Server Error')))

    return response()
  }
}
