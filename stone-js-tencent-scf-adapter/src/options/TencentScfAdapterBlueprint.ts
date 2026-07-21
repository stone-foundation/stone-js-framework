import { getString } from '@stone-js/env'
import { TENCENT_SCF_PLATFORM } from '../constants'
import { tencentScfAdapterResolver } from '../resolvers'
import { TencentScfErrorHandler } from '../TencentScfErrorHandler'
import { TencentScfContext, TencentScfEvent, RawResponse } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, isNotEmpty, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration interface for the Tencent SCF Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the Tencent SCF platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface TencentScfAdapterAdapterConfig extends AdapterConfig<
TencentScfEvent,
RawResponse,
TencentScfContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {}

/**
 * Blueprint interface for the Tencent SCF Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * Tencent SCF adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `TencentScfAdapterConfig` items.
 */
export interface TencentScfAdapterBlueprint extends StoneBlueprint {}

/**
 * Default blueprint configuration for the Tencent SCF Adapter.
 *
 * This blueprint defines the initial configuration for the Tencent SCF adapter
 * within the Stone.js framework. It includes:
 * - An alias for the Tencent SCF platform (`TENCENT_SCF_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const tencentScfAdapterBlueprint: TencentScfAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        variant: 'server',
        platform: TENCENT_SCF_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: tencentScfAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: TencentScfErrorHandler, isClass: true }
        },
        // The Tencent SCF runtime sets SCF_FUNCTIONNAME in the function environment.
        default: isNotEmpty(getString('SCF_FUNCTIONNAME', ''))
      }
    ]
  }
}
