import {
  Logger,
  ILogger,
  IBlueprint,
  AdapterErrorContext,
  IAdapterErrorHandler,
  AdapterEventBuilderType
} from '@stone-js/core'
import { renderToString } from 'react-dom/server'
import { buildAdapterErrorComponent, htmlTemplate } from '../UseReactPageInternals'

/**
 * UseReactServerErrorHandler options.
 */
export interface UseReactServerErrorHandlerOptions {
  logger: ILogger
  blueprint: IBlueprint
}

/**
 * Class representing an UseReactServerErrorHandler.
 *
 * Adapter level error handler for React applications.
 */
export class UseReactServerErrorHandler implements IAdapterErrorHandler<unknown, unknown, unknown> {
  private readonly logger: ILogger
  private readonly blueprint: IBlueprint

  /**
   * Create an UseReactServerErrorHandler.
   *
   * @param options - UseReactServerErrorHandler options.
   */
  constructor ({ blueprint }: UseReactServerErrorHandlerOptions) {
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
      .add('statusCode', error.statusCode ?? 500)
      .add('headers', new Headers({ 'Content-Type': 'text/html' }))
      .add('body', await this.getErrorBody(error, context))
  }

  /**
   * Get the error body.
   *
   * @param error - The error to handle.
   * @returns The error body.
  */
  private async getErrorBody (error: any, context: AdapterErrorContext<unknown, unknown, unknown>): Promise<string> {
    const statusCode = error.statusCode ?? 500
    const template = htmlTemplate(this.blueprint)
    const ClientApp = await buildAdapterErrorComponent(this.blueprint, context, statusCode, error)

    return template.replace('<!--app-html-->', renderToString(ClientApp))
  }
}
