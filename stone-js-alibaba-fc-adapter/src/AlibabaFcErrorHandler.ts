import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { AlibabaFcContext, AlibabaFcEvent, RawResponse } from './declarations'

/**
 * AlibabaFcErrorHandler options.
 */
export interface AlibabaFcErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an AlibabaFcErrorHandler.
 */
export class AlibabaFcErrorHandler implements IAdapterErrorHandler<AlibabaFcEvent, RawResponse, AlibabaFcContext> {
  private readonly logger: ILogger

  /**
   * Create an AlibabaFcErrorHandler.
   *
   * @param options - AlibabaFcErrorHandler options.
   */
  constructor ({ blueprint }: AlibabaFcErrorHandlerOptions) {
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
    context: AdapterErrorContext<AlibabaFcEvent, RawResponse, AlibabaFcContext>
  ): AdapterEventBuilderType<RawResponse> {
    this.logger.error(error.message, { error })

    return context
      .rawResponseBuilder
      .add('statusCode', 500)
  }
}
