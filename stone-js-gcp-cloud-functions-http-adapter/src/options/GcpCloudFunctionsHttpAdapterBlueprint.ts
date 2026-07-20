import { GCP_CLOUD_FUNCTIONS_HTTP_PLATFORM } from '../constants'
import { gcpCloudFunctionsHttpAdapterResolver } from '../resolvers'
import { IncomingMessage, ServerResponse } from 'node:http'
import { GcpCloudFunctionsHttpErrorHandler } from '../GcpCloudFunctionsHttpErrorHandler'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../middleware/ServerResponseMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, StoneBlueprint } from '@stone-js/core'
import { HttpConfig, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, httpCoreBlueprint } from '@stone-js/http-core'

/**
 * GcpCloudFunctionsHttpAdapterAdapterConfig Interface.
 *
 * This interface defines the configuration options for the GCP Cloud Functions HTTP adapter
 * within the Stone.js framework. It includes settings such as the adapter's alias, resolver,
 * middleware, hooks, and error handlers. There is no server configuration: the platform owns the
 * process and the socket.
 */
export interface GcpCloudFunctionsHttpAdapterAdapterConfig extends AdapterConfig<
IncomingMessage,
ServerResponse,
undefined,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {}

/**
 * Represents the GcpCloudFunctionsHttpAdapter configuration options for the application.
 */
export interface GcpCloudFunctionsHttpAdapterConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http: Partial<HttpConfig>
  adapters: GcpCloudFunctionsHttpAdapterAdapterConfig[]
}

/**
 * Stone blueprint.
 *
 * This interface defines the main configuration options for the Stone.js framework.
 * It includes settings for the builder, adapters, and the main application,
 * while allowing additional custom options to be added.
 */
export interface GcpCloudFunctionsHttpAdapterBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  /**
   * Application-level settings, including environment, middleware, logging, and service registration.
   */
  stone: GcpCloudFunctionsHttpAdapterConfig
}

/**
 * GCP Cloud Functions HTTP adapter options.
 *
 * This object defines the configuration for the GCP Cloud Functions HTTP adapter.
 */
export const gcpCloudFunctionsHttpAdapterBlueprint: GcpCloudFunctionsHttpAdapterBlueprint = {
  stone: {
    ...httpCoreBlueprint.stone,
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        default: false,
        variant: 'server',
        platform: GCP_CLOUD_FUNCTIONS_HTTP_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware,
          MetaServerResponseMiddleware
        ],
        resolver: gcpCloudFunctionsHttpAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: GcpCloudFunctionsHttpErrorHandler, isClass: true }
        }
      }
    ]
  }
}
