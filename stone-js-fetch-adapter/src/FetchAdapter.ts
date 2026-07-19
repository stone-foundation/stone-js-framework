import { RawResponseWrapper } from './RawResponseWrapper'
import { Adapter, AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'
import { FetchAdapterContext, FetchEventHandlerFunction, FetchExecutionContext, FetchRawResponseOptions } from './declarations'

/**
 * Web-standard (WinterCG Fetch) adapter for Stone.js.
 *
 * Unlike a server adapter, `run()` does not start a listener — it returns a Fetch handler
 * `(request, executionContext?) => Promise<Response>`, exactly what every WinterCG runtime
 * expects. Wire it once and deploy the same build to Cloudflare Workers, Deno, Bun, Vercel Edge
 * or Netlify Edge.
 *
 * @example
 * ```ts
 * const handle = await FetchAdapter.create(blueprint).run<FetchEventHandlerFunction>()
 * export default { fetch: handle } // Cloudflare / Deno / Bun / Edge
 * ```
 */
export class FetchAdapter extends Adapter<
Request,
Response,
FetchExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
FetchAdapterContext
> {
  /**
   * @param blueprint - The application blueprint.
   * @returns A new adapter instance.
   */
  static create (blueprint: IBlueprint): FetchAdapter {
    return new this(blueprint)
  }

  /**
   * Start the adapter and return a Fetch handler.
   *
   * @returns The Fetch handler.
   */
  public async run<ExecutionResultType = FetchEventHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (request: Request, executionContext: FetchExecutionContext = {}): Promise<Response> => {
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
   * Handle a single Web `Request`, producing a Web `Response`.
   *
   * @param rawEvent - The incoming request.
   * @param executionContext - The runtime-provided context (e.g. Cloudflare `env`/`ctx`).
   * @returns The response.
   */
  protected async eventListener (rawEvent: Request, executionContext: FetchExecutionContext): Promise<Response> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingHttpEventOptions, IncomingHttpEvent>({
      resolver: (options) => IncomingHttpEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<FetchRawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const context: FetchAdapterContext = {
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
