import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { GcpCloudFunctionsContext, GcpCloudFunctionsEvent, RawResponse } from './declarations'

/**
 * GcpCloudFunctionsErrorHandler options.
 */
export interface GcpCloudFunctionsErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an GcpCloudFunctionsErrorHandler.
 */
export class GcpCloudFunctionsErrorHandler implements IAdapterErrorHandler<GcpCloudFunctionsEvent, RawResponse, GcpCloudFunctionsContext> {
  private readonly logger: ILogger

  /**
   * Create an GcpCloudFunctionsErrorHandler.
   *
   * @param options - GcpCloudFunctionsErrorHandler options.
   */
  constructor ({ blueprint }: GcpCloudFunctionsErrorHandlerOptions) {
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
    context: AdapterErrorContext<GcpCloudFunctionsEvent, RawResponse, GcpCloudFunctionsContext>
  ): AdapterEventBuilderType<RawResponse> {
    this.logger.error(error.message, { error })

    return context
      .rawResponseBuilder
      .add('statusCode', 500)
  }
}
