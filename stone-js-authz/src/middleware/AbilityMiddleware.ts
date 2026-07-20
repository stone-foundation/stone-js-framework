import { IAuthorizer } from '../declarations'
import { NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * Kernel/route middleware that builds the CASL ability for the current principal and attaches it
 * to the event (`ability` metadata), so route guards (`authorize(...)`) and handlers can consult
 * it without rebuilding it. The principal comes from `event.getUser()` (populated by
 * `@stone-js/auth`, or anonymous).
 */
export class AbilityMiddleware {
  private readonly authorizer: IAuthorizer

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ authorizer }: { authorizer: IAuthorizer }) {
    this.authorizer = authorizer
  }

  /**
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The outgoing response.
   */
  async handle (event: IncomingHttpEvent, next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>): Promise<OutgoingHttpResponse> {
    event.setMetadataValue('ability', this.authorizer.abilityFor(event.getUser()))
    return await next(event)
  }
}

/**
 * Meta middleware for attaching the ability.
 */
export const MetaAbilityMiddleware: MetaMiddleware = { module: AbilityMiddleware, isClass: true }
