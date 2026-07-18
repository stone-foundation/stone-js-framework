import { UserEvent } from '../events/UserEvent'
import { defineEventListener, FunctionalEventListener, ILogger } from '@stone-js/core'

/**
 * User Event Listener Options
*/
export interface UserEventListenerOptions {
  logger: ILogger
}

/**
 * Factory User event listener
 */
export function fatoryUserEventListener ({ logger }: UserEventListenerOptions): FunctionalEventListener<UserEvent> {
  return function (event: UserEvent): void {
    logger.info('User event listener', event)
  }
}

/**
 * User event listener Type
 */
export const UserEventListener = defineEventListener(fatoryUserEventListener, { isFactory: true, event: UserEvent.USER_CREATED })
