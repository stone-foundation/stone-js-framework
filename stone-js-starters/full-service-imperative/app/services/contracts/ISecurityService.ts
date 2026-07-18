import { IncomingHttpEvent } from '@stone-js/http-core'
import { UserLogin, UserToken, UserModel, UserTokenPayload, UserRegister, UserChangePassword } from '../../models/User'

/**
 * Security Service contract
 */
export interface ISecurityService {
  /**
   * Logs in a user and returns a JWT token.
   *
   * @param event - The incoming HTTP event containing IP and user agent.
   * @param credentials - The user's email and password.
   * @returns The user token.
   * @throws BadCredentialsError if credentials are invalid.
   */
  login: (event: IncomingHttpEvent, credentials: UserLogin) => Promise<UserToken>

  /**
   * Refreshes an access token using a valid existing token.
   *
   * @param token - The current JWT token.
   * @returns The refreshed user token.
   * @throws UnauthorizedError if the token is invalid or user not found.
   */
  refresh: (token: string) => Promise<UserToken>

  /**
   * Logs out a user by closing the associated session.
   *
   * @param token - The JWT token of the user session.
   */
  logout: (token: string) => Promise<void>

  /**
   * Authenticates a user based on a token, IP, and user agent.
   *
   * @param token - The JWT token to verify.
   * @param ip - The IP address of the request.
   * @param userAgent - Optional user agent string.
   * @returns The authenticated user.
   * @throws UnauthorizedError if token or session info is invalid.
   */
  authenticate: (token: string, ip: string, userAgent?: string) => Promise<UserModel>

  /**
   * Hashes a plaintext password using bcrypt.
   *
   * @param password - The plaintext password.
   * @returns The hashed password.
   */
  hashPassword: (password: string) => Promise<string>

  /**
   * Compares a plaintext password with a hashed one.
   *
   * @param password - The plaintext password.
   * @param hashedPassword - The hashed password.
   * @returns `true` if the password matches, `false` otherwise.
   */
  comparePassword: (password: string, hashedPassword?: string | null) => Promise<boolean>

  /**
   * Generates a signed JWT token for a user and session.
   *
   * @param user - The user to generate a token for.
   * @param ip - The IP address of the request.
   * @param userAgent - Optional user agent.
   * @returns The generated JWT token string.
   */
  generateToken: (user: UserModel, ip: string, userAgent?: string) => Promise<string>

  /**
   * Verifies a JWT token and returns the payload.
   *
   * @param token - The JWT token to verify.
   * @returns The decoded payload.
   * @throws UnauthorizedError if the token is invalid.
   */
  verifyToken: (token: string) => UserTokenPayload

  /**
   * Registers a new user.
   *
   * @param payload - The user registration data.
   * @throws BadRequestError if the email is already in use.
   */
  register: (payload: UserRegister) => Promise<void>

  /**
   * Changes the password of a user.
   *
   * @param user - The user whose password is being changed.
   * @param password - The old and new passwords.
   * @throws UnauthorizedError if validation fails.
   */
  changePassword: (user?: UserModel, password?: UserChangePassword) => Promise<void>
}
