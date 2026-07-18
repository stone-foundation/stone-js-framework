import { randomUUID } from 'node:crypto'
import { UserModel } from '../models/User'
import { Session } from '../models/Session'
import { defineService } from '@stone-js/core'
import { ISessionService } from './contracts/ISessionService'
import { ISessionRepository } from '../repositories/contracts/ISessionRepository'

/**
 * Session Service Options
 */
export interface SessionServiceOptions {
  sessionRepository: ISessionRepository
}

/**
 * Factory Session Service
*/
export function factorySessionService ({ sessionRepository }: SessionServiceOptions): ISessionService {
  return {
    /**
     * Finds all sessions.
     *
     * @param limit - The limit of sessions to list
     * @returns The list of sessions
     */
    async list (limit: number): Promise<Session[]> {
      return await sessionRepository.list(limit)
    },

    /**
     * Finds a sessions by user.
     *
     * @param user - The user to look up
     * @param limit - The limit of sessions to list
     * @returns The list of sessions
     */
    async getByUser (user: UserModel, limit: number): Promise<Session[]> {
      return await sessionRepository.listByUser(user, limit)
    },

    /**
     * Finds a session by ID.
     *
     * @param sessionId - The session ID to look up
     * @returns The session data or `undefined` if not found
     */
    async getById (id: number): Promise<Session | undefined> {
      return await sessionRepository.findById(id)
    },

    /**
     * Finds the latest session of a user.
     *
     * @param user - The user to look up
     * @returns The latest session or `undefined` if not found
     */
    async getLatest (user: UserModel): Promise<Session | undefined> {
      return await sessionRepository.getLatest(user)
    },

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

      return await sessionRepository.create(session)
    },

    /**
     * Updates the last activity timestamp of a session.
     *
     * @param sessionId - The session ID to update
     * @returns `true` if the session was updated, otherwise `false`
     */
    async updateLastActivity (session: Session): Promise<void> {
      await sessionRepository.update(session.id, { lastActivityAt: Date.now() })
    },

    /**
     * Extends a session expiration time.
     *
     * @param sessionId - The session ID to extend
     * @param additionalTime - Additional time in milliseconds
     * @returns `true` if the session was extended, otherwise `false`
     */
    async extend (session: Session, additionalTime: number): Promise<Session> {
      session.expiresAt = Date.now() + additionalTime
      await sessionRepository.update(session.id, session)
      return session
    },

    /**
     * Closes a session.
     *
     * @param sessionId - The session ID to close
     */
    async close (session: Session): Promise<void> {
      session.closedAt = Date.now()
      await sessionRepository.update(session.id, session)
    }
  }
}

/**
 * Session Service
 *
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
 */
export const SessionService = defineService(factorySessionService, { isFactory: true, singleton: true, alias: 'sessionService' })
