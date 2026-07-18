import {
  RawResponse,
  AwsLambdaEvent,
  AwsLambdaContext,
  AwsLambdaAdapterContext,
  AwsLambdaEventHandlerFunction
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
import { AwsLambdaAdapterError } from './errors/AwsLambdaAdapterError'

/**
 * AWS Lambda Adapter for Stone.js.
 *
 * The `AwsLambdaAdapter` provides seamless integration between Stone.js applications
 * and the AWS Lambda environment. It processes incoming events from AWS Lambda,
 * transforms them into `IncomingEvent` instances, and returns a `RawResponse`.
 *
 * This adapter ensures compatibility with AWS Lambda's execution model and
 * abstracts the event handling process for Stone.js developers.
 *
 * @template AwsLambdaEvent - The type of the raw event received from AWS Lambda.
 * @template RawResponse - The type of the response to send back to AWS Lambda.
 * @template AwsLambdaContext - The AWS Lambda execution context type.
 * @template IncomingEvent - The type of the processed incoming event.
 * @template IncomingEventOptions - Options used to create an incoming event.
 * @template OutgoingResponse - The type of the outgoing response after processing.
 * @template AwsLambdaAdapterContext - Context type specific to the adapter.
 *
 * @extends Adapter
 *
 * @example
 * ```typescript
 * import { AwsLambdaAdapter } from '@stone-js/aws-lambda-adapter';
 *
 * const adapter = AwsLambdaAdapter.create({...});
 *
 * const handler = await adapter.run();
 *
 * export { handler };
 * ```
 *
 * @see {@link https://stone-js.com/docs Stone.js Documentation}
 * @see {@link https://docs.aws.amazon.com/lambda/ AWS Lambda Documentation}
 */
export class AwsLambdaAdapter extends Adapter<
AwsLambdaEvent,
RawResponse,
AwsLambdaContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
AwsLambdaAdapterContext
> {
  /**
   * Creates an instance of the `AwsLambdaAdapter`.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `AwsLambdaAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = AwsLambdaAdapter.create(blueprint);
   * await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): AwsLambdaAdapter {
    return new this(blueprint)
  }

  /**
   * Executes the adapter and provides an AWS Lambda-compatible handler function.
   *
   * The `run` method initializes the adapter and returns a handler function
   * that AWS Lambda can invoke. This handler processes events, manages context,
   * and returns the appropriate response.
   *
   * @template ExecutionResultType - The type representing the AWS Lambda event handler function.
   * @returns A promise resolving to the AWS Lambda handler function.
   * @throws {AwsLambdaAdapterError} If used outside the AWS Lambda environment.
   */
  public async run<ExecutionResultType = AwsLambdaEventHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (rawEvent: AwsLambdaEvent, executionContext: AwsLambdaContext): Promise<RawResponse> => {
      return await this.eventListener(rawEvent, executionContext)
    }

    return handler as ExecutionResultType
  }

  /**
   * Initializes the adapter and validates its execution context.
   *
   * Ensures the adapter is running in an AWS Lambda environment. If not, it
   * throws an error to prevent misuse.
   *
   * @throws {AwsLambdaAdapterError} If executed outside an AWS Lambda context (e.g., browser).
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new AwsLambdaAdapterError(
        'This `AwsLambdaAdapter` must be used only in AWS Lambda context.'
      )
    }

    await this.executeHooks('onStart')
  }

  /**
   * Processes an incoming AWS Lambda event.
   *
   * This method transforms the raw AWS Lambda event into a Stone.js `IncomingEvent`,
   * processes it through the pipeline, and generates a `RawResponse` to send back.
   *
   * @param rawEvent - The raw AWS Lambda event to be processed.
   * @param executionContext - The AWS Lambda execution context for the event.
   * @returns A promise resolving to the processed `RawResponse`.
   */
  protected async eventListener (rawEvent: AwsLambdaEvent, executionContext: AwsLambdaContext): Promise<RawResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: (options) => IncomingEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const rawResponse: RawResponse = {}

    const context: AwsLambdaAdapterContext = {
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

      // AWS only treats an async invocation (SQS, SNS, EventBridge, S3, schedulers) as failed when
      // the handler REJECTS. Swallowing the error and returning a value deletes the message from
      // the queue and defeats retries/DLQ/batchItemFailures — silent data loss. So by default we
      // rethrow. An app that manages failures itself (e.g. returns `batchItemFailures`) can opt out
      // with `stone.adapter.rethrowOnError = false`.
      if (this.blueprint.get<boolean>('stone.adapter.rethrowOnError', true)) {
        throw error
      }

      return response
    }
  }
}
