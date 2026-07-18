
import { Axios } from 'axios'
import { Stone } from '@stone-js/core'
import { AxiosClient } from './AxiosClient'
import { UserChangePassword, UserLogin, UserRegister, UserToken } from '../models/User'

/**
 * Security Client Options
*/
export interface SecurityClientOptions {
  axios: Axios
  httpClient: AxiosClient
}

/**
 * Security Client
 */
@Stone({ alias: 'securityClient' })
export class SecurityClient {
  private readonly axios: Axios
  private readonly client: AxiosClient

  /**
   * Create a new Security Client
   *
   * @param options - The options to create the Security Client.
   */
  constructor ({ axios, httpClient }: SecurityClientOptions) {
    this.axios = axios
    this.client = httpClient
  }

  /**
   * Login a user
   *
   * @param user - The user to login
   */
  async login (user: UserLogin): Promise<UserToken> {
    return (await this.axios.post<UserToken>('/login', user)).data
  }

  /**
   * Logout a user
   */
  async logout (): Promise<void> {
    await this.client.post<UserToken>('/logout')
  }

  /**
   * Register a user
   *
   * @param user - The user to register
   */
  async register (user: UserRegister): Promise<void> {
    await this.axios.post('/register', user)
  }

  /**
   * Change the user password
   *
   * @param password - The password to change
   */
  async changePassword (password: UserChangePassword): Promise<void> {
    await this.client.patch('/change-password', password)
  }
}
