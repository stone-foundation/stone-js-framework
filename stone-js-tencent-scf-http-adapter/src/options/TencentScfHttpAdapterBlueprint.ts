import { getString } from '@stone-js/env'
import { TENCENT_SCF_HTTP_PLATFORM } from '../constants'
import { tencentScfHttpAdapterResolver } from '../resolvers'
import { TencentScfHttpErrorHandler } from '../TencentScfHttpErrorHandler'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../middleware/ServerResponseMiddleware'
import { TencentScfContext, TencentScfHttpEvent, RawHttpResponse } from '../declarations'
import { AdapterConfig, AppConfig, defaultKernelResolver, isNotEmpty, StoneBlueprint } from '@stone-js/core'
import { HttpConfig, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, httpCoreBlueprint } from '@stone-js/http-core'

/**
 * Configuration interface for the Tencent SCF Http Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the Tencent SCF platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface TencentScfHttpAdapterAdapterConfig extends AdapterConfig<
TencentScfHttpEvent,
RawHttpResponse,
TencentScfContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {}

/**
 * Represents the TencentScfHttpAdapterConfig configuration options for the application.
 */
export interface TencentScfHttpAdapterConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http: Partial<HttpConfig>
}

/**
 * Blueprint interface for the Tencent SCF Http Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * Tencent SCF Http adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `TencentScfHttpAdapterConfig` items.
 */
export interface TencentScfHttpAdapterBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  /**
   * Application-level settings, including environment, middleware, logging, and service registration.
   */
  stone: TencentScfHttpAdapterConfig
}

/**
 * Default blueprint configuration for the Tencent SCF Http Adapter.
 *
 * This blueprint defines the initial configuration for the Tencent SCF Http adapter
 * within the Stone.js framework. It includes:
 * - An alias for the Tencent SCF platform (`TENCENT_SCF_HTTP_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const tencentScfHttpAdapterBlueprint: TencentScfHttpAdapterBlueprint = {
  stone: {
    ...httpCoreBlueprint.stone,
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        variant: 'server',
        platform: TENCENT_SCF_HTTP_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware,
          MetaServerResponseMiddleware
        ],
        resolver: tencentScfHttpAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: TencentScfHttpErrorHandler, isClass: true }
        },
        default: isNotEmpty(getString('SCF_FUNCTIONNAME', ''))
      }
    ]
  }
}
