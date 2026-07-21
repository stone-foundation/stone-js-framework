import { NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { NODE_WS_PLATFORM } from '../constants'
import { NodeWsAdapterError } from '../errors/NodeWsAdapterError'
import { NodeWsAdapterContext, NodeWsAdapterResponseBuilder } from '../declarations'

/**
 * Normalizes a raw WebSocket frame into a Stone.js incoming event.
 *
 * It attaches the frame as metadata and records the source (platform, socket, connection id) before
 * handing off to the next middleware in the adapter pipeline.
 */
export class IncomingEventMiddleware {
  /**
   * Handle the incoming event and invoke the next middleware.
   *
   * @param context - The adapter context.
   * @param next - The next middleware.
   * @returns The response builder.
   * @throws {NodeWsAdapterError} When the context is missing required components.
   */
  async handle (context: NodeWsAdapterContext, next: NextMiddleware<NodeWsAdapterContext, NodeWsAdapterResponseBuilder>): Promise<NodeWsAdapterResponseBuilder> {
    if ((context.rawEvent === undefined) || ((context.incomingEventBuilder?.add) === undefined)) {
      throw new NodeWsAdapterError('The context is missing required components.')
    }

    context
      .incomingEventBuilder
      .add('metadata', context.rawEvent)
      .add('source', this.getSource(context))

    return await next(context)
  }

  /**
   * Build the incoming event source from the context.
   *
   * @param context - The adapter context.
   * @returns The incoming event source.
   */
  private getSource (context: NodeWsAdapterContext): unknown {
    return {
      rawEvent: context.rawEvent,
      platform: NODE_WS_PLATFORM,
      rawContext: context.executionContext
    }
  }
}

/**
 * Meta middleware for normalizing incoming WebSocket events.
 */
export const MetaIncomingEventMiddleware: MetaMiddleware<any, any> = { module: IncomingEventMiddleware, isClass: true }
