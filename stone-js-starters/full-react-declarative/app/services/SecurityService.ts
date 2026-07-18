import { Service } from '@stone-js/core'
import { TokenService } from './TokenService'
import { SecurityClient } from '../clients/SecurityClient'
import { UserChangePassword, UserLogin, UserRegister } from '../models/User'

/**
 * Security Service Options
*/
export interface SecurityServiceOptions {
  tokenService: TokenService
  securityClient: SecurityClient
}

/**
 * Security Service
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
@Service({ alias: 'securityService' })
export class SecurityService {
  private readonly tokenService: TokenService
  private readonly securityClient: SecurityClient

  /**
   * Create a new Security Service
  */
  constructor ({ tokenService, securityClient }: SecurityServiceOptions) {
    this.tokenService = tokenService
    this.securityClient = securityClient
  }

  /**
   * Login a user
   *
   * @param user - The user to login
   * @returns The user token
  */
  async login (user: UserLogin): Promise<void> {
    const token = await this.securityClient.login(user)
    this.tokenService.saveToken(token)
  }

  /**
   * Logout a user
  */
  async logout (): Promise<void> {
    await this.securityClient.logout()
    this.tokenService.removeToken()
  }

  /**
   * Register a user
   *
   * @param user - The user to register
  */
  async register (user: UserRegister): Promise<void> {
    await this.securityClient.register(user)
  }

  /**
   * Change the user password
   *
   * @param password - The password to change
  */
  async changePassword (password: UserChangePassword): Promise<void> {
    await this.securityClient.changePassword(password)
  }

  /**
   * Check if the user is authenticated
   *
   * @returns True if the user is authenticated, false otherwise
   */
  isAuthenticated (): boolean {
    return this.tokenService.isAuthenticated()
  }
}
