import { ILogger } from '@stone-js/core'
import { ChannelConfig, DeliveryOutcome, Channel, Recipient, RenderedNotification } from '../declarations'

/** What an unconfigured log channel is, as one value rather than a literal rebuilt per call. */
const DEFAULT_CONFIG: ChannelConfig = { name: 'log' }

/**
 * The channel that delivers nothing, and is honest about it.
 *
 * The zero-config default, so an application can call `notify()` on its first day and watch what it
 * would have sent. It is the right choice in development and in a test, and **it is not a channel**
 * anywhere else: nobody receives anything.
 *
 * It exists rather than defaulting to a real one because a default that quietly sent real mail would
 * send it from the first test run, to real people. The notifier says once, in a warning, that this is
 * what is configured, for the same reason: a module that delivers nothing must not look like one that
 * delivers.
 */
export class LogChannel implements Channel {
  readonly name: string

  private readonly logger?: ILogger

  /**
   * @param config - Names the channel.
   * @param logger - Where the message goes, when one is bound.
   * @returns A channel.
   */
  static create (config: ChannelConfig = DEFAULT_CONFIG, logger?: ILogger): LogChannel {
    return new this(config.name ?? 'log', logger)
  }

  constructor (name: string = 'log', logger?: ILogger) {
    this.name = name
    this.logger = logger
  }

  /**
   * Write the message where the application writes everything else.
   *
   * @param message - The rendered notification.
   * @param recipient - Who it was for.
   * @returns Sent, because writing it down is all this channel promises.
   */
  async send (message: RenderedNotification, recipient: Recipient): Promise<DeliveryOutcome> {
    this.logger?.info?.(`[@stone-js/notifications] ${message.template} -> ${this.addresseeOf(recipient)}`, {
      subject: message.subject,
      locale: message.locale
    })

    return { status: 'sent' }
  }

  /**
   * Who it was for, named without spelling out an address.
   *
   * A log line is read by more people than a database row, so it carries enough to follow a message
   * and not enough to leak one.
   *
   * @param recipient - Who it was for.
   * @returns Something to call them in a log.
   */
  private addresseeOf (recipient: Recipient): string {
    if (typeof recipient.id === 'string' && recipient.id !== '') { return `user:${recipient.id}` }
    if (typeof recipient.email === 'string') { return 'an email address' }
    if (typeof recipient.phone === 'string') { return 'a phone number' }

    return 'someone with no address'
  }
}
