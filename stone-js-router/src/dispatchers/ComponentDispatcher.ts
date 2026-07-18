import { Route } from '../Route'
import { RouterError } from '../errors/RouterError'
import { ClassDispatcher } from './ClassDispatcher'
import { CallableDispatcher } from './CallableDispatcher'
import {
  Promiseable,
  isFunctionModule,
  isMetaClassModule,
  isObjectLikeModule
} from '@stone-js/core'
import {
  IDispacher,
  IIncomingEvent,
  DispatcherContext,
  DependencyResolver,
  IComponentEventHandler,
  LazyComponentEventHandler,
  MetaComponentEventHandler
} from '../declarations'

/**
 * ComponentDispatcher
 *
 * A component dispatcher for dispatching component-based event handlers.
 */
export class ComponentDispatcher<
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
  async getName (route: Route<IncomingEventType, OutgoingResponseType>): Promise<string> {
    if (
      isObjectLikeModule<MetaComponentEventHandler<IncomingEventType, OutgoingResponseType>>(
        route.options.handler
      )
    ) {
      route.options.handler.module = await this.resolveHandlerModule(route.options.handler)
    }

    if (isMetaClassModule(route.options.handler)) {
      return new ClassDispatcher<IncomingEventType, OutgoingResponseType>(this.resolver).getName(route)
    } else {
      return new CallableDispatcher<IncomingEventType, OutgoingResponseType>(this.resolver).getName(route)
    }
  }

  /**
   * For the component we don't resolve the handler here.
   * So Component third party library can handle all the logic.
   *
   * @param context - The dispatcher context
   * @returns The outgoing response
   * @throws {RouterError} If the action is not found in the handler
  */
  dispatch (
    { route }: DispatcherContext<IncomingEventType, OutgoingResponseType>
  ): Promiseable<OutgoingResponseType> {
    if (
      isObjectLikeModule<IComponentEventHandler<IncomingEventType, OutgoingResponseType>>(
        route.options?.handler
      )
    ) {
      return route.options.handler as OutgoingResponseType
    }

    throw new RouterError('No component found')
  }

  /**
   * Resolves the handler module if it is a lazy-loaded module.
   * Lazy module are modules that are loaded only when needed.
   * They are defined using dynamic imports `import('lazy-module.mjs').then(v => v.myModule)`.
   * Note: Lazy-loaded only applies to class and functional handlers.
   *
   * @param handler - The handler to resolve.
   * @returns The resolved handler module.
  */
  private async resolveHandlerModule<HandlerType>(
    handler: MetaComponentEventHandler<IncomingEventType, OutgoingResponseType>
  ): Promise<HandlerType> {
    if (
      handler.lazy === true &&
      isFunctionModule<LazyComponentEventHandler<IncomingEventType, OutgoingResponseType>>(handler.module)
    ) {
      handler.lazy = false
      return await handler.module() as HandlerType
    }
    return handler.module as HandlerType
  }
}
