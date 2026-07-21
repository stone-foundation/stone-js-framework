import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { TencentScfContext, TencentScfEvent, RawResponse } from './declarations'

/**
 * TencentScfErrorHandler options.
 */
export interface TencentScfErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an TencentScfErrorHandler.
 */
export class TencentScfErrorHandler implements IAdapterErrorHandler<TencentScfEvent, RawResponse, TencentScfContext> {
  private readonly logger: ILogger

  /**
   * Create an TencentScfErrorHandler.
   *
   * @param options - TencentScfErrorHandler options.
   */
  constructor ({ blueprint }: TencentScfErrorHandlerOptions) {
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
    context: AdapterErrorContext<TencentScfEvent, RawResponse, TencentScfContext>
  ): AdapterEventBuilderType<RawResponse> {
    this.logger.error(error.message, { error })

    return context
      .rawResponseBuilder
      .add('statusCode', 500)
  }
}
