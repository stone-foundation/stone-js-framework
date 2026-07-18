import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import mime from 'mime'
import accepts from 'accepts'
import statuses from 'statuses'
import { HTTP_INTERNAL_SERVER_ERROR } from '@stone-js/http-core'
import { AwsLambdaContext, AwsLambdaHttpEvent, RawHttpResponse } from './declarations'

/**
 * AwsLambdaHttpErrorHandler options.
 */
export interface AwsLambdaHttpErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an AwsLambdaHttpErrorHandler.
 */
export class AwsLambdaHttpErrorHandler implements IAdapterErrorHandler<AwsLambdaHttpEvent, RawHttpResponse, AwsLambdaContext> {
  private readonly logger: ILogger

  /**
   * Create an NodeHttpErrorHandler.
   *
   * @param options - NodeHttpErrorHandler options.
   */
  constructor ({ blueprint }: AwsLambdaHttpErrorHandlerOptions) {
    this.logger = blueprint.get<LoggerResolver>('stone.logger.resolver', defaultLoggerResolver)(blueprint)
  }

  /**
   * Handle an error.
   *
   * @param error - The error to handle.
   * @param context - The context of the adapter.
   * @returns The raw response builder.
   */
  public handle (
    error: Error,
    context: AdapterErrorContext<AwsLambdaHttpEvent, RawHttpResponse, AwsLambdaContext>
  ): AdapterEventBuilderType<RawHttpResponse> {
    this.logger.error(error.message, { error })

    // http-core's HttpError carries `statusCode` on the error itself; fall back to a cause and
    // finally to 500. (Reading only `cause.status` turned every typed HTTP error into a 500.)
    const statusCode = (error as any).statusCode ??
      (error.cause as any)?.statusCode ??
      (error.cause as any)?.status ??
      HTTP_INTERNAL_SERVER_ERROR
    const requestHeaders = context.rawEvent.headers ?? {}
    const type = accepts({ headers: requestHeaders } as any).type(['json', 'html']) as string | false
    const contentType = mime.getType(type !== false ? type : 'txt') ?? requestHeaders['content-type'] ?? 'text/plain'
    const headers = new Headers({ 'Content-Type': contentType })

    return context
      .rawResponseBuilder
      .add('headers', headers)
      .add('statusCode', statusCode)
      .add('statusMessage', statuses.message[statusCode])
  }
}
