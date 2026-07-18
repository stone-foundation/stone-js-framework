import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { AwsLambdaContext, AwsLambdaEvent, RawResponse } from './declarations'

/**
 * AwsLambdaErrorHandler options.
 */
export interface AwsLambdaErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an AwsLambdaErrorHandler.
 */
export class AwsLambdaErrorHandler implements IAdapterErrorHandler<AwsLambdaEvent, RawResponse, AwsLambdaContext> {
  private readonly logger: ILogger

  /**
   * Create an AwsLambdaErrorHandler.
   *
   * @param options - AwsLambdaErrorHandler options.
   */
  constructor ({ blueprint }: AwsLambdaErrorHandlerOptions) {
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
    context: AdapterErrorContext<AwsLambdaEvent, RawResponse, AwsLambdaContext>
  ): AdapterEventBuilderType<RawResponse> {
    this.logger.error(error.message, { error })

    return context
      .rawResponseBuilder
      .add('statusCode', 500)
  }
}
