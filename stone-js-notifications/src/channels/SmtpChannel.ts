import { NotificationConfigurationError } from '../errors/NotificationError'
import { DeliveryOutcome, Channel, Recipient, RenderedNotification, SmtpChannelConfig } from '../declarations'

/**
 * Email, over SMTP.
 *
 * SMTP rather than a provider's API, deliberately: every provider speaks it, so shipping this one
 * channel reaches all of them without this package choosing a vendor for you. A provider with an API
 * you prefer is a `factory` away.
 *
 * `nodemailer` is an optional peer, imported lazily, so an application that sends no mail carries no
 * mail dependency. The transport is built once per channel instance and the instance is rebuilt with
 * the container: a transport is a **resource**, not state, and nodemailer pools its own connections,
 * so an application under load should pass a transport it owns.
 */
export class SmtpChannel implements Channel {
  readonly name: string

  private readonly config: SmtpChannelConfig
  private transportPromise?: Promise<any>

  /**
   * @param config - The channel's configuration.
   * @returns A channel.
   */
  static create (config: SmtpChannelConfig): SmtpChannel {
    return new this(config)
  }

  constructor (config: SmtpChannelConfig) {
    this.config = config
    this.name = config.name ?? 'smtp'
  }

  /**
   * Send the message as mail.
   *
   * @param message - The rendered notification.
   * @param recipient - Who it is for.
   * @returns How it ended.
   */
  async send (message: RenderedNotification, recipient: Recipient): Promise<DeliveryOutcome> {
    if (typeof recipient.email !== 'string' || recipient.email === '') {
      // Not retryable, and not a failure of this channel: the person simply has no mailbox here.
      // Reported rather than thrown, so the caller sees which channel could not reach them and why.
      return { status: 'unreachable', retryable: false, reason: 'The recipient has no email address.' }
    }

    if (typeof this.config.from !== 'string' || this.config.from === '') {
      // A setup mistake, and one no default could fix: a from address nobody chose would be refused
      // by the first receiving server that checks it.
      return {
        status: 'failed',
        retryable: false,
        reason: 'The SMTP channel needs a `from` address. Set it on the channel configuration.'
      }
    }

    try {
      const transport = await this.transport()
      const sent = await transport.sendMail({
        from: this.config.from,
        to: recipient.email,
        subject: message.subject,
        text: message.body
      })

      return { status: 'sent', id: sent?.messageId }
    } catch (error: any) {
      // A setup mistake is not a delivery outcome and must not be dressed as one: it would go to the
      // retry queue and fail identically forever. It leaves as itself, and the notifier reports it
      // as the permanent failure it is.
      if (error instanceof NotificationConfigurationError) { throw error }

      // A provider being down is worth another attempt; a rejected address is not, and SMTP says
      // which by its status code: 5xx is permanent, everything else is worth retrying.
      const permanent = typeof error?.responseCode === 'number' && error.responseCode >= 500 && error.responseCode < 600

      return {
        status: 'failed',
        retryable: !permanent,
        reason: String(error?.message ?? 'The mail could not be sent.')
      }
    }
  }

  /** The transport, built once for this instance. */
  private async transport (): Promise<any> {
    this.transportPromise = this.transportPromise ?? this.build()

    return await this.transportPromise
  }

  /** Build the transport from what was configured, or say what is missing. */
  private async build (): Promise<any> {
    const configured = this.config.transport

    // A transport the application built is the application's to manage, connection pool included.
    if (configured !== undefined && configured !== null && typeof (configured as any).sendMail === 'function') {
      return configured
    }

    const nodemailer = await this.loadNodemailer()

    return nodemailer.createTransport(configured ?? {})
  }

  /**
   * Load `nodemailer`, an optional peer, and say plainly when it is not there.
   *
   * A missing package is a setup mistake, never a delivery failure: answering "could not send" would
   * put it in the retry queue forever, and the retry would fail identically every time.
   *
   * @returns The nodemailer module.
   * @throws {NotificationConfigurationError} When the package is absent.
   */
  private async loadNodemailer (): Promise<any> {
    const missing = (): never => {
      throw new NotificationConfigurationError(
        'The SMTP channel requires "nodemailer". Install it: npm i nodemailer'
      )
    }

    // Typed as unknown on purpose: `nodemailer` is an optional peer, so this package must compile
    // whether or not its types are installed, and what comes back is checked below anyway.
    const mod: any = await import('nodemailer' as string).catch(missing)
    // It ships a default export, and which one a dynamic import lands on depends on the interop the
    // application was built with. Either is fine; neither is a delivery failure.
    const candidate = mod?.default ?? mod

    return typeof candidate?.createTransport === 'function' ? candidate : missing()
  }
}
