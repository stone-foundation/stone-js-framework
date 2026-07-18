import { UserModel } from '../../models/User'
import { Session } from '../../models/Session'

/**
 * Session Service contract
 */
export interface ISessionService {
  /**
   * Finds all sessions.
   *
   * @param limit - The limit of sessions to list.
   * @returns The list of sessions.
   */
  list: (limit: number) => Promise<Session[]>

  /**
   * Finds sessions by user.
   *
   * @param user - The user to look up.
   * @param limit - The limit of sessions to list.
   * @returns The list of sessions.
   */
  getByUser: (user: UserModel, limit: number) => Promise<Session[]>

  /**
   * Finds a session by ID.
   *
   * @param id - The session ID to look up.
   * @returns The session or `undefined` if not found.
   */
  getById: (id: number) => Promise<Session | undefined>

  /**
   * Finds the latest session of a user.
   *
   * @param user - The user to look up.
   * @returns The latest session or `undefined`.
   */
  getLatest: (user: UserModel) => Promise<Session | undefined>

  /**
   * Creates a new session for a user.
   *
   * @param user - The user to create the session for.
   * @param ip - The user's IP address.
   * @param userAgent - Optional user agent string.
   * @returns The created session.
   */
  createForUser: (user: UserModel, ip: string, userAgent?: string) => Promise<Session>

  /**
   * Updates the last activity timestamp of a session.
   *
   * @param session - The session to update.
   */
  updateLastActivity: (session: Session) => Promise<void>

  /**
   * Extends the expiration time of a session.
   *
   * @param session - The session to extend.
   * @param additionalTime - The additional time in milliseconds.
   * @returns The updated session.
   */
  extend: (session: Session, additionalTime: number) => Promise<Session>

  /**
   * Closes a session.
   *
   * @param session - The session to close.
   */
  close: (session: Session) => Promise<void>
}
