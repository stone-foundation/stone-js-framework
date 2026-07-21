import {
  RawResponse,
  AzureFunctionsEvent,
  AzureFunctionsContext,
  AzureFunctionsAdapterContext,
  AzureFunctionsEventHandlerFunction
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
import { AzureFunctionsAdapterError } from './errors/AzureFunctionsAdapterError'

/**
 * Azure Functions Adapter for Stone.js.
 *
 * The `AzureFunctionsAdapter` provides seamless integration between Stone.js applications
 * and the Azure Functions environment. It processes incoming events from Azure Functions,
 * transforms them into `IncomingEvent` instances, and returns a `RawResponse`.
 *
 * This adapter ensures compatibility with Azure Functions's execution model and
 * abstracts the event handling process for Stone.js developers.
 *
 * @template AzureFunctionsEvent - The type of the raw event received from Azure Functions.
 * @template RawResponse - The type of the response to send back to Azure Functions.
 * @template AzureFunctionsContext - The Azure Functions execution context type.
 * @template IncomingEvent - The type of the processed incoming event.
 * @template IncomingEventOptions - Options used to create an incoming event.
 * @template OutgoingResponse - The type of the outgoing response after processing.
 * @template AzureFunctionsAdapterContext - Context type specific to the adapter.
 *
 * @extends Adapter
 *
 * @example
 * ```typescript
 * import { AzureFunctionsAdapter } from '@stone-js/aws-lambda-adapter';
 *
 * const adapter = AzureFunctionsAdapter.create({...});
 *
 * const handler = await adapter.run();
 *
 * export { handler };
 * ```
 *
 * @see {@link https://stone-js.com/docs Stone.js Documentation}
 * @see {@link https://docs.aws.amazon.com/lambda/ Azure Functions Documentation}
 */
export class AzureFunctionsAdapter extends Adapter<
AzureFunctionsEvent,
RawResponse,
AzureFunctionsContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
AzureFunctionsAdapterContext
> {
  /**
   * Creates an instance of the `AzureFunctionsAdapter`.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `AzureFunctionsAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = AzureFunctionsAdapter.create(blueprint);
   * await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): AzureFunctionsAdapter {
    return new this(blueprint)
  }

  /**
   * Executes the adapter and provides an Azure Functions-compatible handler function.
   *
   * The `run` method initializes the adapter and returns a handler function
   * that Azure Functions can invoke. This handler processes events, manages context,
   * and returns the appropriate response.
   *
   * @template ExecutionResultType - The type representing the Azure Functions event handler function.
   * @returns A promise resolving to the Azure Functions handler function.
   * @throws {AzureFunctionsAdapterError} If used outside the Azure Functions environment.
   */
  public async run<ExecutionResultType = AzureFunctionsEventHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (rawEvent: AzureFunctionsEvent, executionContext: AzureFunctionsContext): Promise<RawResponse> => {
      return await this.eventListener(rawEvent, executionContext)
    }

    return handler as ExecutionResultType
  }

  /**
   * Initializes the adapter and validates its execution context.
   *
   * Ensures the adapter is running in an Azure Functions environment. If not, it
   * throws an error to prevent misuse.
   *
   * @throws {AzureFunctionsAdapterError} If executed outside an Azure Functions context (e.g., browser).
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new AzureFunctionsAdapterError(
        'This `AzureFunctionsAdapter` must be used only in Azure Functions context.'
      )
    }

    await this.executeHooks('onStart')
  }

  /**
   * Processes an incoming Azure Functions event.
   *
   * This method transforms the raw Azure Functions event into a Stone.js `IncomingEvent`,
   * processes it through the pipeline, and generates a `RawResponse` to send back.
   *
   * @param rawEvent - The raw Azure Functions event to be processed.
   * @param executionContext - The Azure Functions execution context for the event.
   * @returns A promise resolving to the processed `RawResponse`.
   */
  protected async eventListener (rawEvent: AzureFunctionsEvent, executionContext: AzureFunctionsContext): Promise<RawResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: (options) => IncomingEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const rawResponse: RawResponse = {}

    const context: AzureFunctionsAdapterContext = {
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

      // Azure only treats a trigger invocation (Queue Storage, Service Bus, Event Grid, Event Hub,
      // Timer, Blob) as failed when the handler REJECTS. Swallowing the error and returning a value
      // acknowledges the message and defeats the trigger's retry/poison-queue policy — silent data
      // loss. So by default we rethrow. An app that manages failures itself can opt out with
      // `stone.adapter.rethrowOnError = false`.
      if (this.blueprint.get<boolean>('stone.adapter.rethrowOnError', true)) {
        throw error
      }

      return response
    }
  }
}
