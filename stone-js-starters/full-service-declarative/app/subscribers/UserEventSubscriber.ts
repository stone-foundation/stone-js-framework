import { UserEvent } from '../events/UserEvent'
import { EventEmitter, IEventSubscriber, ILogger, Subscriber } from '@stone-js/core'

/**
 * User Event Subscriber Options
 */
export interface UserEventSubscriberOptions {
  logger: ILogger
}

/**
 * User event subscriber
 */
@Subscriber()
export class UserEventSubscriber implements IEventSubscriber {
  private readonly logger: ILogger

  /**
   * Create a new instance of UserEventSubscriber
   *
   * @param logger
   */
  constructor ({ logger }: UserEventSubscriberOptions) {
    this.logger = logger
  }

  /**
   * Subscribe to user events
   *
   * @param eventEmitter - The event emitter
   */
  subscribe (eventEmitter: EventEmitter): void {
    eventEmitter
      .on(UserEvent.USER_CREATED, (event: UserEvent) => {
        this.logger.info('User event subscriber', event.user)
      })
  }
}
