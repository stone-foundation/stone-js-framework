import { Event } from '@stone-js/core'

/**
 * User Event
 */
export class UserEvent extends Event {
  /**
   * USER_CREATED Event name, fires after a user have been created.
   *
   * @event UserEvent#USER_CREATED
   */
  static USER_CREATED: string = 'user.created'

  constructor (public readonly user: any) {
    super({ type: UserEvent.USER_CREATED })
  }
}
