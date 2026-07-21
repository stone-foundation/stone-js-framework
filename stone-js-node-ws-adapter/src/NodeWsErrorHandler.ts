import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { RawWsEvent, RawWsResponse, NodeWsExecutionContext } from './declarations'

/**
 * Options for the {@link NodeWsErrorHandler}.
 */
export interface NodeWsErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Handles errors raised while processing a WebSocket message through the kernel.
 */
export class NodeWsErrorHandler implements IAdapterErrorHandler<RawWsEvent, RawWsResponse, NodeWsExecutionContext> {
  private readonly logger: ILogger

  /**
   * @param options - The handler options.
   */
  constructor ({ blueprint }: NodeWsErrorHandlerOptions) {
    this.logger = blueprint.get<LoggerResolver>('stone.logger.resolver', defaultLoggerResolver)(blueprint)
  }

  /**
   * Handle an error by logging it and building an error frame.
   *
   * @param error - The error to handle.
   * @param context - The adapter error context.
   * @returns The raw response builder carrying an error frame.
   */
  public handle (
    error: Error,
    context: AdapterErrorContext<RawWsEvent, RawWsResponse, NodeWsExecutionContext>
  ): AdapterEventBuilderType<RawWsResponse> {
    this.logger.error(error.message, { error })

    return context
      .rawResponseBuilder
      .add('statusCode', 500)
      .add('content', { error: 'Internal error' })
  }
}
