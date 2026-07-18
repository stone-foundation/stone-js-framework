import { UserModel } from '../../models/User'
import { Session } from '../../models/Session'

/**
 * Session Repository contract
 */
export interface ISessionRepository {
  /**
   * List sessions
   *
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  list: (limit: number) => Promise<Session[]>

  /**
   * List sessions by user
   *
   * @param user - The user
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  listByUser: (user: UserModel, limit: number) => Promise<Session[]>

  /**
   * Find a session by ID
   *
   * @param id - The session ID
   * @returns The session or undefined
   */
  findById: (id: number) => Promise<Session | undefined>

  /**
   * Get latest session for a user
   *
   * @param user - The user
   * @returns The latest session or undefined
   */
  getLatest: (user: UserModel) => Promise<Session | undefined>

  /**
   * Create a session
   *
   * @param session - The session data
   * @returns The created session
   */
  create: (session: Omit<Session, 'id'>) => Promise<Session>

  /**
   * Update a session
   *
   * @param id - The session ID
   * @param session - The partial session data
   * @returns The updated session or undefined
   */
  update: (id: number, session: Partial<Session>) => Promise<Session | undefined>

  /**
   * Delete a session
   *
   * @param id - The session ID
   * @returns `true` if deleted, `false` otherwise
   */
  delete: (id: number) => Promise<boolean>
}
