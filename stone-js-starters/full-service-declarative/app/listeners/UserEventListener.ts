import { UserEvent } from '../events/UserEvent'
import { IEventListener, ILogger, Listener } from '@stone-js/core'

/**
 * User Event Listener Options
*/
export interface UserEventListenerOptions {
  logger: ILogger
}

/**
 * User event listener
 */
@Listener({ event: UserEvent.USER_CREATED })
export class UserEventListener implements IEventListener<UserEvent> {
  private readonly logger: ILogger

  /**
   * Create a new instance of UserEventListener
   *
   * @param logger
   */
  constructor ({ logger }: UserEventListenerOptions) {
    this.logger = logger
  }

  /**
   * Handle the UserEvent
   *
   * @param event - The event to handle
   */
  handle (event: UserEvent): void {
    this.logger.info('User event listener', event)
  }
}
