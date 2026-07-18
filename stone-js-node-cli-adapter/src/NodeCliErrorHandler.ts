import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { NodeCliEvent, NodeCliExecutionContext, RawResponse } from './declarations'

/**
 * NodeCliErrorHandler options.
 */
export interface NodeCliErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an NodeCliErrorHandler.
 */
export class NodeCliErrorHandler implements IAdapterErrorHandler<NodeCliEvent, RawResponse, NodeCliExecutionContext> {
  private readonly logger: ILogger

  /**
   * Create an NodeCliErrorHandler.
   *
   * @param options - NodeCliErrorHandler options.
   */
  constructor ({ blueprint }: NodeCliErrorHandlerOptions) {
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
    context: AdapterErrorContext<NodeCliEvent, RawResponse, NodeCliExecutionContext>
  ): AdapterEventBuilderType<RawResponse> {
    this.logger.error(error.message, { error })

    return context.rawResponseBuilder.add('exitCode', 500)
  }
}
