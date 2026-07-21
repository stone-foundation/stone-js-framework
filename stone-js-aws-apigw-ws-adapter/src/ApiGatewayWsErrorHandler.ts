import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { ApiGatewayWsEvent, RawWsResponse, LambdaContext } from './declarations'

/**
 * Options for the {@link ApiGatewayWsErrorHandler}.
 */
export interface ApiGatewayWsErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Handles errors raised while processing an API Gateway WebSocket event.
 */
export class ApiGatewayWsErrorHandler implements IAdapterErrorHandler<ApiGatewayWsEvent, RawWsResponse, LambdaContext> {
  private readonly logger: ILogger

  /**
   * @param options - The handler options.
   */
  constructor ({ blueprint }: ApiGatewayWsErrorHandlerOptions) {
    this.logger = blueprint.get<LoggerResolver>('stone.logger.resolver', defaultLoggerResolver)(blueprint)
  }

  /**
   * Handle an error by logging it and building a 500 response.
   *
   * @param error - The error to handle.
   * @param context - The adapter error context.
   * @returns The raw response builder.
   */
  public handle (
    error: Error,
    context: AdapterErrorContext<ApiGatewayWsEvent, RawWsResponse, LambdaContext>
  ): AdapterEventBuilderType<RawWsResponse> {
    this.logger.error(error.message, { error })
    return context.rawResponseBuilder.add('statusCode', 500)
  }
}
