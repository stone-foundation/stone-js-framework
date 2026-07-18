import { ISecurityService } from '../services/contracts/ISecurityService'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'
import { defineMiddleware, FunctionalMiddleware, NextMiddleware } from '@stone-js/core'

/**
 * Auth middleware Options
*/
export interface AuthMiddlewareOptions {
  securityService: ISecurityService
}

/**
 * Factory Auth middleware
 */
export function factoryAuthMiddleware ({ securityService }: AuthMiddlewareOptions): FunctionalMiddleware<IncomingHttpEvent, OutgoingHttpResponse> {
  /**
   * Handle the incoming event
   *
   * @param event - The incoming event
   * @param next - The next middleware
   * @returns The response
   */
  return async function (
    event: IncomingHttpEvent,
    next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>,
    excludes: string[] = []
  ): Promise<OutgoingHttpResponse> {
    const isOptionsRequest = event.isMethod('OPTIONS')
    const isExcludedPath = excludes.includes(event.pathname)

    if (!isExcludedPath && !isOptionsRequest) {
      const token = event.get<string>('Authorization', '').replace('Bearer ', '')
      const user = await securityService.authenticate(token, event.ip, event.userAgent)
      event.setUserResolver(() => user)
    }

    return await next(event)
  }
}

/**
 * Auth middleware
 */
export const AuthMiddleware = defineMiddleware(factoryAuthMiddleware, { isFactory: true, global: true, params: [['/login', '/register']] })
