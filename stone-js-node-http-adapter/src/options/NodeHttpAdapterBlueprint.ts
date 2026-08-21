import { NODE_HTTP_PLATFORM } from '../constants'
import { nodeHttpAdapterResolver } from '../resolvers'
import { IncomingMessage, ServerResponse } from 'node:http'
import { NodeHttpErrorHandler } from '../NodeHttpErrorHandler'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaBodyEventMiddleware } from '../middleware/BodyEventMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../middleware/ServerResponseMiddleware'
import { NodeHttpServer, NodeServerOptions, ServerMiddleware } from '../declarations'
import { AdapterConfig, AppConfig, defaultKernelResolver, StoneBlueprint } from '@stone-js/core'
import { HttpConfig, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, httpCoreBlueprint } from '@stone-js/http-core'

/**
 * NodeHttpAdapterAdapterConfig Interface.
 *
 * This interface defines the configuration options for the Node HTTP adapter
 * within the Stone.js framework. It includes settings such as the adapter's alias,
 * resolver, middleware, hooks, and server configurations.
 */
export interface NodeHttpAdapterAdapterConfig extends AdapterConfig<
IncomingMessage,
ServerResponse,
NodeHttpServer,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {
  /**
   * The base URL used by the node http to run the application.
   */
  url: string

  /**
   * Determines if the server should use SSL.
   */
  isSsl?: boolean

  /**
   * Additional server configurations for the Node HTTP server.
   */
  server: NodeServerOptions

  /**
   * Determines if the server should print the URL when starting.
   */
  printUrls?: boolean

  /**
   * How long, in milliseconds, requests in flight are given to finish after SIGINT/SIGTERM before the
   * process exits anyway. Zero-config: it defaults to 10 seconds, which is under the grace period
   * every common orchestrator gives a container.
   */
  shutdownGracePeriod?: number

  /**
   * The platform middleware used for processing platform node HTTP requests and responses.
   * This middleware is executed before the adapter middleware.
   * This middleware is lower-level and should be used for platform-specific processing.
   * You can connect or express like middleware here to process request just before the Stone adapter middleware.
   */
  serverMiddleware: ServerMiddleware[]
}

/**
 * Represents the NodeHttpAdapter configuration options for the application.
 */
export interface NodeHttpAdapterConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http: Partial<HttpConfig>
  adapters: NodeHttpAdapterAdapterConfig[]
}

/**
 * Stone blueprint.
 *
 * This interface defines the main configuration options for the Stone.js framework.
 * It includes settings for the builder, adapters, and the main application,
 * while allowing additional custom options to be added.
 */
export interface NodeHttpAdapterBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  /**
   * Application-level settings, including environment, middleware, logging, and service registration.
   */
  stone: NodeHttpAdapterConfig
}

/**
 * Node HTTP adapter options.
 *
 * This object defines the configuration for the Node HTTP adapter.
 */
export const nodeHttpAdapterBlueprint: NodeHttpAdapterBlueprint = {
  stone: {
    ...httpCoreBlueprint.stone,
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        server: {},
        current: false,
        default: false,
        variant: 'server',
        serverMiddleware: [],
        url: 'http://localhost:8080',
        platform: NODE_HTTP_PLATFORM,
        shutdownGracePeriod: 10000,
        middleware: [
          MetaIncomingEventMiddleware,
          // Parsing the body of a POST is the default expectation, not an option. Leaving it opt-in
          // meant an app worked locally and received an empty body in production the day one of its
          // adapters was missing the line, with no error anywhere. It is inert when there is no body,
          // and both middlewares only contribute to the same event builder, so order is free.
          MetaBodyEventMiddleware,
          MetaServerResponseMiddleware
        ],
        resolver: nodeHttpAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: NodeHttpErrorHandler, isClass: true }
        }
      }
    ]
  }
}
