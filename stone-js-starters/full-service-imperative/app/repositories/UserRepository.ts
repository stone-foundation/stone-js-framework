import { eq } from 'drizzle-orm'
import { users } from '../database/schema'
import { UserModel } from '../models/User'
import { defineStone } from '@stone-js/core'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IUserRepository } from './contracts/IUserRepository'

/**
 * User Repository Options
 */
export interface UserRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * Factory User Repository
 */
export function factoryUserRepository ({ database }: UserRepositoryOptions): IUserRepository {
  return {
    /**
     * List users
     *
     * @param limit - The limit of users to list
     * @returns The list of users
     */
    async list (limit: number): Promise<UserModel[]> {
      return await database.select().from(users).limit(limit)
    },

    /**
     * Find a user by ID
     *
     * @param id - The ID of the user to find
     * @returns The user or undefined if not found
     */
    async findById (id: number): Promise<UserModel | undefined> {
      const result = await database.select().from(users).where(eq(users.id, id)).get()
      return result ?? undefined
    },

    /**
     * Find a user by dynamic conditions
     *
     * @param conditions - Conditions to match the user
     * @returns The user or undefined if not found
     */
    async findBy (conditions: Partial<UserModel>): Promise<UserModel | undefined> {
      const result = await database.select().from(users).where(eq(users.email, conditions.email ?? '')).get()
      return result ?? undefined
    },

    /**
     * Create a user
     *
     * @param user - The user to create
     * @returns The ID of the created user
     */
    async create (user: Omit<UserModel, 'id'>): Promise<bigint | undefined> {
      const result = await database.insert(users).values(user)
      return result.lastInsertRowid
    },

    /**
     * Update a user
     *
     * @param id - The ID of the user to update
     * @param user - The user data to update
     * @returns The updated user or undefined if not found
     */
    async update (id: number, user: Partial<UserModel>): Promise<UserModel | undefined> {
      const result = await database.update(users).set(user).where(eq(users.id, id)).returning().get()
      return result ?? undefined
    },

    /**
     * Delete a user
     *
     * @param id - The ID of the user to delete
     * @returns `true` if the user was deleted, `false` if the user was not found
     */
    async delete (id: number): Promise<boolean> {
      const result = await database.delete(users).where(eq(users.id, id)).run()
      return result.rowsAffected > 0
    }
  }
}

/**
 * User Repository
 */
export const UserRepository = defineStone(factoryUserRepository, { isFactory: true, singleton: true, alias: 'userRepository' })
