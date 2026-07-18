import { UserLogin, UserToken, UserRegister, UserChangePassword } from '../../models/User'

/**
 * Security Client contract
 */
export interface ISecurityClient {
  /**
   * Login a user.
   *
   * @param user - The user login credentials.
   * @returns The access token.
   */
  login: (user: UserLogin) => Promise<UserToken>

  /**
   * Logout the currently authenticated user.
   */
  logout: () => Promise<void>

  /**
   * Register a new user.
   *
   * @param user - The user registration data.
   */
  register: (user: UserRegister) => Promise<void>

  /**
   * Change the password of the current user.
   *
   * @param password - The current and new password.
   */
  changePassword: (password: UserChangePassword) => Promise<void>
}
