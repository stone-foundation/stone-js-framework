import { defineService } from '@stone-js/core'
import { ITokenService } from './contracts/ITokenService'
import { ISecurityService } from './contracts/ISecurityService'
import { ISecurityClient } from '../clients/contracts/ISecurityClient'
import { UserChangePassword, UserLogin, UserRegister } from '../models/User'

/**
 * Security Service Options
*/
export interface SecurityServiceOptions {
  tokenService: ITokenService
  securityClient: ISecurityClient
}

/**
 * Security Service
*/
export const SecurityService = ({ tokenService, securityClient }: SecurityServiceOptions): ISecurityService => ({
  /**
   * Login a user
   *
   * @param user - The user to login
   * @returns The user token
  */
  async login (user: UserLogin): Promise<void> {
    const token = await securityClient.login(user)
    tokenService.saveToken(token)
  },

  /**
   * Logout a user
  */
  async logout (): Promise<void> {
    await securityClient.logout()
    tokenService.removeToken()
  },

  /**
   * Register a user
   *
   * @param user - The user to register
  */
  async register (user: UserRegister): Promise<void> {
    await securityClient.register(user)
  },

  /**
   * Change the user password
   *
   * @param password - The password to change
  */
  async changePassword (password: UserChangePassword): Promise<void> {
    await securityClient.changePassword(password)
  },

  /**
   * Check if the user is authenticated
   *
   * @returns True if the user is authenticated, false otherwise
   */
  isAuthenticated (): boolean {
    return tokenService.isAuthenticated()
  }
})

/**
 * Security Service Blueprint
 *
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
export const SecurityServiceBlueprint = defineService(SecurityService, { alias: 'securityService', isFactory: true })
