import { NoticeDeclaration, NotificationsConfig } from '../declarations'
import { BlueprintContext, IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'

/** The shape a resolved notifier answers, duck-typed so this file imports no service. */
interface NotifierLike {
  deliverNotice: (name: string, event: unknown) => Promise<unknown>
}

/**
 * Build-phase middleware: subscribes every notice that named a domain event.
 *
 * **This is what makes calling the notifier optional.** A notice declaring `on` becomes a handler of
 * the light key router, the same one `@stone-js/event-bus` routes incoming domain events through. So
 * a module emits what happened, and the notice says who learns about it: the emitting module imports
 * nothing, and is never reopened when a channel is added.
 *
 * A middleware rather than a static entry, because the notices are only known once everything has
 * been collected: `@Notice` contributes them, and so does configuration, and both are read here.
 *
 * The entry is a plain object of the shape the key router already accepts, so nothing here depends on
 * `@stone-js/router`. The handler is the **factory** form, which receives the container, so the
 * closure carries only the notice's name and the notifier is resolved for the event that arrives.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export const NoticeSubscriptionsMiddleware = async (
  context: BlueprintContext<IBlueprint>,
  next: NextMiddleware<BlueprintContext<IBlueprint>, IBlueprint>
): Promise<IBlueprint> => {
  const blueprint = await next(context)
  const options = blueprint.get<NotificationsConfig>('stone.notifications', {})
  const subscribed = (options.notices ?? []).filter((notice) => typeof notice.on === 'string')

  if (subscribed.length === 0) { return blueprint }

  blueprint.add('stone.keyRouting.handlers', subscribed.map(handlerFor))

  return blueprint
}

/**
 * One key-router handler, for one notice.
 *
 * @param notice - What was declared.
 * @returns The handler entry.
 */
function handlerFor (notice: NoticeDeclaration): Record<string, unknown> {
  return {
    key: notice.on,
    isFactory: true,
    action: 'handle',
    module: (container: { make: (key: string) => NotifierLike }) => ({
      handle: async (event: unknown) => await container.make('notifier').deliverNotice(notice.name, event)
    })
  }
}

/**
 * Meta blueprint middleware for the notice subscriptions.
 */
export const MetaNoticeSubscriptionsMiddleware: MetaMiddleware<BlueprintContext<IBlueprint>, IBlueprint> = {
  module: NoticeSubscriptionsMiddleware,
  priority: 5
}
