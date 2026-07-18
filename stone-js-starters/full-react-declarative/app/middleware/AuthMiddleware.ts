import { UserService } from '../services/UserService'
import { SecurityService } from '../services/SecurityService'
import { IBlueprint, IMiddleware, Middleware, NextMiddleware } from '@stone-js/core'
import { ISnapshot, isServer, ReactIncomingEvent, ReactOutgoingResponse, reactRedirectResponse } from '@stone-js/use-react'

/**
 * AuthMiddleware Options
*/
export interface AuthMiddlewareOptions {
  snapshot: ISnapshot
  blueprint: IBlueprint
  userService: UserService
  securityService: SecurityService
}

/**
 * Set current user middleware
 */
@Middleware({
  global: true,
  params: [['/login', '/register']]
})
export class AuthMiddleware implements IMiddleware<ReactIncomingEvent, ReactOutgoingResponse> {
  private readonly snapshot: ISnapshot
  private readonly blueprint: IBlueprint
  private readonly userService: UserService
  private readonly securityService: SecurityService

  /**
   * Create a new instance of AuthMiddleware
   *
   * @param userService
   */
  constructor ({ blueprint, snapshot, userService, securityService }: AuthMiddlewareOptions) {
    this.snapshot = snapshot
    this.blueprint = blueprint
    this.userService = userService
    this.securityService = securityService
  }

  /**
   * Handle the incoming event
   *
   * @param event - The incoming event
   * @param next - The next middleware
   * @returns The response
   */
  async handle (
    event: ReactIncomingEvent,
    next: NextMiddleware<ReactIncomingEvent, ReactOutgoingResponse>,
    excludes: string[] = []
  ): Promise<ReactOutgoingResponse> {
    if (!excludes.includes(event.pathname)) {
      if (!this.securityService.isAuthenticated()) {
        this.blueprint.set('app.requestedUrl', event.pathname)
        return await reactRedirectResponse({ url: '/login' })
      }
      await this.resolveCurrentUser(event)
    }

    return await next(event)
  }

  /**
   * Resolve the current user and store it in the snapshot.
   *
   * This method uses the event fingerprint to store the user in the snapshot,
   * ensuring that the snapshot is valid per request. If the user is already
   * stored in the snapshot, it is retrieved from there; otherwise, it is
   * fetched from the server.
   *
   * @param event - The incoming event
   */
  private async resolveCurrentUser (event: ReactIncomingEvent): Promise<void> {
    if (isServer()) {
      const user = await this.userService.current()
      event.setUserResolver(() => user)
      this.snapshot.set(`${event.fingerprint()}.user`, user)
    } else {
      let user = this.snapshot.get(`${event.fingerprint()}.user`)
      user ??= await this.userService.current(true)
      event.setUserResolver(() => user)
    }
  }
}
