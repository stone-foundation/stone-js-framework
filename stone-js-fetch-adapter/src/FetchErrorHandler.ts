import statuses from 'statuses'
import { HTTP_INTERNAL_SERVER_ERROR } from '@stone-js/http-core'
import { FetchExecutionContext, FetchAdapterResponseBuilder } from './declarations'
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
 * The default error handler for the Fetch adapter.
 *
 * It logs the error, derives a status code from the (typed) error, negotiates JSON vs plain text
 * from the `Accept` header, and fills the raw-response builder — staying fully Web-standard, no
 * Node-only content-negotiation libraries.
 */
export class FetchErrorHandler implements IAdapterErrorHandler<Request, Response, FetchExecutionContext> {
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
  handle (error: Error, context: AdapterErrorContext<Request, Response, FetchExecutionContext>): AdapterEventBuilderType<Response> {
    this.logger.error(error.message, { error })

    const statusCode = (error as any).statusCode ??
      (error.cause as any)?.statusCode ??
      (error.cause as any)?.status ??
      HTTP_INTERNAL_SERVER_ERROR

    const message = statuses.message[statusCode] ?? 'Error'
    const wantsJson = (context.rawEvent.headers.get('accept') ?? '').includes('application/json')
    const contentType = wantsJson ? 'application/json' : 'text/plain'
    const body = wantsJson ? JSON.stringify({ statusCode, error: message }) : message

    return (context.rawResponseBuilder as unknown as FetchAdapterResponseBuilder)
      .add('status', statusCode)
      .add('statusText', message)
      .add('headers', { 'content-type': contentType })
      .add('body', body)
  }
}
