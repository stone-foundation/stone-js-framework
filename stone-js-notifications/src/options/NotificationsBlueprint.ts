import { DELIVERY_JOB } from '../constants'
import { NotificationsConfig } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { DeliverNotification } from '../jobs/DeliverNotification'
import { NotificationServiceProvider } from '../NotificationServiceProvider'
import { MetaNoticeSubscriptionsMiddleware } from '../middleware/NoticeSubscriptionsMiddleware'

/** Application config augmented with the notifications bucket. */
export interface NotificationsAppConfig extends Partial<AppConfig> {
  notifications: NotificationsConfig
  /** Contributed so a worker finds the delivery job. Ignored when the queue module is absent. */
  queue?: Record<string, unknown>
}

/** Blueprint for the notifications module. */
export interface NotificationsBlueprint extends StoneBlueprint {
  stone: NotificationsAppConfig
}

/**
 * Opt-in blueprint: register it to reach people.
 *
 * The imperative half of the pair; `@Notifications()` is the declarative one. It binds the notifier
 * and the channels, and contributes the delivery job so a worker performs what a request decided.
 *
 * The job is declared on `stone.queue.handlers`, the array the worker scans, so nothing here depends
 * on the queue package. An application with no queue simply never has a worker to read it, and
 * delivery happens in the request instead.
 *
 * @example
 * ```ts
 * import { defineConfig, defineStoneApp } from '@stone-js/core'
 * import { notificationsBlueprint } from '@stone-js/notifications'
 *
 * export const App = defineStoneApp({ name: 'app' }, [notificationsBlueprint])
 *
 * export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.notifications', {
 *   default: ['smtp', 'in-app'],
 *   channels: [{ name: 'smtp', driver: 'smtp', from: 'Noowow <no-reply@example.test>' }],
 *   recipients: async (id) => await accounts.contactFor(id)
 * }))
 * ```
 */
export const notificationsBlueprint: NotificationsBlueprint = {
  stone: {
    notifications: {},
    providers: [
      NotificationServiceProvider
    ],
    blueprint: {
      middleware: [
        MetaNoticeSubscriptionsMiddleware
      ]
    },
    queue: {
      handlers: [
        { name: DELIVERY_JOB, module: DeliverNotification, isClass: true, action: 'handle' }
      ]
    }
  }
}
