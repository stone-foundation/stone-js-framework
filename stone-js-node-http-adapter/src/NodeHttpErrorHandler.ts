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
import { NodeHttpServer } from './declarations'
import { IncomingMessage, ServerResponse } from 'node:http'
import { HTTP_INTERNAL_SERVER_ERROR } from '@stone-js/http-core'

/**
 * NodeHttpErrorHandler options.
 */
export interface NodeHttpErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an NodeHttpErrorHandler.
 */
export class NodeHttpErrorHandler implements IAdapterErrorHandler<IncomingMessage, ServerResponse, NodeHttpServer> {
  private readonly logger: ILogger

  /**
   * Create an NodeHttpErrorHandler.
   *
   * @param options - NodeHttpErrorHandler options.
   */
  constructor ({ blueprint }: NodeHttpErrorHandlerOptions) {
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
    context: AdapterErrorContext<IncomingMessage, ServerResponse, NodeHttpServer>
  ): AdapterEventBuilderType<ServerResponse> {
    this.logger.error(error.message, { error })

    const statusCode = (error.cause as any)?.status ?? HTTP_INTERNAL_SERVER_ERROR
    const type = accepts(context.rawEvent).type(['json', 'html']) as string | false
    const contentType = mime.getType(type !== false ? type : 'txt') ?? context.rawEvent.headers['content-type'] ?? 'text/plain'
    const headers = new Headers({ 'Content-Type': contentType })

    return context
      .rawResponseBuilder
      .add('headers', headers)
      .add('statusCode', statusCode)
      .add('statusMessage', statuses.message[statusCode])
  }
}
