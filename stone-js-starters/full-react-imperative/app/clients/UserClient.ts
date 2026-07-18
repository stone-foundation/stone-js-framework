import { defineStone } from '@stone-js/core'
import { User, UserInput } from '../models/User'
import { IUserClient } from './contracts/IUserClient'
import { IAxiosClient } from './contracts/IAxiosClient'

/**
 * User Client Options
 */
export interface UserClientOptions {
  httpClient: IAxiosClient
}

/**
 * User Client
 */
export const UserClient = ({ httpClient: client }: UserClientOptions): IUserClient => {
  const path = '/users'

  return {
    /**
     * List users
     *
     * @param limit - The limit of users to list
     * @returns The list of users
     */
    async list (limit: number = 10): Promise<User[]> {
      return await client.get<User[]>(`${path}?limit=${limit}`)
    },

    /**
     * Get the current user
     *
     * @returns The current user
     */
    async currentUser (): Promise<User> {
      return await client.get<User>(`${path}/me`)
    },

    /**
     * Find a user
     *
     * @param id - The id of the user to find
     * @returns The found user
     */
    async find (id: number): Promise<User> {
      return await client.get<User>(`${path}/${id}`)
    },

    /**
     * Create a user
     *
     * @param user - The user to create
     */
    async create (user: UserInput) {
      return await client.post(path, user)
    },

    /**
     * Update the current user
     *
     * @param user - The current user
     * @returns The current user
     */
    async updateCurrent (user: UserInput) {
      return await client.patch(`${path}/me`, user)
    },

    /**
     * Update a user
     *
     * @param id - The id of the user to update
     * @param user - The user to update
     * @returns The updated user
     */
    async update (id: number, user: UserInput) {
      return await client.patch(`${path}/${id}`, user)
    },

    /**
     * Delete a user
     *
     * @param id - The id of the user to delete
     */
    async delete (id: number) {
      return await client.delete(`${path}/${id}`)
    }
  }
}

/**
 * User client blueprint.
*/
export const UserClientBlueprint = defineStone(UserClient, { alias: 'userClient' })
