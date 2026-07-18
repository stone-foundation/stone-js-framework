import { Event, EventOptions } from '@stone-js/core'

/**
 * Class representing a Route Event.
 *
 * @extends Event
 */
export class RouteEvent extends Event {
  /**
   * ROUTING Event name, fires before event match route.
   *
   * @event RouteEvent#ROUTING
   */
  static readonly ROUTING: string = 'stonejs@router:routing'

  /**
   * ROUTE_MATCHED Event name, fires after event matched route.
   *
   * @event RouteEvent#ROUTE_MATCHED
   */
  static readonly ROUTED: string = 'stonejs@router:routed'

  /**
   * Create a RouteEvent.
   *
   * @param options - The options to create a RouteEvent.
   * @returns A new RouteEvent instance.
   */
  static create (options: EventOptions): RouteEvent {
    return new this(options)
  }
}
