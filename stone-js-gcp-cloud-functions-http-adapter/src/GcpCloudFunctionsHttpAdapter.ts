import {
  IncomingHttpEvent,
  OutgoingHttpResponse,
  IncomingHttpEventOptions
} from '@stone-js/http-core'
import {
  GcpHttpFunctionHandler,
  GcpHttpFunctionRequest,
  GcpHttpFunctionResponse,
  RawHttpResponseOptions,
  GcpCloudFunctionsHttpAdapterContext
} from './declarations'
import {
  Adapter,
  ILogger,
  IBlueprint,
  LoggerResolver,
  AdapterEventBuilder,
  defaultLoggerResolver
} from '@stone-js/core'
import chalk from 'chalk'
import { IncomingMessage, ServerResponse } from 'node:http'
import { ServerResponseWrapper } from './ServerResponseWrapper'
import { GcpCloudFunctionsHttpAdapterError } from './errors/GcpCloudFunctionsHttpAdapterError'

/* eslint-disable @typescript-eslint/no-misused-promises */
/**
 * GCP Cloud Functions HTTP Adapter for the Stone.js framework.
 *
 * The `GcpCloudFunctionsHttpAdapter` integrates a Google Cloud Functions HTTP function (the
 * Functions Framework `(req, res)` signature) with the Stone.js framework. It converts the incoming
 * Express-flavoured request into an `IncomingHttpEvent`, runs it through the kernel, and writes the
 * `OutgoingHttpResponse` back onto the response object.
 *
 * Unlike the Node HTTP adapter, it does NOT create or own an HTTP server: the platform owns the
 * process lifecycle and the socket. `run()` returns the handler that the Functions Framework invokes
 * per request.
 *
 * @remarks
 * **Cloud Run** runs a container with a normal long-running HTTP server, so it does not need this
 * adapter, use `@stone-js/node-http-adapter` as-is. This adapter is specifically for the event-driven
 * HTTP functions runtime (1st and 2nd gen Cloud Functions).
 *
 * @extends Adapter
 */
export class GcpCloudFunctionsHttpAdapter extends Adapter<
IncomingMessage,
ServerResponse,
undefined,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
GcpCloudFunctionsHttpAdapterContext
> {
  protected readonly logger: ILogger

  /**
   * Creates a new `GcpCloudFunctionsHttpAdapter` instance.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `GcpCloudFunctionsHttpAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = GcpCloudFunctionsHttpAdapter.create(blueprint);
   * const handler = await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): GcpCloudFunctionsHttpAdapter {
    return new this(blueprint)
  }

  /**
   * Constructs a `GcpCloudFunctionsHttpAdapter` instance.
   *
   * This constructor is protected and is intended to be used via the static `create` method.
   *
   * @param blueprint - The application blueprint for dependency resolution.
   */
  protected constructor (blueprint: IBlueprint) {
    super(blueprint)
    this.logger = blueprint.get<LoggerResolver>('stone.logger.resolver', defaultLoggerResolver)(blueprint)
  }

  /**
   * Boots the application and returns the HTTP function handler.
   *
   * Register the returned handler with the Functions Framework:
   * ```typescript
   * import * as functions from '@google-cloud/functions-framework'
   * functions.http('stone', await StoneFactory.create({ ...blueprint }).run())
   * ```
   *
   * @returns A promise resolving to the `(req, res)` handler invoked per request.
   *
   * @throws {GcpCloudFunctionsHttpAdapterError} If the adapter is used outside a Node.js context.
   */
  public async run<ExecutionResultType = GcpHttpFunctionHandler>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler: GcpHttpFunctionHandler = async (rawEvent, rawResponse) => await this.eventListener(rawEvent, rawResponse)

    return handler as ExecutionResultType
  }

  /**
   * Lifecycle hook for adapter initialization.
   *
   * The platform owns the process, so this only guards the runtime environment and fires the
   * `onStart` hooks; it does NOT bind process signals or a server (the runtime manages shutdown).
   *
   * @throws {GcpCloudFunctionsHttpAdapterError} If the adapter is used outside a Node.js context.
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new GcpCloudFunctionsHttpAdapterError(
        'This `GcpCloudFunctionsHttpAdapter` must be used only in a Node.js (GCP Cloud Functions) context.'
      )
    }

    await this.executeHooks('onStart')
  }

  /**
   * Handles an incoming HTTP request and sends it through the adapter's event pipeline.
   *
   * @param rawEvent - The raw GCP Cloud Functions HTTP request object.
   * @param rawResponse - The raw HTTP response object.
   * @returns A promise resolving to the `ServerResponse`.
   *
   * @protected
   */
  protected async eventListener (rawEvent: GcpHttpFunctionRequest, rawResponse: GcpHttpFunctionResponse): Promise<ServerResponse> {
    rawEvent.on('error', (error) => {
      rawResponse.statusCode = 400
      this.logger.error(chalk.red('Error in incoming event.'), { error })
    })

    rawResponse.on('error', (error) => {
      this.logger.error(chalk.red('Error in outgoing response.'), { error })
    })

    const incomingEventBuilder = AdapterEventBuilder.create<IncomingHttpEventOptions, IncomingHttpEvent>({
      resolver: (options) => IncomingHttpEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawHttpResponseOptions, ServerResponseWrapper>({
      resolver: (options) => ServerResponseWrapper.create(rawResponse, options)
    })

    const context: GcpCloudFunctionsHttpAdapterContext = {
      rawEvent,
      rawResponse,
      rawResponseBuilder,
      incomingEventBuilder,
      executionContext: undefined
    }

    try {
      const eventHandler = this.resolveEventHandler()
      await this.executeEventHandlerHooks('onInit', eventHandler)
      return await this.sendEventThroughDestination(context, eventHandler)
    } catch (error: any) {
      const rawResponseBuilder = await this.handleError(error, context)
      return await this.buildRawResponse({ ...context, rawResponseBuilder })
    }
  }
}
