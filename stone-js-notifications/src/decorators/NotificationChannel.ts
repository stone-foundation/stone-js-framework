import { CHANNEL_KEY } from './constants'
import { NotificationsConfig } from '../declarations'
import { notificationsBlueprint } from '../options/NotificationsBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Declare a class as a notification channel.
 *
 * The declaration form for a channel of your own, next to the configuration form: this is how `sms`
 * and `push` are done, and anything else a provider offers. The class is registered as a service, so
 * its constructor is auto-wired like any other, and the channel is registered under the name given
 * here.
 *
 * The class must answer `send(message, recipient)` and **return** an outcome rather than throw, which
 * is the whole port. A channel that throws is treated as retryable.
 *
 * @param name - The name notifications refer to it by.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @NotificationChannel('sms')
 * export class TwilioChannel {
 *   readonly name = 'sms'
 *
 *   constructor ({ twilio }) { this.twilio = twilio }
 *
 *   async send (message, recipient) {
 *     if (recipient.phone === undefined) {
 *       return { status: 'unreachable', retryable: false, reason: 'No phone number.' }
 *     }
 *     await this.twilio.messages.create({ to: recipient.phone, body: message.body })
 *     return { status: 'sent' }
 *   }
 * }
 * ```
 */
export const NotificationChannel = <T extends ClassType = ClassType>(name: string): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // A service, and a channel: the container builds it, and the registry finds it. Registering it
    // rather than reaching into it is what lets the class ask for whatever it needs.
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true, alias: [`channel:${name}`] })
    setMetadata(context, CHANNEL_KEY, { name })

    const blueprint: { stone: { notifications: NotificationsConfig } } = {
      stone: { notifications: { channels: [{ name, module: target, isClass: true } as any] } }
    }

    addBlueprint(target, context, notificationsBlueprint, blueprint as any)
  })
}
