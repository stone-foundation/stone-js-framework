import { getString } from '@stone-js/env'
import { GCP_CLOUD_FUNCTIONS_PLATFORM } from '../constants'
import { gcpCloudFunctionsAdapterResolver } from '../resolvers'
import { GcpCloudFunctionsErrorHandler } from '../GcpCloudFunctionsErrorHandler'
import { GcpCloudFunctionsContext, GcpCloudFunctionsEvent, RawResponse } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, isNotEmpty, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration interface for the GCP Cloud Functions Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the GCP Cloud Functions platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface GcpCloudFunctionsAdapterAdapterConfig extends AdapterConfig<
GcpCloudFunctionsEvent,
RawResponse,
GcpCloudFunctionsContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {}

/**
 * Blueprint interface for the GCP Cloud Functions Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * GCP Cloud Functions adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `GcpCloudFunctionsAdapterConfig` items.
 */
export interface GcpCloudFunctionsAdapterBlueprint extends StoneBlueprint {}

/**
 * Default blueprint configuration for the GCP Cloud Functions Adapter.
 *
 * This blueprint defines the initial configuration for the GCP Cloud Functions adapter
 * within the Stone.js framework. It includes:
 * - An alias for the GCP Cloud Functions platform (`GCP_CLOUD_FUNCTIONS_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const gcpCloudFunctionsAdapterBlueprint: GcpCloudFunctionsAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        variant: 'server',
        platform: GCP_CLOUD_FUNCTIONS_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: gcpCloudFunctionsAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: GcpCloudFunctionsErrorHandler, isClass: true }
        },
        // The Functions Framework sets FUNCTION_TARGET in the Cloud Functions runtime (1st & 2nd gen).
        default: isNotEmpty(getString('FUNCTION_TARGET', ''))
      }
    ]
  }
}
