import {
  RawResponse,
  GcpCloudFunctionsEvent,
  GcpCloudFunctionsContext,
  GcpCloudFunctionsAdapterContext,
  GcpCloudFunctionsEventHandlerFunction
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
import { GcpCloudFunctionsAdapterError } from './errors/GcpCloudFunctionsAdapterError'

/**
 * GCP Cloud Functions Adapter for Stone.js.
 *
 * The `GcpCloudFunctionsAdapter` provides seamless integration between Stone.js applications
 * and the GCP Cloud Functions environment. It processes incoming events from GCP Cloud Functions,
 * transforms them into `IncomingEvent` instances, and returns a `RawResponse`.
 *
 * This adapter ensures compatibility with GCP Cloud Functions's execution model and
 * abstracts the event handling process for Stone.js developers.
 *
 * @template GcpCloudFunctionsEvent - The type of the raw event received from GCP Cloud Functions.
 * @template RawResponse - The type of the response to send back to GCP Cloud Functions.
 * @template GcpCloudFunctionsContext - The GCP Cloud Functions execution context type.
 * @template IncomingEvent - The type of the processed incoming event.
 * @template IncomingEventOptions - Options used to create an incoming event.
 * @template OutgoingResponse - The type of the outgoing response after processing.
 * @template GcpCloudFunctionsAdapterContext - Context type specific to the adapter.
 *
 * @extends Adapter
 *
 * @example
 * ```typescript
 * import { GcpCloudFunctionsAdapter } from '@stone-js/aws-lambda-adapter';
 *
 * const adapter = GcpCloudFunctionsAdapter.create({...});
 *
 * const handler = await adapter.run();
 *
 * export { handler };
 * ```
 *
 * @see {@link https://stone-js.com/docs Stone.js Documentation}
 * @see {@link https://docs.aws.amazon.com/lambda/ GCP Cloud Functions Documentation}
 */
export class GcpCloudFunctionsAdapter extends Adapter<
GcpCloudFunctionsEvent,
RawResponse,
GcpCloudFunctionsContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
GcpCloudFunctionsAdapterContext
> {
  /**
   * Creates an instance of the `GcpCloudFunctionsAdapter`.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `GcpCloudFunctionsAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = GcpCloudFunctionsAdapter.create(blueprint);
   * await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): GcpCloudFunctionsAdapter {
    return new this(blueprint)
  }

  /**
   * Executes the adapter and provides an GCP Cloud Functions-compatible handler function.
   *
   * The `run` method initializes the adapter and returns a handler function
   * that GCP Cloud Functions can invoke. This handler processes events, manages context,
   * and returns the appropriate response.
   *
   * @template ExecutionResultType - The type representing the GCP Cloud Functions event handler function.
   * @returns A promise resolving to the GCP Cloud Functions handler function.
   * @throws {GcpCloudFunctionsAdapterError} If used outside the GCP Cloud Functions environment.
   */
  public async run<ExecutionResultType = GcpCloudFunctionsEventHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (rawEvent: GcpCloudFunctionsEvent, executionContext?: GcpCloudFunctionsContext): Promise<RawResponse> => {
      return await this.eventListener(rawEvent, executionContext)
    }

    return handler as ExecutionResultType
  }

  /**
   * Initializes the adapter and validates its execution context.
   *
   * Ensures the adapter is running in an GCP Cloud Functions environment. If not, it
   * throws an error to prevent misuse.
   *
   * @throws {GcpCloudFunctionsAdapterError} If executed outside an GCP Cloud Functions context (e.g., browser).
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new GcpCloudFunctionsAdapterError(
        'This `GcpCloudFunctionsAdapter` must be used only in GCP Cloud Functions context.'
      )
    }

    await this.executeHooks('onStart')
  }

  /**
   * Processes an incoming GCP Cloud Functions event.
   *
   * This method transforms the raw GCP Cloud Functions event into a Stone.js `IncomingEvent`,
   * processes it through the pipeline, and generates a `RawResponse` to send back.
   *
   * @param rawEvent - The raw GCP Cloud Functions event to be processed.
   * @param executionContext - The GCP Cloud Functions execution context for the event.
   * @returns A promise resolving to the processed `RawResponse`.
   */
  protected async eventListener (rawEvent: GcpCloudFunctionsEvent, executionContext?: GcpCloudFunctionsContext): Promise<RawResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: (options) => IncomingEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const rawResponse: RawResponse = {}

    const context: GcpCloudFunctionsAdapterContext = {
      rawEvent,
      rawResponse,
      // CloudEvent handlers receive no separate context; fall back to an empty one.
      executionContext: executionContext ?? {},
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

      // GCP only treats an event-driven invocation (Pub/Sub, Cloud Storage, Eventarc, schedulers) as
      // failed when the handler REJECTS. Swallowing the error and returning a value acknowledges the
      // event and defeats the platform's retry policy — silent data loss. So by default we rethrow.
      // An app that manages failures itself can opt out with `stone.adapter.rethrowOnError = false`.
      if (this.blueprint.get<boolean>('stone.adapter.rethrowOnError', true)) {
        throw error
      }

      return response
    }
  }
}
