import { NavigationIntent, ReactNativeContext, ReactNativeResponse } from './declarations'
import {
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterErrorContext,
  IAdapterErrorHandler,
  defaultLoggerResolver,
  AdapterEventBuilderType
} from '@stone-js/core'

/**
 * ReactNativeErrorHandler options.
 */
export interface ReactNativeErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * The adapter-level error handler: the last line, for failures that happen around the
 * kernel rather than inside it.
 *
 * It logs and hands back the builder untouched, which leaves the view layer's deferred
 * render in place when there is one. A native application has no status code to fall back
 * on, so swallowing the error silently would leave a frozen screen with nothing in the
 * logs; this at least names it.
 */
export class ReactNativeErrorHandler implements IAdapterErrorHandler<NavigationIntent, ReactNativeResponse, ReactNativeContext> {
  private readonly logger: ILogger

  /**
   * Create the error handler.
   *
   * @param options - The handler options.
   */
  constructor ({ blueprint }: ReactNativeErrorHandlerOptions) {
    this.logger = blueprint.get<LoggerResolver>('stone.logger.resolver', defaultLoggerResolver)(blueprint)
  }

  /**
   * Handle an error.
   *
   * @param error - The error to handle.
   * @param context - The adapter context.
   * @returns The raw response builder.
   */
  public handle (
    error: Error,
    context: AdapterErrorContext<NavigationIntent, ReactNativeResponse, ReactNativeContext>
  ): AdapterEventBuilderType<ReactNativeResponse> {
    this.logger.error(error.message, { error })

    return context.rawResponseBuilder
  }
}
