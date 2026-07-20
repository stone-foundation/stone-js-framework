import { FETCH_PLATFORM } from '../constants'
import { fetchAdapterResolver } from '../resolvers'
import { FetchErrorHandler } from '../FetchErrorHandler'
import { FetchExecutionContext } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../middleware/ServerResponseMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, StoneBlueprint } from '@stone-js/core'
import { HttpConfig, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, httpCoreBlueprint } from '@stone-js/http-core'

/**
 * Adapter configuration for the Fetch adapter.
 */
export interface FetchAdapterAdapterConfig extends AdapterConfig<
Request,
Response,
FetchExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {}

/**
 * Application config for the Fetch adapter.
 */
export interface FetchAdapterConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http: Partial<HttpConfig>
}

/**
 * Blueprint for the Fetch adapter.
 */
export interface FetchAdapterBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  stone: FetchAdapterConfig
}

/**
 * Default blueprint for the Fetch adapter.
 *
 * Registers the Web-standard adapter (incoming-event + server-response middleware, resolver,
 * error handler) and its kernel response resolver. Not `default` — opt in with `@Fetch({ default:
 * true })` or by making it the only adapter.
 */
export const fetchAdapterBlueprint: FetchAdapterBlueprint = {
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
        platform: FETCH_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware,
          MetaServerResponseMiddleware
        ],
        resolver: fetchAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: FetchErrorHandler, isClass: true }
        }
      }
    ]
  }
}
