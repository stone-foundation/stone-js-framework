import { cloneValue } from '@stone-js/config'
import { NotificationsConfig } from '../declarations'
import { notificationsBlueprint } from '../options/NotificationsBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/** Options for the `@Notifications` activation. */
export interface NotificationsDecoratorOptions extends NotificationsConfig {}

/**
 * Enable notifications on the application.
 *
 * The declarative half of the module's activation; `notificationsBlueprint` is the imperative half,
 * and neither can do what the other cannot. With nothing configured, notifications go to the log and
 * say so: reaching real people is a decision, so it is written down.
 *
 * @param options - What to configure, if anything.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @Notifications({
 *   default: ['smtp', 'in-app'],
 *   channels: [{ name: 'smtp', driver: 'smtp', from: 'Noowow <no-reply@example.test>' }]
 * })
 * @StoneApp()
 * export class Application {}
 * ```
 */
export const Notifications = <T extends ClassType = ClassType>(
  options: NotificationsDecoratorOptions = {}
): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(notificationsBlueprint)

    // The blueprint is the single source of truth for what the module declares; the decorator
    // overrides only what it can, its own options bucket.
    blueprint.stone.notifications = { ...blueprint.stone.notifications, ...options }

    addBlueprint(target, context, blueprint)
  })
}
