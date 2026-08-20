import { emitNativeRender } from './renderSink'
import { NextMiddleware } from '@stone-js/core'
import { CookieCollection } from '@stone-js/browser-core'
import { NATIVE_PLATFORM, NativeAdapterContext, NativeAdapterResponseBuilder } from './declarations'

/**
 * Transforms the raw navigation event into the intention: an
 * `IncomingBrowserEvent`, reused as-is from `@stone-js/browser-core`.
 *
 * This is the native mirror of the browser adapter's IncomingEventMiddleware:
 * `location` comes from the event's URL instead of `window.location`, and the
 * cookie collection is purely in memory (no `document`).
 */
export class IncomingEventMiddleware {
  /**
   * Handle the incoming raw event.
   *
   * @param context - The adapter context.
   * @param next - The next middleware.
   * @returns The response builder.
   */
  async handle (
    context: NativeAdapterContext,
    next: NextMiddleware<NativeAdapterContext, NativeAdapterResponseBuilder>
  ): Promise<NativeAdapterResponseBuilder> {
    const url = new URL(context.rawEvent.url)

    context
      .incomingEventBuilder
      .add('url', url)
      .add('queryString', url.search)
      .add('protocol', url.protocol.replace(':', ''))
      .add('metadata', context.rawEvent.metadata ?? {})
      .add('cookies', CookieCollection.create(undefined, {}))
      .add('source', {
        rawEvent: context.rawEvent,
        platform: NATIVE_PLATFORM,
        rawContext: context.executionContext
      })

    return await next(context)
  }
}

/**
 * Contributes the deferred render effect: once the kernel has produced the
 * outgoing response, hand it to the registered render target.
 *
 * This is the native mirror of the role `BrowserResponseMiddleware` plays for
 * the browser platform in `@stone-js/use-react`.
 */
export class ResponseMiddleware {
  /**
   * Handle the outgoing response.
   *
   * @param context - The adapter context.
   * @param next - The next middleware.
   * @returns The response builder.
   */
  async handle (
    context: NativeAdapterContext,
    next: NextMiddleware<NativeAdapterContext, NativeAdapterResponseBuilder>
  ): Promise<NativeAdapterResponseBuilder> {
    context.rawResponseBuilder.add('render', () => {
      if (context.outgoingResponse !== undefined) {
        emitNativeRender(context.outgoingResponse)
      }
      return context.outgoingResponse
    })

    return await next(context)
  }
}
