import { RawResponseWrapper } from './RawResponseWrapper'
import { NativeEventSource, NativeNavigationEvent } from './NativeEventSource'
import { AdapterContext, IAdapterEventBuilder, RawResponseOptions } from '@stone-js/core'
import { IncomingBrowserEvent, IncomingBrowserEventOptions, OutgoingBrowserResponse } from '@stone-js/browser-core'

/**
 * The platform identifier exposed on every incoming event's source.
 */
export const NATIVE_PLATFORM = 'react-native'

/**
 * The raw platform response. The native platform has no transport response:
 * the effect is a render, so the raw response is whatever the renderer returns.
 */
export type NativeResponse = unknown

/**
 * Raw response options carrying the deferred `render` effect, mirroring the
 * browser adapter's contract.
 */
export interface RawNativeResponseOptions extends RawResponseOptions {
  render?: () => NativeResponse | Promise<NativeResponse>
}

/**
 * The adapter context for the native proof-of-concept adapter.
 */
export type NativeAdapterContext = AdapterContext<
NativeNavigationEvent,
NativeResponse,
NativeEventSource,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse
>

/**
 * The response builder used by the native adapter middleware.
 */
export type NativeAdapterResponseBuilder = IAdapterEventBuilder<RawNativeResponseOptions, RawResponseWrapper>
