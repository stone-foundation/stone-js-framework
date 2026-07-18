import {
  Logger,
  ILogger,
  IBlueprint,
  AdapterErrorContext,
  IAdapterErrorHandler,
  AdapterEventBuilderType
} from '@stone-js/core'
import {
  renderReactApp,
  buildAdapterErrorComponent
} from '../UseReactPageInternals'

/**
 * UseReactBrowserErrorHandler options.
 */
export interface UseReactBrowserErrorHandlerOptions {
  blueprint: IBlueprint
}

/**
 * Class representing an UseReactBrowserErrorHandler.
 *
 * Adapter level error handler for React applications.
 */
export class UseReactBrowserErrorHandler implements IAdapterErrorHandler<unknown, unknown, unknown> {
  private readonly logger: ILogger
  private readonly blueprint: IBlueprint

  /**
   * Create an UseReactBrowserErrorHandler.
   *
   * @param options - UseReactBrowserErrorHandler options.
   */
  constructor ({ blueprint }: UseReactBrowserErrorHandlerOptions) {
    this.blueprint = blueprint
    this.logger = Logger.getInstance()
  }

  /**
   * Handle an error.
   *
   * @param error - The error to handle.
   * @param context - The context of the adapter.
   * @returns The raw response.
   */
  public async handle (
    error: any,
    context: AdapterErrorContext<unknown, unknown, unknown>
  ): Promise<AdapterEventBuilderType<unknown>> {
    this.logger.error(error.message, { error })

    return context
      .rawResponseBuilder
      .add('render', async () => await this.renderError(error, context))
  }

  /**
   * Get the error body.
   *
   * @param error - The error to handle.
   * @returns The error body.
   */
  private async renderError (error: any, context: AdapterErrorContext<unknown, unknown, unknown>): Promise<void> {
    const app = await buildAdapterErrorComponent(this.blueprint, context, error.statusCode ?? 500, error)

    // Render the component
    renderReactApp(app, this.blueprint)
  }
}
