import { NOTICE_KEY } from './constants'
import { NoticeDeclaration } from '../declarations'
import { notificationsBlueprint } from '../options/NotificationsBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/** What `@Notice` declares. Metadata only: the content lives in the class. */
export interface NoticeOptions {
  /** The name a caller refers to it by. */
  name: string
  /** The domain event it reacts to, so nobody has to call the notifier. */
  on?: string
  /** The channels it uses. Defaults to `stone.notifications.default`. */
  channels?: string[]
}

/**
 * Declare a class as a notice: something a person receives.
 *
 * **The decorator says what it is; the class says what it says.** There is no `content` option, and
 * that is deliberate: a decorator carrying message bodies would put text in the one place it cannot
 * be translated, formatted, or computed from the event. The class answers `notify(event, context)`,
 * and it is built through the container, so it can ask for i18n, a repository, a URL signer.
 *
 * With `on`, **nobody calls the notifier**. A module emits what happened, and the notice that named
 * that event decides who learns about it. The emitting module imports nothing and is never reopened
 * when a channel is added, which is the whole reason this exists rather than a service call.
 *
 * @param options - The notice's metadata.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @Notice({
 *   name: 'guardianship.consent_needed',
 *   on: 'identity.guardian.invited.v1',
 *   channels: ['smtp', 'in-app']
 * })
 * export class ConsentNeeded {
 *   constructor ({ i18n }) { this.i18n = i18n }
 *
 *   recipients (event) { return event.guardianId }
 *
 *   notify (event, { locale }) {
 *     return {
 *       smtp: {
 *         subject: this.i18n.t('consent.subject', { lng: locale }),
 *         body: this.i18n.t('consent.body', { lng: locale, child: event.childHandle })
 *       },
 *       'in-app': { body: this.i18n.t('consent.short', { lng: locale }) }
 *     }
 *   }
 * }
 * ```
 */
export const Notice = <T extends ClassType = ClassType>(options: NoticeOptions): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // A service, and a notice: the container builds it, and the registry finds it by name. Registering
    // it rather than reaching into it is what lets the class ask for whatever it needs.
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true, alias: [`notice:${options.name}`] })
    setMetadata(context, NOTICE_KEY, options)

    const declaration: NoticeDeclaration = { ...options, module: target, isClass: true }

    addBlueprint(target, context, notificationsBlueprint, {
      stone: { notifications: { notices: [declaration] } }
    } as any)
  })
}
