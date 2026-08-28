import { Channel, DeliveryOutcome, NotificationChannel, Recipient, RenderedNotification } from '@stone-js/notifications'

/**
 * The decorator, used as the documentation writes it.
 *
 * This file exists because a decorator is a value, and the public entry point once carried a type of
 * the same name. Two `export *` lines offering one name make the export ambiguous (TS2308), so
 * TypeScript kept neither and `@NotificationChannel('sms')` failed with TS2693 for every consumer,
 * while the JavaScript bundle exported the function perfectly well. Renaming the port to `Channel`
 * freed the name; this proves it stays free.
 */
@NotificationChannel('sms')
export class SmsChannel {
  readonly name = 'sms'

  async send (message: RenderedNotification, recipient: Recipient): Promise<DeliveryOutcome> {
    return { channel: this.name, status: 'sent', id: `${recipient.id}:${message.subject}` }
  }
}

/** And the port, still usable as a type, under its own name. */
export const port: Channel = new SmsChannel()
