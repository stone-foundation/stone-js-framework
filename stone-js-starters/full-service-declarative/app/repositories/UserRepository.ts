import { eq } from 'drizzle-orm'
import { Stone } from '@stone-js/core'
import { users } from '../database/schema'
import { UserModel } from '../models/User'
import { LibSQLDatabase } from 'drizzle-orm/libsql'

/**
 * User Repository Options
 */
export interface UserRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * User Repository
 *
 * @Stone() is a decorator that marks a class as a Stone component.
 * @Stone() Think of it like a Bean in Spring or a Component in Angular.
 * The alias is required to get benefits of destructuring Dependency Injection.
 */
@Stone({ alias: 'userRepository' })
export class UserRepository {
  private readonly database: LibSQLDatabase

  /**
   * Create a new instance of UserRepository
   *
   * @param options - The options to create the repository
   */
  constructor ({ database }: UserRepositoryOptions) {
    this.database = database
  }

  /**
   * List users
   *
   * @param limit - The limit of users to list
   * @returns The list of users
   */
  async list (limit: number): Promise<UserModel[]> {
    return await this.database.select().from(users).limit(limit)
  }

  /**
   * Find a user by ID
   *
   * @param id - The ID of the user to find
   * @returns The user or undefined if not found
   */
  async findById (id: number): Promise<UserModel | undefined> {
    const result = await this.database.select().from(users).where(eq(users.id, id)).get()
    return result ?? undefined
  }

  /**
   * Find a user by dynamic conditions
   *
   * @param conditions - Conditions to match the user
   * @returns The user or undefined if not found
   */
  async findBy (conditions: Partial<UserModel>): Promise<UserModel | undefined> {
    const result = await this.database.select().from(users).where(eq(users.email, conditions.email ?? '')).get()
    return result ?? undefined
  }

  /**
   * Create a user
   *
   * @param user - The user to create
   * @returns The ID of the created user
   */
  async create (user: Omit<UserModel, 'id'>): Promise<bigint | undefined> {
    const result = await this.database.insert(users).values(user)
    return result.lastInsertRowid
  }

  /**
   * Update a user
   *
   * @param id - The ID of the user to update
   * @param user - The user data to update
   * @returns The updated user or undefined if not found
   */
  async update (id: number, user: Partial<UserModel>): Promise<UserModel | undefined> {
    const result = await this.database.update(users).set(user).where(eq(users.id, id)).returning().get()
    return result ?? undefined
  }

  /**
   * Delete a user
   *
   * @param id - The ID of the user to delete
   * @returns `true` if the user was deleted, `false` if the user was not found
   */
  async delete (id: number): Promise<boolean> {
    const result = await this.database.delete(users).where(eq(users.id, id)).run()
    return result.rowsAffected > 0
  }
}
