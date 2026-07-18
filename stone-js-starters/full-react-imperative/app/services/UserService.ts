import { UserEvent } from '../events/UserEvent'
import { User, UserInput } from '../models/User'
import { ReactRuntime } from '@stone-js/use-react'
import { IUserService } from './contracts/IUserService'
import { defineService, EventEmitter } from '@stone-js/core'
import { IUserClient } from '../clients/contracts/IUserClient'
import { UserNotFoundError } from '../errors/UserNotFoundError'

/**
 * User Service Options
*/
export interface UserServiceOptions {
  userClient: IUserClient
  reactRuntime: ReactRuntime
  eventEmitter: EventEmitter
}

/**
 * User Service
*/
export const UserService = ({ userClient, reactRuntime, eventEmitter }: UserServiceOptions): IUserService => {
  return {
    /**
     * List users
     *
     * @param limit - The limit of users to list
     */
    async list (limit: number = 10): Promise<User[]> {
      return await userClient.list(limit)
    },

    /**
     * Get the current user
     */
    async current (): Promise<User> {
      return await userClient.currentUser()
    },

    /**
     * Find a user
     *
     * @param conditions - The conditions to find the user
     * @returns The found user
     */
    async find (conditions: Record<string, any>): Promise<User> {
      try {
        return await userClient.find(conditions.id)
      } catch (error: any) {
        if (error.status === 404) {
          throw new UserNotFoundError(error.message, { cause: error })
        } else {
          throw error
        }
      }
    },

    /**
     * Find a user by key
     *
     * @param key - The key to find the user
     * @param value - The value to find the user
     * @returns The found user
     * @throws UserNotFoundError
     */
    async findBy (key: string, value: any): Promise<User | undefined> {
      return await reactRuntime.snapshot(`user-${String(key)}-${String(value)}`, async () => await this.find({ [key]: value }))
    },

    /**
     * Create a user
     *
     * @param user - The user to create
     */
    async create (user: UserInput): Promise<void> {
      await eventEmitter.emit(new UserEvent(user))
      await userClient.create(user)
    },

    /**
     * Update the current user
     *
     * @param user - The user data to update
     */
    async updateCurrent (user: UserInput): Promise<User> {
      return await userClient.updateCurrent(user)
    },

    /**
     * Update a user
     *
     * @param id - The id of the user to update
     * @param user - The user data to update
     */
    async update (id: number, user: UserInput): Promise<User> {
      return await userClient.update(id, user)
    },

    /**
     * Delete a user
     *
     * @param id - The id of the user to delete
     */
    async delete (id: number): Promise<void> {
      await userClient.delete(id)
    }
  }
}

/**
 * User Service Blueprint
 *
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
 */
export const UserServiceBlueprint = defineService(UserService, { alias: 'userService', isFactory: true })
