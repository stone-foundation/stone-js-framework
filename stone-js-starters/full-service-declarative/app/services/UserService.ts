import { UserModel } from '../models/User'
import { UserEvent } from '../events/UserEvent'
import { NotFoundError } from '@stone-js/http-core'
import { UserRepository } from '../repositories/UserRepository'
import { EventEmitter, IContainer, isNotEmpty, Service } from '@stone-js/core'

/**
 * User Service Options
*/
export interface UserServiceOptions {
  eventEmitter: EventEmitter
  userRepository: UserRepository
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
  private readonly eventEmitter: EventEmitter
  private readonly userRepository: UserRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<UserModel | undefined> {
    const userService = container.resolve<UserService>('userService')
    return await userService.findBy({ [key]: value })
  }

  /**
   * Create a new User Service
  */
  constructor ({ userRepository, eventEmitter }: UserServiceOptions) {
    this.eventEmitter = eventEmitter
    this.userRepository = userRepository
  }

  /**
   * List users
   *
   * @param limit - The limit of users to list
   */
  async list (limit: number = 10): Promise<UserModel[]> {
    return await this.userRepository.list(limit)
  }

  /**
   * Find a user
   *
   * @param conditions - The conditions to find the user
   * @returns The found user
   */
  async findBy (conditions: Record<string, any>): Promise<UserModel> {
    const user = await this.userRepository.findById(conditions.id)
    if (isNotEmpty<UserModel>(user)) return user
    throw new NotFoundError(`User with ID ${String(conditions.id)} not found`)
  }

  /**
   * Find a user
   *
   * @param conditions - The conditions to find the user
   * @returns The found user
   */
  async findByEmail (conditions: Record<string, any>): Promise<UserModel | undefined> {
    return await this.userRepository.findBy(conditions)
  }

  /**
   * Create a user
   *
   * @param payload - The user data to create
   */
  async create (payload: Omit<UserModel, 'id'>): Promise<bigint | undefined> {
    await this.eventEmitter.emit(new UserEvent(payload))
    return await this.userRepository.create({ ...payload, createdAt: Date.now(), updatedAt: Date.now() })
  }

  /**
   * Update a user
   *
   * @param id - The id of the user to update
   * @param payload - The user data to update
   * @returns The updated user
   */
  async update (id: number, payload: UserModel): Promise<UserModel> {
    const user = await this.userRepository.update(id, payload)
    if (isNotEmpty<UserModel>(user)) return user
    throw new NotFoundError(`User with ID ${id} not found`)
  }

  /**
   * Delete a user
   *
   * @param id - The id of the user to delete
   */
  async delete (id: number): Promise<boolean> {
    return await this.userRepository.delete(id)
  }
}
