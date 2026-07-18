import { User, UserInput } from '../../models/User'

/**
 * User Client contract
 */
export interface IUserClient {
  /**
   * List users.
   *
   * @param limit - The limit of users to list (default: 10).
   * @returns The list of users.
   */
  list: (limit?: number) => Promise<User[]>

  /**
   * Get the currently authenticated user.
   *
   * @returns The current user.
   */
  currentUser: () => Promise<User>

  /**
   * Find a user by ID.
   *
   * @param id - The ID of the user to find.
   * @returns The found user.
   */
  find: (id: number) => Promise<User>

  /**
   * Create a new user.
   *
   * @param user - The user data to create.
   * @returns The created user.
   */
  create: (user: UserInput) => Promise<User>

  /**
   * Update the currently authenticated user.
   *
   * @param user - The updated user data.
   * @returns The updated user.
   */
  updateCurrent: (user: UserInput) => Promise<User>

  /**
   * Update a user by ID.
   *
   * @param id - The ID of the user to update.
   * @param user - The updated user data.
   * @returns The updated user.
   */
  update: (id: number, user: UserInput) => Promise<User>

  /**
   * Delete a user by ID.
   *
   * @param id - The ID of the user to delete.
   */
  delete: (id: number) => Promise<void>
}
