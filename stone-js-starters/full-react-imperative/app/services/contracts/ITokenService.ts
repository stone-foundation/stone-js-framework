import { UserToken } from '../../models/User'

/**
 * Token Service contract
 */
export interface ITokenService {
  /**
   * Refresh the user token by making a call to the refresh endpoint.
   */
  refresh: () => Promise<void>

  /**
   * Save the token in the cookies.
   *
   * @param token - The token to store.
   */
  saveToken: (token: UserToken) => void

  /**
   * Remove the token from cookies.
   */
  removeToken: () => void

  /**
   * Get the full token object from cookies.
   *
   * @returns The stored token, or `undefined` if not found.
   */
  getToken: () => UserToken | undefined

  /**
   * Get only the access token string from the stored token.
   *
   * @returns The access token string, or `undefined`.
   */
  getAccessToken: () => string | undefined

  /**
   * Check if the user is currently authenticated based on token expiry.
   *
   * @returns `true` if the user is authenticated, otherwise `false`.
   */
  isAuthenticated: () => boolean
}
