import { Route } from '../Route'
import { RouterError } from '../errors/RouterError'
import { isFunctionModule, isNotEmpty } from '@stone-js/core'
import { DispatcherContext, IDispacher, IIncomingEvent, RouteDefinitionRedirect } from '../declarations'

/**
 * RedirectDispatcher
 *
 * A callable dispatcher for dispatching function-based event handlers.
 */
export class RedirectDispatcher<
  IncomingEventType extends IIncomingEvent,
  OutgoingResponseType = unknown
  > implements IDispacher<IncomingEventType, OutgoingResponseType> {
  /**
   * Get the name of the handler
   *
   * @param _route - The route
   * @returns The name of the handler
   */
  getName (_route: Route<IncomingEventType, OutgoingResponseType>): string {
    return 'redirect'
  }

  /**
   * Dispatch the event to the handler
   *
   * @param context - The dispatcher context
   * @returns The outgoing response
   * @throws {RouterError} If the action is not found in the handler
   */
  async dispatch ({ event, route }: DispatcherContext<IncomingEventType, OutgoingResponseType>): Promise<OutgoingResponseType> {
    if (isNotEmpty<string>(route.options?.redirect)) {
      return await this.runRedirection(route, event, route.options.redirect)
    }

    throw new RouterError('No redirect value provided')
  }

  private async runRedirection (
    route: Route<IncomingEventType, OutgoingResponseType>,
    event: IncomingEventType,
    redirect: string | Record<string, unknown> | Function,
    statusCode: number = 302
  ): Promise<OutgoingResponseType> {
    if (typeof redirect === 'object') {
      return await this.runRedirection(route, event, redirect.location as string, parseInt(redirect.status as string))
    } else if (isFunctionModule<RouteDefinitionRedirect<IncomingEventType, OutgoingResponseType>>(redirect)) {
      return await this.runRedirection(route, event, await redirect(route, event))
    } else {
      return { statusCode, headers: { Location: redirect } } as unknown as OutgoingResponseType
    }
  }
}
