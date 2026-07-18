import { Service } from '@stone-js/core'
import { randomUUID } from 'node:crypto'
import { UserModel } from '../models/User'
import { Session } from '../models/Session'
import { SessionRepository } from '../repositories/SessionRepository'

/**
 * Session Service Options
 */
export interface SessionServiceOptions {
  sessionRepository: SessionRepository
}

/**
 * Session Service
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
@Service({ alias: 'sessionService' })
export class SessionService {
  private readonly sessionRepository: SessionRepository

  /**
   * Create a new Session Service
   *
   * @param options - The options to create the service
  */
  constructor ({ sessionRepository }: SessionServiceOptions) {
    this.sessionRepository = sessionRepository
  }

  /**
   * Finds all sessions.
   *
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  async list (limit: number): Promise<Session[]> {
    return await this.sessionRepository.list(limit)
  }

  /**
   * Finds a sessions by user.
   *
   * @param user - The user to look up
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  async getByUser (user: UserModel, limit: number): Promise<Session[]> {
    return await this.sessionRepository.listByUser(user, limit)
  }

  /**
   * Finds a session by ID.
   *
   * @param sessionId - The session ID to look up
   * @returns The session data or `undefined` if not found
   */
  async getById (id: number): Promise<Session | undefined> {
    return await this.sessionRepository.findById(id)
  }

  /**
   * Finds the latest session of a user.
   *
   * @param user - The user to look up
   * @returns The latest session or `undefined` if not found
   */
  async getLatest (user: UserModel): Promise<Session | undefined> {
    return await this.sessionRepository.getLatest(user)
  }

  /**
   * Creates a new session for a user.
   *
   * @param user - The user to create the session for
   * @param ip - The IP address of the user
   * @param userAgent - The user agent of the user
   * @returns The created session
  */
  async createForUser (user: UserModel, ip: string, userAgent?: string): Promise<Session> {
    const session = {
      ip,
      userAgent,
      userId: user.id,
      createdAt: Date.now(),
      uuid: randomUUID(),
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + 3600
    }

    return await this.sessionRepository.create(session)
  }

  /**
   * Updates the last activity timestamp of a session.
   *
   * @param sessionId - The session ID to update
   * @returns `true` if the session was updated, otherwise `false`
   */
  async updateLastActivity (session: Session): Promise<void> {
    await this.sessionRepository.update(session.id, { lastActivityAt: Date.now() })
  }

  /**
   * Extends a session expiration time.
   *
   * @param sessionId - The session ID to extend
   * @param additionalTime - Additional time in milliseconds
   * @returns `true` if the session was extended, otherwise `false`
   */
  async extend (session: Session, additionalTime: number): Promise<Session> {
    session.expiresAt = Date.now() + additionalTime
    await this.sessionRepository.update(session.id, session)
    return session
  }

  /**
   * Closes a session.
   *
   * @param sessionId - The session ID to close
   */
  async close (session: Session): Promise<void> {
    session.closedAt = Date.now()
    await this.sessionRepository.update(session.id, session)
  }
}
