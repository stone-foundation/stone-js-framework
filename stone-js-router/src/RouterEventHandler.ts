import { Router } from './Router'
import { IEventHandler } from '@stone-js/core'
import { StoneIncomingEvent } from './declarations'

/**
 * Options for configuring the router.
 */
export interface RouterEventHandlerOptions<
  IncomingEventType extends StoneIncomingEvent,
  OutgoingResponseType = unknown
> {
  router: Router<IncomingEventType, OutgoingResponseType>
}

/**
 * A router event handler for processing incoming events.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export class RouterEventHandler<
  IncomingEventType extends StoneIncomingEvent = StoneIncomingEvent,
  OutgoingResponseType = unknown
> implements IEventHandler<IncomingEventType, OutgoingResponseType> {
  private readonly router: Router<IncomingEventType, OutgoingResponseType>

  /**
   * Constructs a `RouterEventHandler` instance.
   *
   * @param options - The RouterEventHandler options including blueprint, container, and event emitter.
   */
  protected constructor ({ router }: RouterEventHandlerOptions<IncomingEventType, OutgoingResponseType>) {
    this.router = router
  }

  /**
   * Handle an incoming event.
   *
   * @param event - The incoming event to process.
   * @returns The outgoing response.
   */
  async handle (event: IncomingEventType): Promise<OutgoingResponseType> {
    return await this.router.dispatch(event)
  }
}
