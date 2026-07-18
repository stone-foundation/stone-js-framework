import { getString } from '@stone-js/env'
import { AWS_LAMBDA_PLATFORM } from '../constants'
import { awsLambdaAdapterResolver } from '../resolvers'
import { AwsLambdaErrorHandler } from '../AwsLambdaErrorHandler'
import { AwsLambdaContext, AwsLambdaEvent, RawResponse } from '../declarations'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, defaultKernelResolver, IncomingEvent, IncomingEventOptions, isNotEmpty, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration interface for the AWS Lambda Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the AWS Lambda platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface AwsLambdaAdapterAdapterConfig extends AdapterConfig<
AwsLambdaEvent,
RawResponse,
AwsLambdaContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {}

/**
 * Blueprint interface for the AWS Lambda Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * AWS Lambda adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `AwsLambdaAdapterConfig` items.
 */
export interface AwsLambdaAdapterBlueprint extends StoneBlueprint {}

/**
 * Default blueprint configuration for the AWS Lambda Adapter.
 *
 * This blueprint defines the initial configuration for the AWS Lambda adapter
 * within the Stone.js framework. It includes:
 * - An alias for the AWS Lambda platform (`AWS_LAMBDA_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const awsLambdaAdapterBlueprint: AwsLambdaAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        variant: 'server',
        platform: AWS_LAMBDA_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: awsLambdaAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: AwsLambdaErrorHandler, isClass: true }
        },
        default: isNotEmpty(getString('AWS_LAMBDA_FUNCTION_NAME', ''))
      }
    ]
  }
}
