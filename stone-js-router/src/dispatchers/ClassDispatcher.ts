import {
  isNotEmpty,
  isMetaClassModule,
  EventHandlerClass,
  isObjectLikeModule
} from '@stone-js/core'
import {
  BindingKey,
  IDispacher,
  BindingValue,
  IEventHandler,
  IIncomingEvent,
  MetaEventHandler,
  MixedEventHandler,
  DispatcherContext,
  DependencyResolver
} from '../declarations'
import { Route } from '../Route'
import { RouterError } from '../errors/RouterError'

/**
 * ClassDispatcher
 *
 * A class dispatcher for dispatching class-based event handlers.
 */
export class ClassDispatcher<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
> implements IDispacher<IncomingEventType, OutgoingResponseType> {
  /**
   * Create a new instance of ClassDispatcher
   *
   * @param resolver - The dependency resolver
   */
  constructor (private readonly resolver: DependencyResolver) {}

  /**
   * Get the name of the handler
   *
   * @param route - The route
   * @returns The name of the handler
  */
  getName (route: Route<IncomingEventType, OutgoingResponseType>): string {
    return `${this.getClass(route.options?.handler).name}@${String(this.getAction(route.options?.handler))}`
  }

  /**
   * Dispatch the event to the handler
   *
   * @param context - The dispatcher context
   * @returns The outgoing response
   * @throws {RouterError} If the action is not found in the handler
   */
  async dispatch ({ event, route }: DispatcherContext<IncomingEventType, OutgoingResponseType>): Promise<OutgoingResponseType> {
    const action = this.getAction(route.options?.handler)
    const instance = this.getInstance(route.options?.handler)

    if (
      isObjectLikeModule<IEventHandler<IncomingEventType, OutgoingResponseType>>(instance) &&
      isNotEmpty<string>(action) &&
      action in instance
    ) {
      return await instance[action](event)
    }

    throw new RouterError(`Action ${String(action)} not found in this handler ${this.getClass(route.options?.handler).name}`)
  }

  private getInstance (
    handler?: MixedEventHandler<IncomingEventType, OutgoingResponseType>
  ): IEventHandler<IncomingEventType, OutgoingResponseType> | undefined {
    if (isNotEmpty<MixedEventHandler<IncomingEventType, OutgoingResponseType>>(handler)) {
      return this.resolveModule<IEventHandler<IncomingEventType, OutgoingResponseType>>(this.getClass(handler))
    }
  }

  private getClass (
    handler?: MixedEventHandler<IncomingEventType, OutgoingResponseType>
  ): EventHandlerClass<IncomingEventType, OutgoingResponseType> {
    if (isMetaClassModule<EventHandlerClass<IncomingEventType, OutgoingResponseType>>(handler)) {
      return handler.module
    } else {
      throw new RouterError('Invalid event handler provided.')
    }
  }

  private getAction (
    handler?: MixedEventHandler<IncomingEventType, OutgoingResponseType>
  ): string | undefined {
    if (isObjectLikeModule<MetaEventHandler<IncomingEventType, OutgoingResponseType>>(handler)) {
      return handler.action ?? 'handle'
    }
  }

  private resolveModule <T extends BindingValue>(Class: BindingKey): T {
    return this.resolver?.resolve<T>(Class) ?? new (Class as new () => T)()
  }
}
