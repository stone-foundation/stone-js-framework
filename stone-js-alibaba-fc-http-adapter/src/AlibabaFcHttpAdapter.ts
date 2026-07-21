import { RawResponseWrapper } from './RawResponseWrapper'
import { Adapter, AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'
import { AlibabaFcHttpRequest, AlibabaFcHttpResponse, AlibabaFcHttpAdapterContext, AlibabaFcHttpEventHandlerFunction, AlibabaFcHttpExecutionContext, AlibabaFcHttpRawResponseOptions } from './declarations'

/**
 * Alibaba Cloud Function Compute HTTP adapter for Stone.js.
 *
 * FC's HTTP trigger (2.0) invokes the function with `(req, resp, context)`: a plain request object
 * (body pre-read into a `Buffer`) and an imperative response written via `setStatusCode`/
 * `setHeader`/`send`. `run()` does not start a server — it returns that handler, and the adapter
 * normalizes the request into an `IncomingHttpEvent`, runs the kernel, and writes the response.
 *
 * @remarks
 * FC 3.0 runs a container with a normal HTTP server, so it does not need this adapter, use
 * `@stone-js/node-http-adapter` there as-is.
 *
 * @example
 * ```ts
 * exports.handler = await AlibabaFcHttpAdapter.create(blueprint).run<AlibabaFcHttpEventHandlerFunction>()
 * ```
 */
export class AlibabaFcHttpAdapter extends Adapter<
AlibabaFcHttpRequest,
AlibabaFcHttpResponse,
AlibabaFcHttpExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
AlibabaFcHttpAdapterContext
> {
  /**
   * @param blueprint - The application blueprint.
   * @returns A new adapter instance.
   */
  static create (blueprint: IBlueprint): AlibabaFcHttpAdapter {
    return new this(blueprint)
  }

  /**
   * Start the adapter and return the FC HTTP handler `(req, resp, context)`.
   *
   * @returns The FC HTTP handler.
   */
  public async run<ExecutionResultType = AlibabaFcHttpEventHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (request: AlibabaFcHttpRequest, response: AlibabaFcHttpResponse, executionContext: AlibabaFcHttpExecutionContext = {}): Promise<void> => {
      await this.eventListener(request, response, executionContext)
    }

    return handler as ExecutionResultType
  }

  /**
   * Lifecycle hook run once before the first request.
   */
  protected async onStart (): Promise<void> {
    await this.executeHooks('onStart')
  }

  /**
   * Handle a single FC HTTP request, writing the response onto `resp`.
   *
   * @param rawEvent - The incoming FC request.
   * @param rawResponse - The imperative FC response object.
   * @param executionContext - The FC invocation context.
   * @returns The FC response object.
   */
  protected async eventListener (rawEvent: AlibabaFcHttpRequest, rawResponse: AlibabaFcHttpResponse, executionContext: AlibabaFcHttpExecutionContext): Promise<AlibabaFcHttpResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingHttpEventOptions, IncomingHttpEvent>({
      resolver: (options) => IncomingHttpEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<AlibabaFcHttpRawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(rawResponse, options)
    })

    const context: AlibabaFcHttpAdapterContext = {
      rawEvent,
      rawResponse,
      executionContext,
      rawResponseBuilder,
      incomingEventBuilder
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
