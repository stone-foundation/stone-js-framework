import { defineRoutes, POST } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { FunctionalEventHandler, ILogger } from '@stone-js/core'
import { ISecurityService } from '../services/contracts/ISecurityService'
import { UserChangePassword, UserLogin, UserRegister, UserToken } from '../models/User'

/**
 * Security Event Handler Options
*/
export interface SecurityEventHandlerOptions {
  logger: ILogger
  securityService: ISecurityService
}

/**
 * Login a user
*/
export function factoryLoginEventHandler ({ securityService }: SecurityEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<UserToken> {
    return await securityService.login(
      event,
      event.getBody<UserLogin>({ email: '', password: '' })
    )
  }
}

/**
 * Logout a user
*/
export function factoryLogoutEventHandler ({ securityService }: SecurityEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<void> {
    await securityService.logout(
      event.get<string>('Authorization', '').replace('Bearer ', '')
    )
  }
}

/**
 * Refresh a token
*/
export function factoryRefreshEventHandler ({ securityService }: SecurityEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<UserToken> {
    return await securityService.refresh(
      event.get<string>('Authorization', '').replace('Bearer ', '')
    )
  }
}

/**
 * Register a user
*/
export function factoryRegisterEventHandler ({ securityService }: SecurityEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<void> {
    await securityService.register(
      event.getBody<UserRegister>({} as any)
    )
  }
}

/**
 * Change password
*/
export function factoryChangePasswordEventHandler ({ securityService }: SecurityEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<void> {
    await securityService.changePassword(
      event.getUser(),
      event.getBody<UserChangePassword>()
    )
  }
}

/**
 * Security Event Handler
*/
export const SecurityEventHandler = defineRoutes(
  [
    [factoryLoginEventHandler, { isFactory: true, path: '/login', method: POST, name: 'login' }],
    [factoryLogoutEventHandler, { isFactory: true, path: '/logout', method: POST, name: 'logout' }],
    [factoryRefreshEventHandler, { isFactory: true, path: '/refresh', method: POST, name: 'refresh' }],
    [factoryRegisterEventHandler, { isFactory: true, path: '/register', method: POST, name: 'register' }],
    [factoryChangePasswordEventHandler, { isFactory: true, path: '/change-password', method: POST, name: 'change-password' }]
  ]
)
