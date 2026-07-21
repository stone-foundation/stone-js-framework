import statuses from 'statuses'
import { HTTP_INTERNAL_SERVER_ERROR } from '@stone-js/http-core'
import { AlibabaFcHttpRequest, AlibabaFcHttpResponse, AlibabaFcHttpExecutionContext, AlibabaFcHttpAdapterResponseBuilder } from './declarations'
import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'

/**
 * The default error handler for the Alibaba FC HTTP adapter.
 *
 * It logs the error, derives a status code from the (typed) error, negotiates JSON vs plain text
 * from the `Accept` header, and fills the raw-response builder.
 */
export class AlibabaFcHttpErrorHandler implements IAdapterErrorHandler<AlibabaFcHttpRequest, AlibabaFcHttpResponse, AlibabaFcHttpExecutionContext> {
  private readonly logger: ILogger

  /**
   * @param options - The auto-wired blueprint.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.logger = blueprint.get<LoggerResolver>('stone.logger.resolver', defaultLoggerResolver)(blueprint)
  }

  /**
   * Handle an adapter-level error.
   *
   * @param error - The error to handle.
   * @param context - The adapter error context.
   * @returns The raw-response builder.
   */
  handle (error: Error, context: AdapterErrorContext<AlibabaFcHttpRequest, AlibabaFcHttpResponse, AlibabaFcHttpExecutionContext>): AdapterEventBuilderType<AlibabaFcHttpResponse> {
    this.logger.error(error.message, { error })

    const statusCode = (error as any).statusCode ??
      (error.cause as any)?.statusCode ??
      (error.cause as any)?.status ??
      HTTP_INTERNAL_SERVER_ERROR

    const message = statuses.message[statusCode] ?? 'Error'
    const wantsJson = this.acceptsJson(context.rawEvent)
    const contentType = wantsJson ? 'application/json' : 'text/plain'
    const body = wantsJson ? JSON.stringify({ statusCode, error: message }) : message

    return (context.rawResponseBuilder as unknown as AlibabaFcHttpAdapterResponseBuilder)
      .add('status', statusCode)
      .add('statusText', message)
      .add('headers', { 'content-type': contentType })
      .add('body', body)
  }

  /**
   * Reads the `Accept` header from FC's plain (case-insensitive) header object.
   *
   * @param request - The FC request.
   * @returns True when the client accepts JSON.
   */
  private acceptsJson (request: AlibabaFcHttpRequest): boolean {
    const raw = request.headers.accept ?? request.headers.Accept
    const accept = Array.isArray(raw) ? raw.join(',') : (raw ?? '')
    return accept.includes('application/json')
  }
}
