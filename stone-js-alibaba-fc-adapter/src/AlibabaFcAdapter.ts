import {
  RawResponse,
  AlibabaFcEvent,
  AlibabaFcContext,
  AlibabaFcAdapterContext,
  AlibabaFcEventHandlerFunction
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
import { AlibabaFcAdapterError } from './errors/AlibabaFcAdapterError'

/**
 * Alibaba FC Adapter for Stone.js.
 *
 * The `AlibabaFcAdapter` provides seamless integration between Stone.js applications
 * and the Alibaba FC environment. It processes incoming events from Alibaba FC,
 * transforms them into `IncomingEvent` instances, and returns a `RawResponse`.
 *
 * This adapter ensures compatibility with Alibaba FC's execution model and
 * abstracts the event handling process for Stone.js developers.
 *
 * @template AlibabaFcEvent - The type of the raw event received from Alibaba FC.
 * @template RawResponse - The type of the response to send back to Alibaba FC.
 * @template AlibabaFcContext - The Alibaba FC execution context type.
 * @template IncomingEvent - The type of the processed incoming event.
 * @template IncomingEventOptions - Options used to create an incoming event.
 * @template OutgoingResponse - The type of the outgoing response after processing.
 * @template AlibabaFcAdapterContext - Context type specific to the adapter.
 *
 * @extends Adapter
 *
 * @example
 * ```typescript
 * import { AlibabaFcAdapter } from '@stone-js/aws-lambda-adapter';
 *
 * const adapter = AlibabaFcAdapter.create({...});
 *
 * const handler = await adapter.run();
 *
 * export { handler };
 * ```
 *
 * @see {@link https://stone-js.com/docs Stone.js Documentation}
 * @see {@link https://docs.aws.amazon.com/lambda/ Alibaba FC Documentation}
 */
export class AlibabaFcAdapter extends Adapter<
AlibabaFcEvent,
RawResponse,
AlibabaFcContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
AlibabaFcAdapterContext
> {
  /**
   * Creates an instance of the `AlibabaFcAdapter`.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `AlibabaFcAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = AlibabaFcAdapter.create(blueprint);
   * await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): AlibabaFcAdapter {
    return new this(blueprint)
  }

  /**
   * Executes the adapter and provides an Alibaba FC-compatible handler function.
   *
   * The `run` method initializes the adapter and returns a handler function
   * that Alibaba FC can invoke. This handler processes events, manages context,
   * and returns the appropriate response.
   *
   * @template ExecutionResultType - The type representing the Alibaba FC event handler function.
   * @returns A promise resolving to the Alibaba FC handler function.
   * @throws {AlibabaFcAdapterError} If used outside the Alibaba FC environment.
   */
  public async run<ExecutionResultType = AlibabaFcEventHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (rawEvent: AlibabaFcEvent, executionContext: AlibabaFcContext): Promise<RawResponse> => {
      return await this.eventListener(rawEvent, executionContext)
    }

    return handler as ExecutionResultType
  }

  /**
   * Initializes the adapter and validates its execution context.
   *
   * Ensures the adapter is running in an Alibaba FC environment. If not, it
   * throws an error to prevent misuse.
   *
   * @throws {AlibabaFcAdapterError} If executed outside an Alibaba FC context (e.g., browser).
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new AlibabaFcAdapterError(
        'This `AlibabaFcAdapter` must be used only in Alibaba FC context.'
      )
    }

    await this.executeHooks('onStart')
  }

  /**
   * Processes an incoming Alibaba FC event.
   *
   * This method transforms the raw Alibaba FC event into a Stone.js `IncomingEvent`,
   * processes it through the pipeline, and generates a `RawResponse` to send back.
   *
   * @param rawEvent - The raw Alibaba FC event to be processed.
   * @param executionContext - The Alibaba FC execution context for the event.
   * @returns A promise resolving to the processed `RawResponse`.
   */
  protected async eventListener (rawEvent: AlibabaFcEvent, executionContext: AlibabaFcContext): Promise<RawResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: (options) => IncomingEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const rawResponse: RawResponse = {}

    const context: AlibabaFcAdapterContext = {
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

      // Alibaba FC only treats an event invocation (OSS, MNS, Timer, EventBridge, Log) as failed
      // when the handler REJECTS. Swallowing the error and returning a value acknowledges the event
      // and defeats FC's retry/dead-letter policy — silent data loss. So by default we rethrow. An
      // app that manages failures itself can opt out with `stone.adapter.rethrowOnError = false`.
      if (this.blueprint.get<boolean>('stone.adapter.rethrowOnError', true)) {
        throw error
      }

      return response
    }
  }
}
