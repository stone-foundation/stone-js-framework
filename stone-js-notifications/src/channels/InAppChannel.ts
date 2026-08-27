import { IN_APP_EVENT } from '../constants'
import { DeliveryOutcome, InAppChannelConfig, NotificationChannel, Recipient, RenderedNotification } from '../declarations'

/** The shape this channel needs from a broadcaster, duck-typed so no realtime import is required. */
export interface BroadcasterLike {
  to: (channel: string) => { emit: <T>(event: string, payload?: T) => Promise<void> }
}

/**
 * The channel that reaches the tab someone already has open.
 *
 * This is the half that makes a notification module worth having in this framework rather than a mail
 * client wrapped in a service: **one `notify()` reaches the mailbox, the phone and the open screen**,
 * and the application wires none of the three together.
 *
 * It broadcasts through `@stone-js/realtime`, duck-typed from the container, so this package neither
 * imports it nor requires it. The client side is already written: whoever is subscribed to the
 * recipient's channel receives a `notification` event, with the same rendered message every other
 * channel got.
 *
 * It reports `unreachable` rather than `failed` when nobody is listening, because that is not an
 * error: a person who is not looking at the screen is exactly why the other channels exist.
 */
export class InAppChannel implements NotificationChannel {
  readonly name: string

  private readonly event: string
  private readonly broadcaster?: BroadcasterLike
  private readonly channelFor: (recipient: Recipient) => string

  /**
   * @param config - Names the channel, and how to address a recipient.
   * @param broadcaster - The realtime broadcaster, when one is bound.
   * @returns A channel.
   */
  static create (config: InAppChannelConfig = { name: 'in-app' }, broadcaster?: BroadcasterLike): InAppChannel {
    return new this(config, broadcaster)
  }

  constructor (config: InAppChannelConfig = { name: 'in-app' }, broadcaster?: BroadcasterLike) {
    this.name = config.name ?? 'in-app'
    this.event = config.event ?? IN_APP_EVENT
    this.broadcaster = broadcaster
    this.channelFor = config.channelFor ?? ((recipient) => `user.${String(recipient.id)}.notifications`)
  }

  /**
   * Broadcast the message on the recipient's own channel.
   *
   * @param message - The rendered notification.
   * @param recipient - Who it is for.
   * @returns How it ended.
   */
  async send (message: RenderedNotification, recipient: Recipient): Promise<DeliveryOutcome> {
    if (this.broadcaster === undefined) {
      // A setup gap, not a delivery failure, and it must not be retried: nothing will change on the
      // second attempt. Named plainly so the fix is obvious.
      return {
        status: 'failed',
        retryable: false,
        reason: 'The in-app channel needs a realtime broadcaster. Enable @stone-js/realtime, or ' +
          'register a channel of your own with `channels: [{ name, factory }]`.'
      }
    }

    if (typeof recipient.id !== 'string' || recipient.id === '') {
      // Without an id there is no channel to broadcast on. Not retryable: the recipient will not
      // grow one between attempts.
      return { status: 'unreachable', retryable: false, reason: 'The recipient has no id to address.' }
    }

    await this.broadcaster.to(this.channelFor(recipient)).emit(this.event, {
      template: message.template,
      params: message.params,
      subject: message.subject,
      body: message.body,
      locale: message.locale
    })

    return { status: 'sent' }
  }
}
