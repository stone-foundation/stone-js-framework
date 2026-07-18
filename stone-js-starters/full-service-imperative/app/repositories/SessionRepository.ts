import { desc, eq } from 'drizzle-orm'
import { UserModel } from '../models/User'
import { Session } from '../models/Session'
import { defineStone } from '@stone-js/core'
import { sessions } from '../database/schema'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { ISessionRepository } from './contracts/ISessionRepository'

/**
 * Session Session Repository Options
 */
export interface SessionRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * Factory Session Repository
 */
export function factorySessionRepository ({ database }: SessionRepositoryOptions): ISessionRepository {
  return {
    /**
     * List sessions
     *
     * @param limit - The limit of sessions to list
     * @returns The list of sessions
     */
    async list (limit: number): Promise<Session[]> {
      return await database
        .select()
        .from(sessions)
        .orderBy(desc(sessions.createdAt))
        .limit(limit)
    },

    /**
     * List sessions
     *
     * @param limit - The limit of sessions to list
     * @returns The list of sessions
     */
    async listByUser (user: UserModel, limit: number): Promise<Session[]> {
      return await database
        .select()
        .from(sessions)
        .where(eq(sessions.userId, user.id))
        .orderBy(desc(sessions.createdAt))
        .limit(limit)
    },

    /**
     * Find a session by ID
     *
     * @param id - The ID of the session to find
     * @returns The session or undefined if not found
     */
    async findById (id: number): Promise<Session | undefined> {
      const result = await database.select().from(sessions).where(eq(sessions.id, id)).get()
      return result ?? undefined
    },

    /**
     * Retrieves the latest session for a given user.
     *
     * @param user - The user whose last session is being retrieved.
     * @returns The latest session or `undefined` if none exists.
     */
    async getLatest (user: UserModel): Promise<Session | undefined> {
      return await database
        .select()
        .from(sessions)
        .where(eq(sessions.userId, user.id))
        .orderBy(desc(sessions.createdAt))
        .limit(1)
        .get()
    },

    /**
     * Create a session
     *
     * @param session - The session to create
     * @returns The ID of the created session
     */
    async create (session: Omit<Session, 'id'>): Promise<Session> {
      return await database.insert(sessions).values(session).returning().get()
    },

    /**
     * Update a session
     *
     * @param id - The ID of the session to update
     * @param session - The session data to update
     * @returns The updated session or undefined if not found
     */
    async update (id: number, session: Partial<Session>): Promise<Session | undefined> {
      const result = await database.update(sessions).set(session).where(eq(sessions.id, id)).returning().get()
      return result ?? undefined
    },

    /**
     * Delete a session
     *
     * @param id - The ID of the session to delete
     * @returns `true` if the session was deleted, `false` if the session was not found
     */
    async delete (id: number): Promise<boolean> {
      const result = await database.delete(sessions).where(eq(sessions.id, id)).run()
      return result.rowsAffected > 0
    }
  }
}

/**
 * Session Repository
 */
export const SessionRepository = defineStone(factorySessionRepository, { isFactory: true, singleton: true, alias: 'sessionRepository' })
