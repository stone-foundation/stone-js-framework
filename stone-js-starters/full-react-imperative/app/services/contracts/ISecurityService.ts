import { UserLogin, UserRegister, UserChangePassword } from '../../models/User'

/**
 * Security Service contract
 */
export interface ISecurityService {
  /**
   * Login a user and store their token.
   *
   * @param user - The user login credentials.
   */
  login: (user: UserLogin) => Promise<void>

  /**
   * Logout the user and clear the token.
   */
  logout: () => Promise<void>

  /**
   * Register a new user.
   *
   * @param user - The user registration data.
   */
  register: (user: UserRegister) => Promise<void>

  /**
   * Change the user's password.
   *
   * @param password - The password payload.
   */
  changePassword: (password: UserChangePassword) => Promise<void>

  /**
   * Check if the user is currently authenticated.
   *
   * @returns `true` if authenticated, `false` otherwise.
   */
  isAuthenticated: () => boolean
}
