import { TestClient } from './TestClient'
import { TestAdapterContext, TestExecutionContext } from './declarations'
import {
  Adapter,
  IBlueprint,
  IncomingEvent,
  OutgoingResponse,
  AdapterEventBuilder,
  IRawResponseWrapper,
  IncomingEventOptions
} from '@stone-js/core'

/**
 * An in-memory adapter used only for tests.
 *
 * Instead of a server, `run()` returns a {@link TestClient} whose `send` pushes a caller-supplied
 * `IncomingEvent` straight through the real adapter + kernel pipeline and returns the resulting
 * `OutgoingResponse`. There is no request normalisation (you provide a ready event) and the raw
 * response IS the outgoing response, so assertions see exactly what your handlers produced.
 */
export class TestAdapter extends Adapter<
IncomingEvent,
OutgoingResponse,
TestExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
TestAdapterContext
> {
  /**
   * @param blueprint - The application blueprint.
   * @returns A new adapter instance.
   */
  static create (blueprint: IBlueprint): TestAdapter {
    return new this(blueprint)
  }

  /**
   * Start the adapter and return a test client.
   *
   * @returns The test client.
   */
  async run<ExecutionResultType = TestClient>(): Promise<ExecutionResultType> {
    await this.onStart()
    return new TestClient(async (event) => await this.dispatch(event)) as ExecutionResultType
  }

  /**
   * Lifecycle hook run once before the first dispatch.
   */
  protected async onStart (): Promise<void> {
    await this.executeHooks('onStart')
  }

  /**
   * Dispatch one event through the kernel and return the outgoing response.
   *
   * @param event - The incoming event.
   * @returns The outgoing response.
   */
  protected async dispatch (event: IncomingEvent): Promise<OutgoingResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: () => event
    })

    // The wrapper's `respond` is a required-by-type placeholder that is never invoked: this
    // adapter overrides `buildRawResponse` to return the outgoing response directly.
    const rawResponseBuilder = AdapterEventBuilder.create<Record<PropertyKey, unknown>, IRawResponseWrapper<OutgoingResponse>>({
      resolver: () => ({ respond: () => undefined as unknown as OutgoingResponse })
    })

    const context: TestAdapterContext = { rawEvent: event, executionContext: {}, incomingEventBuilder, rawResponseBuilder }

    const eventHandler = this.resolveEventHandler()
    await this.executeEventHandlerHooks('onInit', eventHandler)
    return await this.sendEventThroughDestination(context, eventHandler)
  }

  /**
   * The raw response for a test IS the outgoing response the handlers produced.
   *
   * @param context - The adapter context.
   * @returns The outgoing response.
   */
  protected async buildRawResponse (context: TestAdapterContext): Promise<OutgoingResponse> {
    await this.executeHooks('onBuildingRawResponse', context)
    return context.outgoingResponse as OutgoingResponse
  }
}
