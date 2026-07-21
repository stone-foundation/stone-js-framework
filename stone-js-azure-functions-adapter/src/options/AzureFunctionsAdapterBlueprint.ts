import { getString } from '@stone-js/env'
import { AZURE_FUNCTIONS_PLATFORM } from '../constants'
import { azureFunctionsAdapterResolver } from '../resolvers'
import { AzureFunctionsErrorHandler } from '../AzureFunctionsErrorHandler'
import { AzureFunctionsContext, AzureFunctionsEvent, RawResponse } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, isNotEmpty, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration interface for the Azure Functions Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the Azure Functions platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface AzureFunctionsAdapterAdapterConfig extends AdapterConfig<
AzureFunctionsEvent,
RawResponse,
AzureFunctionsContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {}

/**
 * Blueprint interface for the Azure Functions Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * Azure Functions adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `AzureFunctionsAdapterConfig` items.
 */
export interface AzureFunctionsAdapterBlueprint extends StoneBlueprint {}

/**
 * Default blueprint configuration for the Azure Functions Adapter.
 *
 * This blueprint defines the initial configuration for the Azure Functions adapter
 * within the Stone.js framework. It includes:
 * - An alias for the Azure Functions platform (`AZURE_FUNCTIONS_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const azureFunctionsAdapterBlueprint: AzureFunctionsAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        variant: 'server',
        platform: AZURE_FUNCTIONS_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: azureFunctionsAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: AzureFunctionsErrorHandler, isClass: true }
        },
        // The Azure Functions Node worker sets FUNCTIONS_WORKER_RUNTIME in the runtime.
        default: isNotEmpty(getString('FUNCTIONS_WORKER_RUNTIME', ''))
      }
    ]
  }
}
