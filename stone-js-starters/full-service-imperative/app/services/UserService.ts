import { UserModel } from '../models/User'
import { UserEvent } from '../events/UserEvent'
import { NotFoundError } from '@stone-js/http-core'
import { DependencyResolver } from '@stone-js/router'
import { IUserService } from './contracts/IUserService'
import { defineService, EventEmitter, isNotEmpty } from '@stone-js/core'
import { IUserRepository } from '../repositories/contracts/IUserRepository'

/**
 * User Service Options
*/
export interface UserServiceOptions {
  eventEmitter: EventEmitter
  userRepository: IUserRepository
}

/**
 * Factory User Service
*/
export function factoryUserService ({ userRepository, eventEmitter }: UserServiceOptions): IUserService {
  return {
    /**
     * List users
     *
     * @param limit - The limit of users to list
     */
    async list (limit: number = 10): Promise<UserModel[]> {
      return await userRepository.list(limit)
    },

    /**
     * Find a user
     *
     * @param conditions - The conditions to find the user
     * @returns The found user
     */
    async findBy (conditions: Record<string, any>): Promise<UserModel> {
      const user = await userRepository.findById(conditions.id)
      if (isNotEmpty<UserModel>(user)) return user
      throw new NotFoundError(`User with ID ${String(conditions.id)} not found`)
    },

    /**
     * Find a user
     *
     * @param conditions - The conditions to find the user
     * @returns The found user
     */
    async findByEmail (conditions: Record<string, any>): Promise<UserModel | undefined> {
      return await userRepository.findBy(conditions)
    },

    /**
     * Create a user
     *
     * @param payload - The user data to create
     */
    async create (payload: Omit<UserModel, 'id'>): Promise<bigint | undefined> {
      await eventEmitter.emit(new UserEvent(payload))
      return await userRepository.create({ ...payload, createdAt: Date.now(), updatedAt: Date.now() })
    },

    /**
     * Update a user
     *
     * @param id - The id of the user to update
     * @param payload - The user data to update
     * @returns The updated user
     */
    async update (id: number, payload: UserModel): Promise<UserModel> {
      const user = await userRepository.update(id, payload)
      if (isNotEmpty<UserModel>(user)) return user
      throw new NotFoundError(`User with ID ${id} not found`)
    },

    /**
     * Delete a user
     *
     * @param id - The id of the user to delete
     */
    async delete (id: number): Promise<boolean> {
      return await userRepository.delete(id)
    }
  }
}

/**
 * Resolve route binding
 *
 * @param key - The key of the binding
 * @param value - The value of the binding
 * @param container - The container
 */
export async function userResolveRouteBinding (key: string, value: any, container?: DependencyResolver): Promise<UserModel | undefined> {
  const userService = container?.resolve<IUserService>('userService')
  return await userService?.findBy({ [key]: value })
}

/**
 * User Service
 *
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
 */
export const UserService = defineService(factoryUserService, { isFactory: true, singleton: true, alias: 'userService' })
