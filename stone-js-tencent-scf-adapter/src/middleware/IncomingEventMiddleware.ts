import { NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { TENCENT_SCF_PLATFORM } from '../constants'
import { TencentScfAdapterError } from '../errors/TencentScfAdapterError'
import { TencentScfAdapterContext, TencentScfAdapterResponseBuilder } from '../declarations'

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
   * @throws {TencentScfAdapterError} If required components are missing in the context.
   */
  async handle (context: TencentScfAdapterContext, next: NextMiddleware<TencentScfAdapterContext, TencentScfAdapterResponseBuilder>): Promise<TencentScfAdapterResponseBuilder> {
    if ((context.rawEvent === undefined) || ((context.incomingEventBuilder?.add) === undefined)) {
      throw new TencentScfAdapterError('The context is missing required components.')
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
  private getSource (context: TencentScfAdapterContext): unknown {
    return {
      rawEvent: context.rawEvent,
      platform: TENCENT_SCF_PLATFORM,
      rawContext: context.executionContext
    }
  }
}

/**
 * Meta Middleware for processing incoming events.
 */
export const MetaIncomingEventMiddleware: MetaMiddleware<any, any> = { module: IncomingEventMiddleware, isClass: true }
