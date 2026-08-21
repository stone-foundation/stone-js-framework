import { NODE_WS_PLATFORM } from '../constants'
import { nodeWsAdapterResolver } from '../resolvers'
import { NodeWsErrorHandler } from '../NodeWsErrorHandler'
import { RawWsEvent, RawWsResponse, NodeWsExecutionContext } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration for the Node.js WebSocket adapter.
 */
export interface NodeWsAdapterAdapterConfig extends AdapterConfig<
RawWsEvent,
RawWsResponse,
NodeWsExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /**
   * How long, in milliseconds, connected clients are given to leave after `stop()` asks them to,
   * before they are dropped. Zero-config: it defaults to 10 seconds.
   */
  shutdownGracePeriod?: number
}

/**
 * Application-level configuration for the Node.js WebSocket adapter.
 *
 * `adapters` is narrowed to this adapter's own config so its options are typed where they are
 * written, instead of being accepted as unknown extras on the generic shape.
 */
export interface NodeWsAdapterConfig extends Partial<AppConfig<IncomingEvent, OutgoingResponse>> {
  adapters: NodeWsAdapterAdapterConfig[]
}

/**
 * Blueprint for the Node.js WebSocket adapter.
 */
export interface NodeWsAdapterBlueprint extends StoneBlueprint<IncomingEvent, OutgoingResponse> {
  stone: NodeWsAdapterConfig
}

/**
 * Default blueprint for the Node.js WebSocket adapter.
 *
 * Registers the adapter under the `node_ws` platform: the resolver, the incoming-event middleware,
 * the kernel event-handler resolver, and the error handler. The socket server binds on
 * `stone.adapter.url` (default `ws://localhost:8080`).
 */
export const nodeWsAdapterBlueprint: NodeWsAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        default: false,
        variant: 'server',
        platform: NODE_WS_PLATFORM,
        shutdownGracePeriod: 10000,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: nodeWsAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: NodeWsErrorHandler, isClass: true }
        }
      }
    ]
  }
}
