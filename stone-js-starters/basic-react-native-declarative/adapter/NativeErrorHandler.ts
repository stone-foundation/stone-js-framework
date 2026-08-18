import { emitNativeError } from './renderSink'
import { NativeEventSource, NativeNavigationEvent } from './NativeEventSource'
import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'
import { NativeResponse } from './declarations'

/**
 * NativeErrorHandler options.
 */
export interface NativeErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Adapter-level error handler: logs the error and surfaces it on screen
 * through the render sink, so a broken chain is visible instead of silent.
 */
export class NativeErrorHandler implements IAdapterErrorHandler<NativeNavigationEvent, NativeResponse, NativeEventSource> {
  private readonly logger: ILogger

  /**
   * Create a NativeErrorHandler.
   *
   * @param options - NativeErrorHandler options.
   */
  constructor ({ blueprint }: NativeErrorHandlerOptions) {
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
    context: AdapterErrorContext<NativeNavigationEvent, NativeResponse, NativeEventSource>
  ): AdapterEventBuilderType<NativeResponse> {
    this.logger.error(error.message, { error })
    emitNativeError(error)

    return context.rawResponseBuilder
  }
}
