import { NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { AWS_APIGW_WS_PLATFORM } from '../constants'
import { ApiGatewayWsAdapterError } from '../errors/ApiGatewayWsAdapterError'
import { ApiGatewayWsAdapterContext, ApiGatewayWsResponseBuilder } from '../declarations'

/**
 * Normalizes a raw API Gateway WebSocket event into a Stone.js incoming event.
 */
export class IncomingEventMiddleware {
  /**
   * Handle the incoming event and invoke the next middleware.
   *
   * @param context - The adapter context.
   * @param next - The next middleware.
   * @returns The response builder.
   * @throws {ApiGatewayWsAdapterError} When the context is missing required components.
   */
  async handle (context: ApiGatewayWsAdapterContext, next: NextMiddleware<ApiGatewayWsAdapterContext, ApiGatewayWsResponseBuilder>): Promise<ApiGatewayWsResponseBuilder> {
    if ((context.rawEvent === undefined) || ((context.incomingEventBuilder?.add) === undefined)) {
      throw new ApiGatewayWsAdapterError('The context is missing required components.')
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
  private getSource (context: ApiGatewayWsAdapterContext): unknown {
    return {
      rawEvent: context.rawEvent,
      platform: AWS_APIGW_WS_PLATFORM,
      rawContext: context.executionContext
    }
  }
}

/**
 * Meta middleware for normalizing incoming API Gateway WebSocket events.
 */
export const MetaIncomingEventMiddleware: MetaMiddleware<any, any> = { module: IncomingEventMiddleware, isClass: true }
