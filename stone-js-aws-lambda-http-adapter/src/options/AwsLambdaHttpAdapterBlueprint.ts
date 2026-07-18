import { getString } from '@stone-js/env'
import { AWS_LAMBDA_HTTP_PLATFORM } from '../constants'
import { awsLambdaHttpAdapterResolver } from '../resolvers'
import { AwsLambdaHttpErrorHandler } from '../AwsLambdaHttpErrorHandler'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../middleware/ServerResponseMiddleware'
import { AwsLambdaContext, AwsLambdaHttpEvent, RawHttpResponse } from '../declarations'
import { AdapterConfig, AppConfig, defaultKernelResolver, isNotEmpty, StoneBlueprint } from '@stone-js/core'
import { HttpConfig, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, httpCoreBlueprint } from '@stone-js/http-core'

/**
 * Configuration interface for the AWS Lambda Http Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the AWS Lambda platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface AwsLambdaHttpAdapterAdapterConfig extends AdapterConfig<
AwsLambdaHttpEvent,
RawHttpResponse,
AwsLambdaContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {}

/**
 * Represents the AwsLambdaHttpAdapterConfig configuration options for the application.
 */
export interface AwsLambdaHttpAdapterConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http: Partial<HttpConfig>
}

/**
 * Blueprint interface for the AWS Lambda Http Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * AWS Lambda Http adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `AwsLambdaHttpAdapterConfig` items.
 */
export interface AwsLambdaHttpAdapterBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  /**
   * Application-level settings, including environment, middleware, logging, and service registration.
   */
  stone: AwsLambdaHttpAdapterConfig
}

/**
 * Default blueprint configuration for the AWS Lambda Http Adapter.
 *
 * This blueprint defines the initial configuration for the AWS Lambda Http adapter
 * within the Stone.js framework. It includes:
 * - An alias for the AWS Lambda platform (`AWS_LAMBDA_HTTP_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const awsLambdaHttpAdapterBlueprint: AwsLambdaHttpAdapterBlueprint = {
  stone: {
    ...httpCoreBlueprint.stone,
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    adapters: [
      {
        current: false,
        variant: 'server',
        platform: AWS_LAMBDA_HTTP_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware,
          MetaServerResponseMiddleware
        ],
        resolver: awsLambdaHttpAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: AwsLambdaHttpErrorHandler, isClass: true }
        },
        default: isNotEmpty(getString('AWS_LAMBDA_FUNCTION_NAME', ''))
      }
    ]
  }
}
