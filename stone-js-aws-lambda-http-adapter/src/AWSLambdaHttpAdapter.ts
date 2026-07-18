import {
  RawHttpResponse,
  AwsLambdaContext,
  AwsLambdaHttpEvent,
  RawHttpResponseOptions,
  AwsLambdaHttpAdapterContext,
  AwsLambdaEventHandlerFunction
} from './declarations'
import { RawHttpResponseWrapper } from './RawHttpResponseWrapper'
import { Adapter, AdapterEventBuilder, IBlueprint } from '@stone-js/core'
import { AwsLambdaHttpAdapterError } from './errors/AwsLambdaHttpAdapterError'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * AWS Lambda HTTP Adapter for Stone.js.
 *
 * The `AwsLambdaHttpAdapter` extends the functionality of the Stone.js `Adapter`
 * to provide seamless integration with AWS Lambda for HTTP-based events. This adapter
 * transforms incoming HTTP events from AWS Lambda into `IncomingHttpEvent` instances
 * and produces a `RawHttpResponse` as output.
 *
 * This adapter simplifies the process of handling HTTP events within AWS Lambda
 * while adhering to the Stone.js framework's event-driven architecture.
 *
 * @template AwsLambdaHttpEvent - The type of the raw HTTP event from AWS Lambda.
 * @template RawHttpResponse - The type of the raw HTTP response to send back.
 * @template AwsLambdaContext - The AWS Lambda execution context type.
 * @template IncomingHttpEvent - The type of the processed incoming HTTP event.
 * @template IncomingHttpEventOptions - Options used to create an incoming HTTP event.
 * @template OutgoingHttpResponse - The type of the outgoing HTTP response after processing.
 * @template AwsLambdaHttpAdapterContext - Context type specific to the HTTP adapter.
 *
 * @extends Adapter
 *
 * @example
 * ```typescript
 * import { AwsLambdaHttpAdapter } from '@stone-js/aws-lambda-http-adapter';
 *
 * const adapter = AwsLambdaHttpAdapter.create({...});
 *
 * const handler = await adapter.run();
 *
 * export { handler };
 * ```
 *
 * @see {@link https://stone-js.com/docs Stone.js Documentation}
 * @see {@link https://docs.aws.amazon.com/lambda/latest/dg/ AWS Lambda Documentation}
 */
export class AwsLambdaHttpAdapter extends Adapter<
AwsLambdaHttpEvent,
RawHttpResponse,
AwsLambdaContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
AwsLambdaHttpAdapterContext
> {
  /**
   * Creates an instance of the `AwsLambdaHttpAdapter`.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `AwsLambdaHttpAdapter`.
   *
   * @example
   * ```typescript
   * const adapter = AwsLambdaHttpAdapter.create(blueprint);
   * await adapter.run();
   * ```
   */
  static create (blueprint: IBlueprint): AwsLambdaHttpAdapter {
    return new this(blueprint)
  }

  /**
   * Executes the adapter and provides an AWS Lambda-compatible HTTP handler function.
   *
   * This method initializes the adapter and returns a handler function that can
   * process HTTP events in AWS Lambda. It transforms raw events into `IncomingHttpEvent`
   * instances and produces `RawHttpResponse` objects as output.
   *
   * @template ExecutionResultType - The type representing the AWS Lambda event handler function.
   * @returns A promise resolving to the AWS Lambda HTTP handler function.
   * @throws {AwsLambdaHttpAdapterError} If used outside the AWS Lambda environment.
   */
  public async run<ExecutionResultType = AwsLambdaEventHandlerFunction<RawHttpResponse>>(): Promise<ExecutionResultType> {
    await this.onStart()

    const handler = async (rawEvent: AwsLambdaHttpEvent, executionContext: AwsLambdaContext): Promise<RawHttpResponse> => {
      return await this.eventListener(rawEvent, executionContext)
    }

    return handler as ExecutionResultType
  }

  /**
   * Initializes the adapter and validates its execution context.
   *
   * Ensures that the adapter is running in an AWS Lambda environment. Throws an error
   * if it detects that the adapter is being used in an unsupported environment (e.g., a browser).
   *
   * @throws {AwsLambdaHttpAdapterError} If executed outside an AWS Lambda environment.
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new AwsLambdaHttpAdapterError(
        'This `AwsLambdaHttpAdapter` must be used only in AWS Lambda context.'
      )
    }

    await this.executeHooks('onStart')
  }

  /**
   * Processes an incoming AWS Lambda HTTP event.
   *
   * Converts a raw AWS Lambda HTTP event into an `IncomingHttpEvent`, processes it through
   * the Stone.js pipeline, and generates a `RawHttpResponse` to send back.
   *
   * @param rawEvent - The raw HTTP event received from AWS Lambda.
   * @param executionContext - The AWS Lambda execution context associated with the event.
   * @returns A promise resolving to the processed `RawHttpResponse`.
   */
  protected async eventListener (rawEvent: AwsLambdaHttpEvent, executionContext: AwsLambdaContext): Promise<RawHttpResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingHttpEventOptions, IncomingHttpEvent>({
      resolver: (options) => IncomingHttpEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawHttpResponseOptions, RawHttpResponseWrapper>({
      resolver: (options) => RawHttpResponseWrapper.create(options)
    })

    const rawResponse: RawHttpResponse = { statusCode: 500 }

    const context: AwsLambdaHttpAdapterContext = {
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
