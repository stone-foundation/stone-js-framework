import { ILogger } from '@stone-js/core'
import { EventHandler, Post } from '@stone-js/router'
import { SecurityService } from '../services/SecurityService'
import { IncomingHttpEvent, NoContentHttpResponse } from '@stone-js/http-core'
import { UserChangePassword, UserLogin, UserRegister, UserToken } from '../models/User'

/**
 * Security Event Handler Options
*/
export interface SecurityEventHandlerOptions {
  logger: ILogger
  securityService: SecurityService
}

/**
 * Security Event Handler
 *
 * @EventHandler() is a decorator that marks a class as a handler.
 * @EventHandler() think about it as a controller in other frameworks.
 * Stone.js also provides a @Controller() decorator that is an alias to @EventHandler().
 * If you are familiar with other frameworks, you can use @Controller() instead of @EventHandler().
*/
@EventHandler('/', { name: 'security' })
export class SecurityEventHandler {
  private readonly logger: ILogger
  private readonly securityService: SecurityService

  /**
   * Create a new instance of SecurityEventHandler
   *
   * @param securityService
   * @param logger
   */
  constructor ({ securityService, logger }: SecurityEventHandlerOptions) {
    this.logger = logger
    this.securityService = securityService
  }

  /**
   * Login a user
   *
   * @param event - IncomingHttpEvent
   * @returns UserToken
  */
  @Post('/login', { name: 'login' })
  async login (event: IncomingHttpEvent): Promise<UserToken> {
    return await this.securityService.login(
      event,
      event.getBody<UserLogin>({ email: '', password: '' })
    )
  }

  /**
   * Logout a user
   *
   * @param event - IncomingHttpEvent
   * @returns void
  */
  @Post('/logout', { name: 'logout' })
  @NoContentHttpResponse({ 'content-type': 'application/json' })
  async logout (event: IncomingHttpEvent): Promise<void> {
    await this.securityService.logout(
      event.get<string>('Authorization', '').replace('Bearer ', '')
    )
  }

  /**
   * Refresh a token
   *
   * @param event - IncomingHttpEvent
   * @returns UserToken
  */
  @Post('/refresh', { name: 'refresh' })
  async refresh (event: IncomingHttpEvent): Promise<UserToken> {
    return await this.securityService.refresh(
      event.get<string>('Authorization', '').replace('Bearer ', '')
    )
  }

  /**
   * Register a user
   *
   * @param event - IncomingHttpEvent
   * @returns UserToken
  */
  @Post('/register', { name: 'register' })
  @NoContentHttpResponse({ 'content-type': 'application/json' })
  async register (event: IncomingHttpEvent): Promise<void> {
    await this.securityService.register(
      event.getBody<UserRegister>({} as any)
    )
  }

  /**
   * Change password
   *
   * @param event - IncomingHttpEvent
   * @returns void
  */
  @Post('/change-password', { name: 'change-password' })
  @NoContentHttpResponse({ 'content-type': 'application/json' })
  async changePassword (event: IncomingHttpEvent): Promise<void> {
    await this.securityService.changePassword(
      event.getUser(),
      event.getBody<UserChangePassword>()
    )
  }
}
