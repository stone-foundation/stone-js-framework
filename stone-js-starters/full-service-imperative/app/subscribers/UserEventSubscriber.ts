import { UserEvent } from '../events/UserEvent'
import { defineEventSubscriber, EventEmitter, FunctionalEventSubscriber, ILogger } from '@stone-js/core'

/**
 * User Event Subscriber Options
 */
export interface UserEventSubscriberOptions {
  logger: ILogger
}

/**
 * Subscribe to user events
 *
 * @param eventEmitter - The event emitter
 */
export function FactoryUserEventSubscriber ({ logger }: UserEventSubscriberOptions): FunctionalEventSubscriber {
  return (eventEmitter: EventEmitter): void => {
    eventEmitter
      .on(UserEvent.USER_CREATED, (event: UserEvent) => {
        logger.info('User event subscriber', event.user)
      })
  }
}

/**
 * User event subscriber
 */
export const UserEventSubscriber = defineEventSubscriber(FactoryUserEventSubscriber, { isFactory: true })
