import { File } from '@stone-js/filesystem'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { User, UserModel, UserResponse } from '../models/User'
import { FunctionalEventHandler, ILogger } from '@stone-js/core'
import { IUserService } from '../services/contracts/IUserService'
import { userResolveRouteBinding } from '../services/UserService'
import { defineRoutes, DELETE, GET, PATCH, POST } from '@stone-js/router'

/**
 * User Event Handler Options
*/
export interface UserEventHandlerOptions {
  logger: ILogger
  userService: IUserService
}

/**
 * List all users
*/
export function factoryUserListEventHandler ({ userService }: UserEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<UserResponse[]> {
    return await userService.list(event.get<number>('limit', 10))
  }
}

/**
 * Show current user
*/
export function factoryUserShowCurrentEventHandler (): FunctionalEventHandler<IncomingHttpEvent> {
  return function (event: IncomingHttpEvent): UserResponse {
    const user = { ...event.getUser<UserModel>(), password: undefined }
    return user as UserResponse
  }
}

/**
 * Show a user
*/
export function factoryUserShowEventHandler (): FunctionalEventHandler<IncomingHttpEvent> {
  return function (event: IncomingHttpEvent): UserResponse {
    return event.get<UserResponse>('user', {} as unknown as UserResponse)
  }
}

/**
 * Show a user avatar
 */
export function factoryUserAvatarEventHandler (): FunctionalEventHandler<IncomingHttpEvent> {
  return function (event: IncomingHttpEvent): File {
    const user = event.get<UserResponse>('user', {} as unknown as UserResponse)
    return File.create(`public/uploads/${String(user.avatar)}`)
  }
}

/**
 * Create a user
*/
export function factoryUserCreateEventHandler ({ userService }: UserEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<{ id?: number }> {
    const id = await userService.create(handleFileUpload(event))
    return { id: Number(id) }
  }
}

/**
 * Update the current user
*/
export function factoryUserUpdateCurrentEventHandler ({ userService }: UserEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<UserResponse> {
    return await userService.update(
      event.getUser<UserModel>()?.id ?? 0,
      handleFileUpload(event)
    )
  }
}

/**
 * Update a user
*/
export function factoryUserUpdateEventHandler ({ userService }: UserEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<UserResponse> {
    return await userService.update(
      event.get<number>('id', 0),
      handleFileUpload(event)
    )
  }
}

/**
 * Delete a user
*/
export function factoryUserDeleteEventHandler ({ logger, userService }: UserEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    await userService.delete(event.get<number>('id', 0))
    logger.info(`User deleted: ${String(event.get<number>('id'))}, by user: ${String(event.getUser<User>()?.id)}`)
    return { statusCode: 204 }
  }
}

/**
 * Handle file upload
 *
 * @param event - IncomingHttpEvent
 * @param payload - UserModel
*/
function handleFileUpload (event: IncomingHttpEvent): UserModel {
  const payload = event.getBody<UserModel>({} as any)

  if (event.hasFile('avatar')) {
    const file = event.getFile('avatar')?.[0]
    payload.avatar = `${crypto.randomUUID()}-${String(file?.getClientOriginalName())}`
    file?.move('public/uploads', payload.avatar)
  }

  return payload
}

/**
 * User Event Handler
*/
export const UserEventHandler = defineRoutes(
  [
    [factoryUserListEventHandler, { isFactory: true, path: '/users/', method: GET, name: 'users.list' }],
    [factoryUserCreateEventHandler, { isFactory: true, path: '/users/', method: POST, name: 'users.create' }],
    [factoryUserDeleteEventHandler, { isFactory: true, path: '/users/:id', method: DELETE, name: 'users.delete' }],
    [factoryUserShowCurrentEventHandler, { isFactory: true, path: '/users/me', method: GET, name: 'users.show-current' }],
    [factoryUserUpdateCurrentEventHandler, { isFactory: true, path: '/users/me', method: PATCH, name: 'users.update-current' }],
    [factoryUserUpdateEventHandler, { isFactory: true, path: '/users/:id', method: PATCH, name: 'users.update', rules: { id: /\d+/ } }],
    [factoryUserShowEventHandler, { isFactory: true, path: '/users/:user@id(\\d+)', method: GET, name: 'users.show', bindings: { user: userResolveRouteBinding } }],
    [factoryUserAvatarEventHandler, { isFactory: true, path: '/users/:user@id(\\d+)/avatar', method: GET, name: 'users.avatar', bindings: { user: userResolveRouteBinding } }]
  ]
)
