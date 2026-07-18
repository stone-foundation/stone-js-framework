import { Route } from '../Route'
import { RouterError } from '../errors/RouterError'
import { FactoryEventHandler, isFunctionModule, isMetaFactoryModule, isMetaFunctionModule } from '@stone-js/core'
import { DependencyResolver, DispatcherContext, MixedEventHandler, FunctionalEventHandler, IDispacher, IIncomingEvent } from '../declarations'

/**
 * CallableDispatcher
 *
 * A callable dispatcher for dispatching function-based event handlers.
 */
export class CallableDispatcher<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
  > implements IDispacher<IncomingEventType, OutgoingResponseType> {
  /**
   * Create a new instance of CallableDispatcher
   *
   * @param resolver - The dependency resolver
   */
  constructor (private readonly resolver: DependencyResolver) {}

  /**
   * Get the name of the handler
   *
   * @param _route - The route
   * @returns The name of the handler
   */
  getName (_route: Route<IncomingEventType, OutgoingResponseType>): string {
    return 'callable'
  }

  /**
   * Dispatch the event to the handler
   *
   * @param context - The dispatcher context
   * @returns The outgoing response
   * @throws {RouterError} If the action is not found in the handler
   */
  async dispatch ({ event, route }: DispatcherContext<IncomingEventType, OutgoingResponseType>): Promise<OutgoingResponseType> {
    const instance = this.getCallable(route.options?.handler)

    if (isFunctionModule<FunctionalEventHandler<IncomingEventType, OutgoingResponseType>>(instance)) {
      return await instance(event)
    }

    throw new RouterError('No or invalid callable function provided')
  }

  private getCallable (
    handler?: MixedEventHandler<IncomingEventType, OutgoingResponseType>
  ): FunctionalEventHandler<IncomingEventType, OutgoingResponseType> | undefined {
    if (isMetaFactoryModule<FactoryEventHandler<IncomingEventType, OutgoingResponseType>>(handler)) {
      return handler.module(this.resolver)
    } else if (isMetaFunctionModule<FunctionalEventHandler<IncomingEventType, OutgoingResponseType>>(handler)) {
      return handler.module
    } else if (isFunctionModule<FunctionalEventHandler<IncomingEventType, OutgoingResponseType>>(handler)) {
      return handler
    }
  }
}
