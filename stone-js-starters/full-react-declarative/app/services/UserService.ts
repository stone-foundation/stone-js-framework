import { Snapshot } from '@stone-js/use-react'
import { UserEvent } from '../events/UserEvent'
import { User, UserInput } from '../models/User'
import { UserClient } from '../clients/UserClient'
import { UserNotFoundError } from '../errors/UserNotFoundError'
import { EventEmitter, isEmpty, Service } from '@stone-js/core'

/**
 * User Service Options
*/
export interface UserServiceOptions {
  userClient: UserClient
  eventEmitter: EventEmitter
}

/**
 * User Service
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
@Service({ alias: 'userService' })
export class UserService {
  private _currentUser?: User
  private readonly userClient: UserClient
  private readonly eventEmitter: EventEmitter

  /**
   * Create a new User Service
  */
  constructor ({ userClient, eventEmitter }: UserServiceOptions) {
    this.userClient = userClient
    this.eventEmitter = eventEmitter
  }

  /**
   * List users
   *
   * @param limit - The limit of users to list
   */
  async list (limit: number = 10): Promise<User[]> {
    return await this.userClient.list(limit)
  }

  /**
   * Get the current user
   */
  async current (singleton?: boolean): Promise<User> {
    if (isEmpty(this._currentUser) || singleton !== true) {
      this._currentUser = await this.userClient.currentUser()
    }

    return this._currentUser
  }

  /**
   * Find a user
   *
   * @param conditions - The conditions to find the user
   * @returns The found user
   */
  async find (conditions: Record<string, any>): Promise<User> {
    try {
      return await this.userClient.find(conditions.id)
    } catch (error: any) {
      if (error.status === 404) {
        throw new UserNotFoundError(error.message, { cause: error })
      } else {
        throw error
      }
    }
  }

  /**
   * Find a user by key
   *
   * @param key - The key to find the user
   * @param value - The value to find the user
   * @returns The found user
   * @throws UserNotFoundError
   */
  @Snapshot()
  async findBy (key: string, value: any): Promise<User | undefined> {
    return await this.find({ [key]: value })
  }

  /**
   * Create a user
   *
   * @param user - The user to create
   */
  async create (user: UserInput): Promise<void> {
    await this.eventEmitter.emit(new UserEvent(user))
    await this.userClient.create(user)
  }

  /**
   * Update the current user
   *
   * @param user - The user data to update
   */
  async updateCurrent (user: UserInput): Promise<User> {
    return await this.userClient.updateCurrent(user)
  }

  /**
   * Update a user
   *
   * @param id - The id of the user to update
   * @param user - The user data to update
   */
  async update (id: number, user: UserInput): Promise<User> {
    return await this.userClient.update(id, user)
  }

  /**
   * Delete a user
   *
   * @param id - The id of the user to delete
   */
  async delete (id: number): Promise<void> {
    await this.userClient.delete(id)
  }
}
