import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { SessionService } from './SessionService'
import { UserRepository } from '../repositories/UserRepository'
import { BadCredentialsError } from '../errors/CredentialsError'
import { IBlueprint, isEmpty, isNotEmpty, Service } from '@stone-js/core'
import { BadRequestError, IncomingHttpEvent, UnauthorizedError } from '@stone-js/http-core'
import { UserLogin, UserToken, UserRegister, UserChangePassword, UserModel, UserTokenPayload } from '../models/User'

/**
 * Security Service Options
*/
export interface SecurityServiceOptions {
  blueprint: IBlueprint
  userRepository: UserRepository
  sessionService: SessionService
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
  private readonly blueprint: IBlueprint
  private readonly userRepository: UserRepository
  private readonly sessionService: SessionService

  /**
   * Create a new Security Service
  */
  constructor ({ blueprint, userRepository, sessionService }: SecurityServiceOptions) {
    this.blueprint = blueprint
    this.userRepository = userRepository
    this.sessionService = sessionService
  }

  /**
   * Login a user
   *
   * @param credentials - The user to login
   * @returns The user token
  */
  async login (event: IncomingHttpEvent, credentials: UserLogin): Promise<UserToken> {
    const user = await this.userRepository.findBy(credentials)

    if (isEmpty(user)) {
      throw new BadCredentialsError(`The user with email ${credentials.email} does not exist`)
    }

    if (!(await this.comparePassword(credentials.password, user.password))) {
      throw new BadCredentialsError('Invalid user password')
    }

    return {
      tokenType: 'bearer',
      expiresIn: this.blueprint.get<number>('security.jwt.expiresIn', 3600),
      accessToken: await this.generateToken(user, event.ip, event.userAgent)
    }
  }

  /**
   * Refresh a token
   *
   * @param token - The token to refresh
  */
  async refresh (token: string): Promise<UserToken> {
    const payload = this.verifyToken(token)
    const user = await this.userRepository.findById(payload.user.id)

    if (isEmpty(user)) {
      throw new UnauthorizedError('User not found')
    }

    return {
      tokenType: 'bearer',
      expiresIn: this.blueprint.get<number>('security.jwt.expiresIn', 3600),
      accessToken: await this.generateToken(user, payload.session.ip, payload.session.userAgent ?? undefined)
    }
  }

  /**
   * Logout a user
   *
   * @param token - The token to logout
  */
  async logout (token: string): Promise<void> {
    const payload = this.verifyToken(token)
    await this.sessionService.close(payload.session)
  }

  /**
   * Authenticate a user
   *
   * @param token - The token to authenticate
   * @returns The authenticated user
  */
  async authenticate (token: string, ip: string, userAgent?: string): Promise<UserModel> {
    const payload = this.verifyToken(token)
    const user = await this.userRepository.findById(payload.user.id)

    if (payload.session.ip !== ip) {
      throw new UnauthorizedError('Invalid IP address')
    } else if (payload.session.userAgent !== userAgent) {
      throw new UnauthorizedError('Invalid user agent')
    } else if (isEmpty(user)) {
      throw new UnauthorizedError('User not found')
    }

    await this.sessionService.updateLastActivity(payload.session)

    return user
  }

  /**
   * Hashes a password before storing it in the database.
   *
   * @param password - The plaintext password.
   * @returns The hashed password.
   */
  async hashPassword (password: string): Promise<string> {
    return await bcrypt.hash(password, this.blueprint.get<number>('security.bcrypt.saltRounds', 10))
  }

  /**
   * Compares a plaintext password with a hashed password.
   *
   * @param password - The plaintext password.
   * @param hashedPassword - The stored hashed password.
   * @returns `true` if the password matches, otherwise `false`.
   */
  async comparePassword (password: string, hashedPassword?: string | null): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword ?? '')
  }

  /**
   * Generates a JWT token for a user.
   *
   * @param user - The user information to include in the token.
   * @returns The generated JWT token.
   */
  async generateToken (user: UserModel, ip: string, userAgent?: string): Promise<string> {
    let session = await this.sessionService.getLatest(user)

    if (
      isEmpty(session) ||
      session?.ip !== ip ||
      isNotEmpty(session.closedAt) ||
      session?.userAgent !== userAgent
    ) {
      session = await this.sessionService.createForUser(user, ip, userAgent)
    } else {
      session = await this.sessionService.extend(
        session,
        this.blueprint.get<number>('security.jwt.expiresIn', 3600)
      )
    }

    return jwt.sign(
      {
        user: {
          ...user,
          password: undefined
        },
        session
      },
      this.blueprint.get<string>('security.secret', 'secret'),
      this.blueprint.get<jwt.SignOptions>('security.jwt')
    )
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   *
   * @param token - The JWT token to verify.
   * @returns The decoded user payload or null if invalid.
   */
  verifyToken = (token: string): UserTokenPayload => {
    try {
      return jwt.verify(
        token,
        this.blueprint.get<string>('security.secret', 'secret')
      ) as UserTokenPayload
    } catch (error: any) {
      throw new UnauthorizedError('Invalid token', { cause: error })
    }
  }

  /**
   * Register a user
   *
   * @param user - The user to register
  */
  async register (payload: UserRegister): Promise<void> {
    const user = await this.userRepository.findBy({ email: payload.email })

    if (isNotEmpty(user)) {
      throw new BadRequestError(`The user with email ${payload.email} already exists`)
    }

    const password = await this.hashPassword(payload.password)

    await this.userRepository.create({
      ...payload,
      password,
      updatedAt: Date.now(),
      createdAt: Date.now()
    })
  }

  /**
   * Change the user password
   *
   * @param user - The user to change the password
   * @param password - The password to change
  */
  async changePassword (user?: UserModel, password?: UserChangePassword): Promise<void> {
    if (isEmpty(user)) {
      throw new UnauthorizedError('User not found')
    }

    if (isEmpty(password) || !(await this.comparePassword(password.password, user.password))) {
      throw new UnauthorizedError('Invalid user password')
    }

    await this.userRepository.update(user.id, { password: password.newPassword })
  }
}
