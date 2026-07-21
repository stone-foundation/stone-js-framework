import { AZURE_FUNCTIONS_HTTP_PLATFORM } from '../constants'
import { azureFunctionsHttpAdapterResolver } from '../resolvers'
import { AzureFunctionsHttpErrorHandler } from '../AzureFunctionsHttpErrorHandler'
import { AzureFunctionsHttpExecutionContext } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../middleware/ServerResponseMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, StoneBlueprint } from '@stone-js/core'
import { HttpConfig, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, httpCoreBlueprint } from '@stone-js/http-core'

/**
 * Adapter configuration for the AzureFunctionsHttp adapter.
 */
export interface AzureFunctionsHttpAdapterAdapterConfig extends AdapterConfig<
Request,
Response,
AzureFunctionsHttpExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {}

/**
 * Application config for the AzureFunctionsHttp adapter.
 */
export interface AzureFunctionsHttpAdapterConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http: Partial<HttpConfig>
}

/**
 * Blueprint for the AzureFunctionsHttp adapter.
 */
export interface AzureFunctionsHttpAdapterBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  stone: AzureFunctionsHttpAdapterConfig
}

/**
 * Default blueprint for the AzureFunctionsHttp adapter.
 *
 * Registers the Web-standard adapter (incoming-event + server-response middleware, resolver,
 * error handler) and its kernel response resolver. Not `default` — opt in with `@AzureFunctionsHttp({ default:
 * true })` or by making it the only adapter.
 */
export const azureFunctionsHttpAdapterBlueprint: AzureFunctionsHttpAdapterBlueprint = {
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
        platform: AZURE_FUNCTIONS_HTTP_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware,
          MetaServerResponseMiddleware
        ],
        resolver: azureFunctionsHttpAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: AzureFunctionsHttpErrorHandler, isClass: true }
        }
      }
    ]
  }
}
