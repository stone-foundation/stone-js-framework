import { RawResponseWrapper } from './RawResponseWrapper'
import { NativeAdapterContext, NativeResponse, RawNativeResponseOptions } from './declarations'
import { NativeEventSource, NativeNavigationEvent, nativeEventSource } from './NativeEventSource'
import { Adapter, AdapterEventBuilder, AdapterEventHandlerType, IBlueprint } from '@stone-js/core'
import { IncomingBrowserEvent, IncomingBrowserEventOptions, OutgoingBrowserResponse } from '@stone-js/browser-core'

/**
 * Native proof-of-concept adapter for Stone.js.
 *
 * Captures navigation intents from the in-memory event source, normalizes them
 * into `IncomingBrowserEvent` instances, sends them through the kernel and
 * executes the deferred render effect. It is the exact native counterpart of
 * `BrowserAdapter`, with the event source replacing `window`.
 *
 * Temporary by design: it prefigures `@stone-js/react-native-adapter`, which
 * will capture real deep links (`Linking`) and app-state changes on top of the
 * same skeleton.
 */
export class NativeAdapter extends Adapter<
NativeNavigationEvent,
NativeResponse,
NativeEventSource,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse,
NativeAdapterContext
> {
  private unsubscribe?: () => void

  /**
   * Creates an instance of the `NativeAdapter`.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance of `NativeAdapter`.
   */
  static create (blueprint: IBlueprint): NativeAdapter {
    return new this(blueprint)
  }

  /**
   * Executes the adapter: subscribes to navigation intents and dispatches the
   * initial event, exactly like the browser adapter dispatches its synthetic
   * first navigation on startup.
   *
   * Idempotent: running again tears down the previous subscription first.
   */
  public async run<ExecutionResultType = undefined>(): Promise<ExecutionResultType> {
    await this.executeHooks('onStart')

    const eventHandler = this.resolveEventHandler()

    await this.executeEventHandlerHooks('onInit', eventHandler)

    this.unsubscribe?.()
    this.unsubscribe = nativeEventSource.subscribe((rawEvent) => {
      void this.eventListener(eventHandler, rawEvent)
    })

    await this.eventListener(eventHandler, { url: nativeEventSource.initialUrl })

    return undefined as ExecutionResultType
  }

  /**
   * Tear down the adapter: remove the navigation subscription and run the
   * `onStop` hooks. Safe to call multiple times.
   */
  public async stop (): Promise<void> {
    if (this.unsubscribe === undefined) { return }
    this.unsubscribe()
    this.unsubscribe = undefined
    await this.executeHooks('onStop')
  }

  /**
   * Processes one navigation intent through the kernel.
   *
   * @param eventHandler - The resolved kernel event handler.
   * @param rawEvent - The raw navigation event.
   * @returns The platform response.
   */
  protected async eventListener (
    eventHandler: AdapterEventHandlerType<IncomingBrowserEvent, OutgoingBrowserResponse>,
    rawEvent: NativeNavigationEvent
  ): Promise<NativeResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingBrowserEventOptions, IncomingBrowserEvent>({
      resolver: (options) => IncomingBrowserEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawNativeResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const context: NativeAdapterContext = {
      rawEvent,
      executionContext: nativeEventSource,
      rawResponseBuilder,
      incomingEventBuilder
    }

    try {
      return await this.sendEventThroughDestination(context, eventHandler)
    } catch (error: any) {
      const builder = await this.handleError(error, context)
      return await this.buildRawResponse({ ...context, rawResponseBuilder: builder })
    }
  }
}
