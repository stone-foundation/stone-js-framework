import { ALIBABA_FC_HTTP_PLATFORM } from '../constants'
import { alibabaFcHttpAdapterResolver } from '../resolvers'
import { AlibabaFcHttpErrorHandler } from '../AlibabaFcHttpErrorHandler'
import { AlibabaFcHttpExecutionContext } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../middleware/ServerResponseMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, StoneBlueprint } from '@stone-js/core'
import { HttpConfig, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, httpCoreBlueprint } from '@stone-js/http-core'

/**
 * Adapter configuration for the AlibabaFcHttp adapter.
 */
export interface AlibabaFcHttpAdapterAdapterConfig extends AdapterConfig<
Request,
Response,
AlibabaFcHttpExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {}

/**
 * Application config for the AlibabaFcHttp adapter.
 */
export interface AlibabaFcHttpAdapterConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http: Partial<HttpConfig>
}

/**
 * Blueprint for the AlibabaFcHttp adapter.
 */
export interface AlibabaFcHttpAdapterBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  stone: AlibabaFcHttpAdapterConfig
}

/**
 * Default blueprint for the AlibabaFcHttp adapter.
 *
 * Registers the Alibaba FC HTTP adapter (incoming-event + server-response middleware, resolver,
 * error handler) and its kernel response resolver. Not `default` — opt in with `@AlibabaFcHttp({ default:
 * true })` or by making it the only adapter.
 */
export const alibabaFcHttpAdapterBlueprint: AlibabaFcHttpAdapterBlueprint = {
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
        platform: ALIBABA_FC_HTTP_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware,
          MetaServerResponseMiddleware
        ],
        resolver: alibabaFcHttpAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: AlibabaFcHttpErrorHandler, isClass: true }
        }
      }
    ]
  }
}
