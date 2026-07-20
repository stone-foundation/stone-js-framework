import { NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { GCP_CLOUD_FUNCTIONS_PLATFORM } from '../constants'
import { GcpCloudFunctionsAdapterError } from '../errors/GcpCloudFunctionsAdapterError'
import { GcpCloudFunctionsAdapterContext, GcpCloudFunctionsAdapterResponseBuilder } from '../declarations'

/**
 * Middleware for handling incoming events and transforming them into Stone.js events.
 *
 * This class processes incoming events, extracting relevant data and forwards them to the next middleware in the pipeline.
 */
export class IncomingEventMiddleware {
  /**
   * Handles the incoming event, processes it, and invokes the next middleware in the pipeline.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @param next - The next middleware to be invoked in the pipeline.
   * @returns A promise that resolves to the processed Response Builder.
   * @throws {GcpCloudFunctionsAdapterError} If required components are missing in the context.
   */
  async handle (context: GcpCloudFunctionsAdapterContext, next: NextMiddleware<GcpCloudFunctionsAdapterContext, GcpCloudFunctionsAdapterResponseBuilder>): Promise<GcpCloudFunctionsAdapterResponseBuilder> {
    if ((context.rawEvent === undefined) || ((context.incomingEventBuilder?.add) === undefined)) {
      throw new GcpCloudFunctionsAdapterError('The context is missing required components.')
    }

    context
      .incomingEventBuilder
      .add('metadata', context.rawEvent)
      .add('source', this.getSource(context))

    return await next(context)
  }

  /**
   * Create the IncomingEventSource from the context.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @returns The Incoming Event Source.
   */
  private getSource (context: GcpCloudFunctionsAdapterContext): unknown {
    return {
      rawEvent: context.rawEvent,
      platform: GCP_CLOUD_FUNCTIONS_PLATFORM,
      rawContext: context.executionContext
    }
  }
}

/**
 * Meta Middleware for processing incoming events.
 */
export const MetaIncomingEventMiddleware: MetaMiddleware<any, any> = { module: IncomingEventMiddleware, isClass: true }
