import { getString } from '@stone-js/env'
import { ALIBABA_FC_PLATFORM } from '../constants'
import { alibabaFcAdapterResolver } from '../resolvers'
import { AlibabaFcErrorHandler } from '../AlibabaFcErrorHandler'
import { AlibabaFcContext, AlibabaFcEvent, RawResponse } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, isNotEmpty, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration interface for the Alibaba FC Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the Alibaba FC platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface AlibabaFcAdapterAdapterConfig extends AdapterConfig<
AlibabaFcEvent,
RawResponse,
AlibabaFcContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {}

/**
 * Blueprint interface for the Alibaba FC Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * Alibaba FC adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `AlibabaFcAdapterConfig` items.
 */
export interface AlibabaFcAdapterBlueprint extends StoneBlueprint {}

/**
 * Default blueprint configuration for the Alibaba FC Adapter.
 *
 * This blueprint defines the initial configuration for the Alibaba FC adapter
 * within the Stone.js framework. It includes:
 * - An alias for the Alibaba FC platform (`ALIBABA_FC_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const alibabaFcAdapterBlueprint: AlibabaFcAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        variant: 'server',
        platform: ALIBABA_FC_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: alibabaFcAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: AlibabaFcErrorHandler, isClass: true }
        },
        // The Alibaba FC runtime sets FC_FUNCTION_NAME in the function environment.
        default: isNotEmpty(getString('FC_FUNCTION_NAME', ''))
      }
    ]
  }
}
