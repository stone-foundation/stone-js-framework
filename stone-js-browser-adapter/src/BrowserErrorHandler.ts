import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { BrowserContext, BrowserEvent, BrowserResponse } from './declarations'

/**
 * BrowserErrorHandler options.
 */
export interface BrowserErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an BrowserErrorHandler.
 */
export class BrowserErrorHandler implements IAdapterErrorHandler<BrowserEvent, BrowserResponse, BrowserContext> {
  private readonly logger: ILogger

  /**
   * Create an BrowserErrorHandler.
   *
   * @param options - BrowserErrorHandler options.
   */
  constructor ({ blueprint }: BrowserErrorHandlerOptions) {
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
    context: AdapterErrorContext<BrowserEvent, BrowserResponse, BrowserContext>
  ): AdapterEventBuilderType<BrowserResponse> {
    this.logger.error(error.message, { error })

    return context.rawResponseBuilder
  }
}
