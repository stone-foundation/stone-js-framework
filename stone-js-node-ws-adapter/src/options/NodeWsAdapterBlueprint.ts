import { NODE_WS_PLATFORM } from '../constants'
import { nodeWsAdapterResolver } from '../resolvers'
import { NodeWsErrorHandler } from '../NodeWsErrorHandler'
import { RawWsEvent, RawWsResponse, NodeWsExecutionContext } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

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
> {}

/**
 * Blueprint for the Node.js WebSocket adapter.
 */
export interface NodeWsAdapterBlueprint extends StoneBlueprint {}

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
