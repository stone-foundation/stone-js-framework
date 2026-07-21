import {
  RawResponse,
  TencentScfEvent,
  TencentScfContext,
  TencentScfAdapterContext,
  TencentScfEventHandlerFunction
} from './declarations'
import {
  Adapter,
  IBlueprint,
  IncomingEvent,
  OutgoingResponse,
  RawResponseOptions,
  AdapterEventBuilder,
  IncomingEventOptions,
  AdapterEventHandlerType
} from '@stone-js/core'
import { RawResponseWrapper } from './RawResponseWrapper'
import { TencentScfAdapterError } from './errors/TencentScfAdapterError'

/**
 * Tencent SCF Adapter for Stone.js.
 *
 * The `TencentScfAdapter` provides seamless integration between Stone.js applications
 * and the Tencent SCF environment. It processes incoming events from Tencent SCF,
 * transforms them into `IncomingEvent` instances, and returns a `RawResponse`.
 *
 * This adapter ensures compatibility with Tencent SCF's execution model and
 * abstracts the event handling process for Stone.js developers.
 *
 * @template TencentScfEvent - The type of the raw event received from Tencent SCF.
 * @template RawResponse - The type of the response to send back to Tencent SCF.
 * @template TencentScfContext - The Tencent SCF execution context type.
 * @template IncomingEvent - The type of the processed incoming event.
 * @template IncomingEventOptions - Options used to create an incoming event.
 * @template OutgoingResponse - The type of the outgoing response after processing.
 * @template TencentScfAdapterContext - Context type specific to the adapter.
 *
 * @extends Adapter
 *
 * @example
 * ```typescript
 * import { TencentScfAdapter } from '@stone-js/aws-lambda-adapter';
 *
 * const adapter = TencentScfAdapter.create({...});
 *
 * const handler = await adapter.run();
 *
 * export { handler };
 * ```
 *
 * @see {@link https://stone-js.com/docs Stone.js Documentation}
 * @see {@link https://docs.aws.amazon.com/lambda/ Tencent SCF Documentation}
 */
export class TencentScfAdapter extends Adapter<
TencentScfEvent,
RawResponse,
TencentScfContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
TencentScfAdapterContext
> {
  /**
   * Creates an instance of the `TencentScfAdapter`.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `TencentScfAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = TencentScfAdapter.create(blueprint);
   * await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): TencentScfAdapter {
    return new this(blueprint)
  }

  /**
   * Executes the adapter and provides an Tencent SCF-compatible handler function.
   *
   * The `run` method initializes the adapter and returns a handler function
   * that Tencent SCF can invoke. This handler processes events, manages context,
   * and returns the appropriate response.
   *
   * @template ExecutionResultType - The type representing the Tencent SCF event handler function.
   * @returns A promise resolving to the Tencent SCF handler function.
   * @throws {TencentScfAdapterError} If used outside the Tencent SCF environment.
   */
  public async run<ExecutionResultType = TencentScfEventHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (rawEvent: TencentScfEvent, executionContext: TencentScfContext): Promise<RawResponse> => {
      return await this.eventListener(rawEvent, executionContext)
    }

    return handler as ExecutionResultType
  }

  /**
   * Initializes the adapter and validates its execution context.
   *
   * Ensures the adapter is running in an Tencent SCF environment. If not, it
   * throws an error to prevent misuse.
   *
   * @throws {TencentScfAdapterError} If executed outside an Tencent SCF context (e.g., browser).
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new TencentScfAdapterError(
        'This `TencentScfAdapter` must be used only in Tencent SCF context.'
      )
    }

    await this.executeHooks('onStart')
  }

  /**
   * Processes an incoming Tencent SCF event.
   *
   * This method transforms the raw Tencent SCF event into a Stone.js `IncomingEvent`,
   * processes it through the pipeline, and generates a `RawResponse` to send back.
   *
   * @param rawEvent - The raw Tencent SCF event to be processed.
   * @param executionContext - The Tencent SCF execution context for the event.
   * @returns A promise resolving to the processed `RawResponse`.
   */
  protected async eventListener (rawEvent: TencentScfEvent, executionContext: TencentScfContext): Promise<RawResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: (options) => IncomingEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const rawResponse: RawResponse = {}

    const context: TencentScfAdapterContext = {
      rawEvent,
      rawResponse,
      executionContext,
      rawResponseBuilder,
      incomingEventBuilder
    }

    let eventHandler: AdapterEventHandlerType<IncomingEvent, OutgoingResponse> | undefined

    try {
      eventHandler = this.resolveEventHandler()
      await this.executeEventHandlerHooks('onInit', eventHandler)
      return await this.sendEventThroughDestination(context, eventHandler)
    } catch (error: any) {
      const rawResponseBuilder = await this.handleError(error, context)
      // Pass `eventHandler` so the kernel's `onTerminate` (log flush, connection close) runs on the
      // error path too — the core only fires it when the handler is provided.
      const response = await this.buildRawResponse({ ...context, rawResponseBuilder }, eventHandler)

      // Tencent SCF only treats an event invocation (COS, CMQ/TDMQ, Timer, CKafka) as failed when
      // the handler REJECTS. Swallowing the error and returning a value acknowledges the event and
      // defeats SCF's retry / dead-letter policy — silent data loss. So by default we rethrow. An
      // app that manages failures itself can opt out with `stone.adapter.rethrowOnError = false`.
      if (this.blueprint.get<boolean>('stone.adapter.rethrowOnError', true)) {
        throw error
      }

      return response
    }
  }
}
