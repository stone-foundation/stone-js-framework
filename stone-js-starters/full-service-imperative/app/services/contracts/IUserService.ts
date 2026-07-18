import { UserModel } from '../../models/User'

/**
 * User Service contract
 */
export interface IUserService {
  /**
   * List users.
   *
   * @param limit - The limit of users to list.
   * @returns A list of users.
   */
  list: (limit?: number) => Promise<UserModel[]>

  /**
   * Find a user by conditions.
   *
   * @param conditions - The conditions to find the user (e.g., by ID).
   * @returns The found user.
   * @throws NotFoundError if user is not found.
   */
  findBy: (conditions: Record<string, any>) => Promise<UserModel>

  /**
   * Find a user by email or other unique field.
   *
   * @param conditions - The conditions (typically email).
   * @returns The user or `undefined` if not found.
   */
  findByEmail: (conditions: Record<string, any>) => Promise<UserModel | undefined>

  /**
   * Create a new user.
   *
   * @param payload - The user data to create.
   * @returns The ID of the created user.
   */
  create: (payload: Omit<UserModel, 'id'>) => Promise<bigint | undefined>

  /**
   * Update a user.
   *
   * @param id - The user ID.
   * @param payload - The updated user data.
   * @returns The updated user.
   * @throws NotFoundError if the user is not found.
   */
  update: (id: number, payload: UserModel) => Promise<UserModel>

  /**
   * Delete a user.
   *
   * @param id - The user ID.
   * @returns `true` if the user was deleted, `false` otherwise.
   */
  delete: (id: number) => Promise<boolean>
}
