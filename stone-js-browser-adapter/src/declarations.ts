import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, Promiseable, RawResponseOptions } from '@stone-js/core'
import { IncomingBrowserEvent, IncomingBrowserEventOptions, OutgoingBrowserResponse } from '@stone-js/browser-core'

/**
 * Represents a generic Browser event as a key-value pair.
 */
export type BrowserEvent<T = unknown> = CustomEvent<T> | Event | PopStateEvent

/**
 * Represents a generic Browser response as a key-value pair.
 */
export type BrowserResponse = unknown

/**
 * Represents the Browser execution context as a key-value pair.
 */
export type BrowserContext = typeof window

/**
 * Represents the context for the Browser Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties
 * specific to generic Browser events.
 */
export type BrowserAdapterContext = AdapterContext<
BrowserEvent,
BrowserResponse,
BrowserContext,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse
>

/**
 * Represents the response builder for the Browser Adapter.
 */
export type BrowserAdapterResponseBuilder = IAdapterEventBuilder<RawBrowserResponseOptions, RawResponseWrapper>

/**
 * Represents options for configuring a raw browser response.
 *
 * Extends the `RawResponseOptions` interface to include additional properties
 * for managing response rendering in the Browser.
 */
export interface RawBrowserResponseOptions extends RawResponseOptions {
  /**
   * The raw response object to send back to the Browser.
   */
  render: () => Promiseable<void>
}
