import { UserModel } from '../../models/User'

/**
 * User Repository contract
 */
export interface IUserRepository {
  /**
   * List users
   *
   * @param limit - The limit of users to list
   * @returns The list of users
   */
  list: (limit: number) => Promise<UserModel[]>

  /**
   * Find a user by ID
   *
   * @param id - The ID of the user to find
   * @returns The user or undefined if not found
   */
  findById: (id: number) => Promise<UserModel | undefined>

  /**
   * Find a user by dynamic conditions
   *
   * @param conditions - Conditions to match the user
   * @returns The user or undefined if not found
   */
  findBy: (conditions: Partial<UserModel>) => Promise<UserModel | undefined>

  /**
   * Create a user
   *
   * @param user - The user to create
   * @returns The ID of the created user
   */
  create: (user: Omit<UserModel, 'id'>) => Promise<bigint | undefined>

  /**
   * Update a user
   *
   * @param id - The ID of the user to update
   * @param user - The user data to update
   * @returns The updated user or undefined if not found
   */
  update: (id: number, user: Partial<UserModel>) => Promise<UserModel | undefined>

  /**
   * Delete a user
   *
   * @param id - The ID of the user to delete
   * @returns `true` if the user was deleted, `false` if not
   */
  delete: (id: number) => Promise<boolean>
}
