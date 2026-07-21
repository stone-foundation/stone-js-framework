import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { AzureFunctionsContext, AzureFunctionsEvent, RawResponse } from './declarations'

/**
 * AzureFunctionsErrorHandler options.
 */
export interface AzureFunctionsErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an AzureFunctionsErrorHandler.
 */
export class AzureFunctionsErrorHandler implements IAdapterErrorHandler<AzureFunctionsEvent, RawResponse, AzureFunctionsContext> {
  private readonly logger: ILogger

  /**
   * Create an AzureFunctionsErrorHandler.
   *
   * @param options - AzureFunctionsErrorHandler options.
   */
  constructor ({ blueprint }: AzureFunctionsErrorHandlerOptions) {
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
    context: AdapterErrorContext<AzureFunctionsEvent, RawResponse, AzureFunctionsContext>
  ): AdapterEventBuilderType<RawResponse> {
    this.logger.error(error.message, { error })

    return context
      .rawResponseBuilder
      .add('statusCode', 500)
  }
}
