import { getString } from '@stone-js/env'
import { AWS_APIGW_WS_PLATFORM } from '../constants'
import { apiGatewayWsAdapterResolver } from '../resolvers'
import { ApiGatewayWsErrorHandler } from '../ApiGatewayWsErrorHandler'
import { ApiGatewayWsEvent, RawWsResponse, LambdaContext } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, isNotEmpty, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration for the API Gateway WebSocket adapter.
 */
export interface ApiGatewayWsAdapterAdapterConfig extends AdapterConfig<
ApiGatewayWsEvent,
RawWsResponse,
LambdaContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {}

/**
 * Blueprint for the API Gateway WebSocket adapter.
 */
export interface ApiGatewayWsAdapterBlueprint extends StoneBlueprint {}

/**
 * Default blueprint for the API Gateway WebSocket adapter.
 *
 * Registers the adapter under the `aws_apigw_ws` platform. It becomes the default adapter when
 * running inside AWS Lambda (`AWS_LAMBDA_FUNCTION_NAME` is set).
 */
export const apiGatewayWsAdapterBlueprint: ApiGatewayWsAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        variant: 'server',
        platform: AWS_APIGW_WS_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: apiGatewayWsAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: ApiGatewayWsErrorHandler, isClass: true }
        },
        default: isNotEmpty(getString('AWS_LAMBDA_FUNCTION_NAME', ''))
      }
    ]
  }
}
