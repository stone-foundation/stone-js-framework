import { NextMiddleware } from '@stone-js/core'
import { NODE_CONSOLE_PLATFORM } from '../constants'
import { NodeCliAdapterError } from '../errors/NodeCliAdapterError'
import { NodeCliAdapterContext, NodeCliAdapterResponseBuilder } from '../declarations'

/**
 * Middleware for handling incoming events in the Node CLI adapter.
 *
 * This middleware processes the incoming event and prepares it for the next middleware in the pipeline.
 */
export class IncomingEventMiddleware {
  /**
   * Handles the incoming event, processes it, and invokes the next middleware in the pipeline.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @param next - The next middleware to be invoked in the pipeline.
   * @returns A promise that resolves to the processed context.
   * @throws {NodeCliAdapterError} If required components are missing in the context.
   */
  async handle (context: NodeCliAdapterContext, next: NextMiddleware<NodeCliAdapterContext, NodeCliAdapterResponseBuilder>): Promise<NodeCliAdapterResponseBuilder> {
    if ((context.rawEvent == null) || ((context.incomingEventBuilder?.add) == null)) {
      throw new NodeCliAdapterError('The context is missing required components.')
    }

    context
      .incomingEventBuilder
      .add('source', this.getSource(context))
      .add('url', new URL(context.rawEvent._script, 'http://localhost'))
      .add('metadata', { ...context.rawEvent, _task: context.rawEvent._extra.shift() })

    return await next(context)
  }

  /**
   * Create the IncomingEventSource from the context.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @returns The Incoming Event Source.
   */
  private getSource (context: NodeCliAdapterContext): unknown {
    return {
      rawEvent: context.rawEvent,
      platform: NODE_CONSOLE_PLATFORM,
      rawContext: context.executionContext
    }
  }
}

/**
 * Meta Middleware for processing incoming events.
 */
export const MetaIncomingEventMiddleware = { module: IncomingEventMiddleware, isClass: true }
