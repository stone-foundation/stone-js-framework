import { RawResponseWrapper } from './RawResponseWrapper'
import { Adapter, AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'
import { AzureHttpRequest, AzureHttpResponseInit, AzureFunctionsHttpAdapterContext, AzureFunctionsHttpEventHandlerFunction, AzureFunctionsHttpExecutionContext, AzureFunctionsHttpRawResponseOptions } from './declarations'

/**
 * Azure Functions v4 HTTP adapter for Stone.js.
 *
 * Azure Functions v4 invokes an HTTP-triggered function with a Web-standard `HttpRequest` and
 * expects an `HttpResponseInit` back. Unlike a server adapter, `run()` does not start a listener —
 * it returns the handler `(request, invocationContext) => Promise<HttpResponseInit>` that you
 * register with `app.http('name', { handler })` from `@azure/functions`.
 *
 * Because the request is Web-standard, the normalizer is the same one the Fetch adapter uses; only
 * the raw response differs (an `HttpResponseInit` object rather than a `Response`).
 *
 * @example
 * ```ts
 * import { app } from '@azure/functions'
 * const handler = await AzureFunctionsHttpAdapter.create(blueprint).run<AzureFunctionsHttpEventHandlerFunction>()
 * app.http('stone', { methods: ['GET', 'POST'], authLevel: 'anonymous', handler })
 * ```
 */
export class AzureFunctionsHttpAdapter extends Adapter<
AzureHttpRequest,
AzureHttpResponseInit,
AzureFunctionsHttpExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
AzureFunctionsHttpAdapterContext
> {
  /**
   * @param blueprint - The application blueprint.
   * @returns A new adapter instance.
   */
  static create (blueprint: IBlueprint): AzureFunctionsHttpAdapter {
    return new this(blueprint)
  }

  /**
   * Start the adapter and return the Azure Functions HTTP handler.
   *
   * @returns The Azure Functions HTTP handler.
   */
  public async run<ExecutionResultType = AzureFunctionsHttpEventHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (request: AzureHttpRequest, executionContext: AzureFunctionsHttpExecutionContext = {}): Promise<AzureHttpResponseInit> => {
      return await this.eventListener(request, executionContext)
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
   * Handle a single Azure `HttpRequest`, producing an `HttpResponseInit`.
   *
   * @param rawEvent - The incoming request.
   * @param executionContext - The Azure invocation context.
   * @returns The response init.
   */
  protected async eventListener (rawEvent: AzureHttpRequest, executionContext: AzureFunctionsHttpExecutionContext): Promise<AzureHttpResponseInit> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingHttpEventOptions, IncomingHttpEvent>({
      resolver: (options) => IncomingHttpEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<AzureFunctionsHttpRawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const context: AzureFunctionsHttpAdapterContext = {
      rawEvent,
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
