import { Event, EventOptions } from './Event'
import { stableStringify, toBase64 } from '../identity'
import { IncomingEventSource } from '../declarations'

/**
 * IncomingEventOptions.
 */
export interface IncomingEventOptions extends EventOptions {
  locale?: string
  source: IncomingEventSource
}

/**
 * Class representing an IncomingEvent.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @extends Event
 */
export class IncomingEvent extends Event {
  /**
   * INCOMING_EVENT Event name, fires on platform message.
   *
   * @event IncomingEvent#INCOMING_EVENT
   */
  static readonly INCOMING_EVENT: string = 'stonejs@incoming_event'

  /**
   * The locale of the event.
   */
  public readonly locale: string

  /**
   * The source of the event.
   */
  public readonly source: IncomingEventSource

  /**
   * Create an IncomingEvent.
   *
   * @param options - The options to create an IncomingEvent.
   * @returns A new IncomingEvent instance.
   */
  static create (options: IncomingEventOptions): IncomingEvent {
    return new this(options)
  }

  /**
   * Create an IncomingEvent.
   *
   * @param options - The options to create an IncomingEvent.
   */
  protected constructor ({
    source,
    locale = 'en',
    metadata = {},
    timeStamp = Date.now(),
    type = IncomingEvent.INCOMING_EVENT
  }: IncomingEventOptions) {
    super({ type, metadata, timeStamp })
    this.locale = locale
    this.source = source
  }

  /**
   * Get the platform of the event source.
   *
   * @returns The platform of the event source.
   */
  get platform (): string | symbol {
    return this.source.platform
  }

  /**
   * Check if the event source is from a platform.
   *
   * @param platform - The platform to check.
   * @returns True if the event source is from the platform, false otherwise.
   */
  isPlatform (platform: string | symbol): boolean {
    return this.source.platform === platform
  }

  /**
   * A stable identity for this event.
   *
   * What it is for: keying anything that has to survive one event being handled twice. A renderer
   * stores its loader results under this key on the server and reads them back under the same key in
   * the browser, so two renders of the same event find the same data.
   *
   * Defined here because identity is not a platform's idea. An event that carries a URL has a
   * sharper one to offer and overrides this: `IncomingHttpEvent` and `IncomingBrowserEvent` both
   * answer with their method and path. An event that carries a payload instead, from a queue or a
   * timer, is identified by that payload, which is what this computes.
   *
   * Two properties it must have, and both come from what is *excluded*: the timestamp is left out,
   * because a server render and a browser render of the same event happen at different moments and
   * must agree; and keys are sorted, because two objects with the same entries in a different order
   * are the same event.
   *
   * @returns The fingerprint, base64-encoded.
   */
  fingerprint (): string {
    return toBase64([this.type, stableStringify(this.metadata)].join('|'))
  }
}
