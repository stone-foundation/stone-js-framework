import { Axios } from 'axios'
import { UserToken } from '../models/User'
import { ReactIncomingEvent } from '@stone-js/use-react'
import { ITokenService } from './contracts/ITokenService'
import { defineService, IContainer, isNotEmpty } from '@stone-js/core'

/**
 * Token Service Options
*/
export interface TokenServiceOptions {
  axios: Axios
  container: IContainer
}

/**
 * Token Service
*/
export const TokenService = ({ container, axios }: TokenServiceOptions): ITokenService => ({
  /**
   * Refresh the user token
  */
  async refresh (): Promise<void> {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${String(this.getAccessToken())}`
    }
    const response = await axios.post<UserToken>('/refresh', {}, { headers })

    this.saveToken(response.data)
  },

  /**
   * Set the token
   *
   * The event must be resolved on demand
   * because the event is not available at the time of service creation.
   * The event is available only when the request is made.
   *
   * @param token - The token to set
  */
  saveToken (token: UserToken): void {
    container.make<ReactIncomingEvent>('event').cookies.add(
      'token',
      { ...token, createdAt: Date.now() },
      {
        path: '/',
        secure: true,
        httpOnly: false,
        maxAge: token.expiresIn
      }
    )
  },

  /**
   * Remove the token
  */
  removeToken (): void {
    container.make<ReactIncomingEvent>('event').cookies.remove(
      'token',
      {
        path: '/',
        secure: true,
        httpOnly: false
      }
    )
  },

  /**
   * Get the token
   *
   * The event must be resolved on demand
   * because the event is not available at the time of service creation.
   * The event is available only when the request is made.
   *
   * @returns The token
  */
  getToken (): UserToken | undefined {
    return container.make<ReactIncomingEvent>('event').cookies.getValue('token')
  },

  /**
   * Get the access token
   *
   * @returns The access token
   */
  getAccessToken (): string | undefined {
    return this.getToken()?.accessToken
  },

  /**
   * Check if the user is authenticated
   *
   * @returns True if the user is authenticated, false otherwise
   */
  isAuthenticated (): boolean {
    const token = this.getToken()
    return isNotEmpty<UserToken>(token) && (token.createdAt + (token.expiresIn * 1000)) > Date.now()
  }
})

/**
 * Token Service Blueprint
 *
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
 */
export const TokenServiceBlueprint = defineService(TokenService, { alias: 'tokenService', isFactory: true })
