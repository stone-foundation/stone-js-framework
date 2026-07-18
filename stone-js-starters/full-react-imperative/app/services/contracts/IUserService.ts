import { User, UserInput } from '../../models/User'

/**
 * User Service contract
 */
export interface IUserService {
  /**
   * List users.
   *
   * @param limit - The number of users to list (default: 10).
   * @returns The list of users.
   */
  list: (limit?: number) => Promise<User[]>

  /**
   * Get the currently authenticated user.
   *
   * @returns The current user.
   */
  current: () => Promise<User>

  /**
   * Find a user by conditions (e.g., by ID).
   *
   * @param conditions - Conditions to identify the user (e.g., `{ id: number }`).
   * @returns The found user.
   * @throws UserNotFoundError if the user is not found.
   */
  find: (conditions: Record<string, any>) => Promise<User>

  /**
   * Find a user by key-value pair with snapshot caching.
   *
   * @param key - The key to filter by (e.g., `"email"`).
   * @param value - The value to match.
   * @returns The found user or throws UserNotFoundError.
   */
  findBy: (key: string, value: any) => Promise<User | undefined>

  /**
   * Create a new user.
   *
   * @param user - The user data to create.
   */
  create: (user: UserInput) => Promise<void>

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
