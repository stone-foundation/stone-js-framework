import { SecurityService } from '../services/SecurityService'
import { IMiddleware, Middleware, NextMiddleware } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * Auth middleware Options
*/
export interface AuthMiddlewareOptions {
  securityService: SecurityService
}

/**
 * Auth middleware
 */
@Middleware({
  global: true,
  params: [['/login', '/register']]
})
export class AuthMiddleware implements IMiddleware<IncomingHttpEvent, OutgoingHttpResponse> {
  private readonly securityService: SecurityService

  /**
   * Create a new instance of AuthMiddleware
   *
   * @param options - The options to create the middleware
   */
  constructor ({ securityService }: AuthMiddlewareOptions) {
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
    event: IncomingHttpEvent,
    next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>,
    excludes: string[] = []
  ): Promise<OutgoingHttpResponse> {
    const isOptionsRequest = event.isMethod('OPTIONS')
    const isExcludedPath = excludes.includes(event.pathname)

    if (!isExcludedPath && !isOptionsRequest) {
      const token = event.get<string>('Authorization', '').replace('Bearer ', '')
      const user = await this.securityService.authenticate(token, event.ip, event.userAgent)
      event.setUserResolver(() => user)
    }

    return await next(event)
  }
}
