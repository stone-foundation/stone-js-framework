import { IUserService } from '../services/contracts/IUserService'
import { ISecurityService } from '../services/contracts/ISecurityService'
import { defineMiddleware, FunctionalMiddleware, IBlueprint, NextMiddleware } from '@stone-js/core'
import { ReactIncomingEvent, ReactOutgoingResponse, reactRedirectResponse, ReactRuntime } from '@stone-js/use-react'

/**
 * AuthMiddleware Options
*/
export interface AuthMiddlewareOptions {
  blueprint: IBlueprint
  userService: IUserService
  reactRuntime: ReactRuntime
  securityService: ISecurityService
}

/**
 * Set current user middleware
 */
export const AuthMiddleware = ({
  blueprint,
  userService,
  reactRuntime,
  securityService
}: AuthMiddlewareOptions): FunctionalMiddleware<ReactIncomingEvent, ReactOutgoingResponse> => {
  /**
   * Handle the incoming event
   *
   * @param event - The incoming event
   * @param next - The next middleware
   * @returns The response
   */
  return async (
    event: ReactIncomingEvent,
    next: NextMiddleware<ReactIncomingEvent, ReactOutgoingResponse>,
    excludes: string[] = []
  ): Promise<ReactOutgoingResponse> => {
    if (!excludes.includes(event.pathname)) {
      if (!securityService.isAuthenticated()) {
        blueprint.set('app.requestedUrl', event.pathname)
        return reactRedirectResponse({ url: '/login' })
      }
      const user = await reactRuntime.snapshot('currentUser', async () => await userService.current())
      event.setUserResolver(() => user)
    }

    return await next(event)
  }
}

/**
 * AuthMiddleware Blueprint
 */
export const AuthMiddlewareBlueprint = defineMiddleware(
  AuthMiddleware,
  { global: true, params: [['/login', '/register']], isFactory: true }
)
