import { RawResponseWrapper } from './RawResponseWrapper'
import { NavigationSource } from './NavigationSource'
import { Adapter, AdapterEventBuilder, AdapterEventHandlerType, IBlueprint } from '@stone-js/core'
import { IncomingBrowserEvent, IncomingBrowserEventOptions, OutgoingBrowserResponse } from '@stone-js/browser-core'
import {
  NavigationIntent,
  ReactNativeContext,
  ReactNativeResponse,
  RawReactNativeResponseOptions,
  ReactNativeAdapterContext
} from './declarations'

/**
 * React Native adapter for Stone.js.
 *
 * The Integration dimension for a native mobile application: it captures the platform's
 * causes (the launch URL, deep links, in-app navigation), turns each into an
 * `IncomingBrowserEvent`, hands it to the kernel, and runs the effect the view layer
 * deferred. The domain it serves is unchanged from the one behind an HTTP adapter, which
 * is the point of the whole exercise.
 *
 * It is the exact native counterpart of `BrowserAdapter`, with a
 * {@link NavigationSource} where the browser has `window`.
 *
 * @example
 * ```typescript
 * import { ReactNative } from '@stone-js/react-native-adapter'
 *
 * @ReactNative()
 * @StoneApp()
 * class Application {}
 * ```
 */
export class ReactNativeAdapter extends Adapter<
NavigationIntent,
ReactNativeResponse,
ReactNativeContext,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse,
ReactNativeAdapterContext
> {
  private source?: NavigationSource
  private unsubscribe?: () => void

  /**
   * Create the adapter.
   *
   * @param blueprint - The application blueprint.
   * @returns A new adapter instance.
   */
  static create (blueprint: IBlueprint): ReactNativeAdapter {
    return new this(blueprint)
  }

  /**
   * Run the adapter.
   *
   * Order matters here. The event handler is initialized before any listener is live, so a
   * deep link arriving during startup cannot reach a handler that has not run its `onInit`
   * hooks. Then the platform is bound (which yields the launch URL), then listeners are
   * attached, and only then is the launch intent dispatched: the application always
   * resolves exactly one route on startup, the one it was opened with or the base path.
   *
   * Idempotent: running again tears down the previous listeners first, so a hot reload
   * never leaves two adapters answering the same intent.
   */
  public async run<ExecutionResultType = undefined>(): Promise<ExecutionResultType> {
    await this.executeHooks('onStart')

    const source = this.resolveNavigationSource()
    const eventHandler = this.resolveEventHandler()

    await this.executeEventHandlerHooks('onInit', eventHandler)

    await this.stop()
    this.source = source

    const launchUrl = await source.bind()

    this.unsubscribe = source.subscribe((intent) => {
      void this.eventListener(eventHandler, intent, source)
    })

    await this.eventListener(eventHandler, source.makeLaunchIntent(launchUrl), source)

    return undefined as ExecutionResultType
  }

  /**
   * Tear the adapter down: stop listening to the platform and to the application, then run
   * the `onStop` hooks. Safe to call when never started.
   */
  public async stop (): Promise<void> {
    if (this.unsubscribe === undefined) { return }

    this.unsubscribe()
    this.unsubscribe = undefined
    this.source?.unbind()
    this.source = undefined

    await this.executeHooks('onStop')
  }

  /**
   * Resolve the navigation source the application shares with the router.
   *
   * It is read from the blueprint rather than created here, so the navigator the router
   * calls and the source the adapter listens to are the same object: that identity is what
   * closes the navigation loop.
   *
   * @returns The navigation source.
   */
  private resolveNavigationSource (): NavigationSource {
    return this.blueprint.get<NavigationSource>(
      'stone.reactNative.navigationSource',
      NavigationSource.create()
    )
  }

  /**
   * Process one navigation intent through the kernel.
   *
   * @param eventHandler - The resolved event handler.
   * @param rawEvent - The navigation intent.
   * @param executionContext - The navigation source.
   * @returns The platform response.
   */
  protected async eventListener (
    eventHandler: AdapterEventHandlerType<IncomingBrowserEvent, OutgoingBrowserResponse>,
    rawEvent: NavigationIntent,
    executionContext: NavigationSource
  ): Promise<ReactNativeResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingBrowserEventOptions, IncomingBrowserEvent>({
      resolver: (options) => IncomingBrowserEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawReactNativeResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const context: ReactNativeAdapterContext = {
      rawEvent,
      executionContext,
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
