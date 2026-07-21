import {
  RawHttpResponse,
  TencentScfContext,
  TencentScfHttpEvent,
  RawHttpResponseOptions,
  TencentScfHttpAdapterContext,
  TencentScfEventHandlerFunction
} from './declarations'
import { RawHttpResponseWrapper } from './RawHttpResponseWrapper'
import { Adapter, AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { TencentScfHttpAdapterError } from './errors/TencentScfHttpAdapterError'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * Tencent SCF HTTP Adapter for Stone.js.
 *
 * The `TencentScfHttpAdapter` extends the functionality of the Stone.js `Adapter`
 * to provide seamless integration with Tencent SCF for HTTP-based events. This adapter
 * transforms incoming HTTP events from Tencent SCF into `IncomingHttpEvent` instances
 * and produces a `RawHttpResponse` as output.
 *
 * This adapter simplifies the process of handling HTTP events within Tencent SCF
 * while adhering to the Stone.js framework's event-driven architecture.
 *
 * @template TencentScfHttpEvent - The type of the raw HTTP event from Tencent SCF.
 * @template RawHttpResponse - The type of the raw HTTP response to send back.
 * @template TencentScfContext - The Tencent SCF execution context type.
 * @template IncomingHttpEvent - The type of the processed incoming HTTP event.
 * @template IncomingHttpEventOptions - Options used to create an incoming HTTP event.
 * @template OutgoingHttpResponse - The type of the outgoing HTTP response after processing.
 * @template TencentScfHttpAdapterContext - Context type specific to the HTTP adapter.
 *
 * @extends Adapter
 *
 * @example
 * ```typescript
 * import { TencentScfHttpAdapter } from '@stone-js/aws-lambda-http-adapter';
 *
 * const adapter = TencentScfHttpAdapter.create({...});
 *
 * const handler = await adapter.run();
 *
 * export { handler };
 * ```
 *
 * @see {@link https://stone-js.com/docs Stone.js Documentation}
 * @see {@link https://docs.aws.amazon.com/lambda/latest/dg/ Tencent SCF Documentation}
 */
export class TencentScfHttpAdapter extends Adapter<
TencentScfHttpEvent,
RawHttpResponse,
TencentScfContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
TencentScfHttpAdapterContext
> {
  /**
   * Creates an instance of the `TencentScfHttpAdapter`.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `TencentScfHttpAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = TencentScfHttpAdapter.create(blueprint);
   * await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): TencentScfHttpAdapter {
    return new this(blueprint)
  }

  /**
   * Executes the adapter and provides an Tencent SCF-compatible HTTP handler function.
   *
   * This method initializes the adapter and returns a handler function that can
   * process HTTP events in Tencent SCF. It transforms raw events into `IncomingHttpEvent`
   * instances and produces `RawHttpResponse` objects as output.
   *
   * @template ExecutionResultType - The type representing the Tencent SCF event handler function.
   * @returns A promise resolving to the Tencent SCF HTTP handler function.
   * @throws {TencentScfHttpAdapterError} If used outside the Tencent SCF environment.
   */
  public async run<ExecutionResultType = TencentScfEventHandlerFunction<RawHttpResponse>>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (rawEvent: TencentScfHttpEvent, executionContext: TencentScfContext): Promise<RawHttpResponse> => {
      return await this.eventListener(rawEvent, executionContext)
    }

    return handler as ExecutionResultType
  }

  /**
   * Initializes the adapter and validates its execution context.
   *
   * Ensures that the adapter is running in an Tencent SCF environment. Throws an error
   * if it detects that the adapter is being used in an unsupported environment (e.g., a browser).
   *
   * @throws {TencentScfHttpAdapterError} If executed outside an Tencent SCF environment.
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new TencentScfHttpAdapterError(
        'This `TencentScfHttpAdapter` must be used only in Tencent SCF context.'
      )
    }

    await this.executeHooks('onStart')
  }

  /**
   * Processes an incoming Tencent SCF HTTP event.
   *
   * Converts a raw Tencent SCF HTTP event into an `IncomingHttpEvent`, processes it through
   * the Stone.js pipeline, and generates a `RawHttpResponse` to send back.
   *
   * @param rawEvent - The raw HTTP event received from Tencent SCF.
   * @param executionContext - The Tencent SCF execution context associated with the event.
   * @returns A promise resolving to the processed `RawHttpResponse`.
   */
  protected async eventListener (rawEvent: TencentScfHttpEvent, executionContext: TencentScfContext): Promise<RawHttpResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingHttpEventOptions, IncomingHttpEvent>({
      resolver: (options) => IncomingHttpEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawHttpResponseOptions, RawHttpResponseWrapper>({
      resolver: (options) => RawHttpResponseWrapper.create(options)
    })

    const rawResponse: RawHttpResponse = { statusCode: 500 }

    const context: TencentScfHttpAdapterContext = {
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
