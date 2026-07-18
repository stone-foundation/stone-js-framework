import { User } from '../models/User'
import { PostModel, PostResponse } from '../models/Post'
import { FunctionalEventHandler, ILogger } from '@stone-js/core'
import { IPostService } from '../services/contracts/IPostService'
import { postResolveRouteBinding } from '../services/PostService'
import { defineRoutes, DELETE, GET, PATCH, POST } from '@stone-js/router'
import { IncomingHttpEvent, InternalServerError } from '@stone-js/http-core'

/**
 * Post Event Handler Options
 */
export interface PostEventHandlerOptions {
  logger: ILogger
  postService: IPostService
}

/**
 * List all posts
 */
export function factoryPostListEventHandler ({ postService }: PostEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<PostResponse[]> {
    return await postService.list(event.get<number>('limit', 10))
  }
}

/**
 * List all posts by a specific author
 */
export function factoryPostListByAuthorEventHandler ({ postService }: PostEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<PostResponse[]> {
    return await postService.listByAuthor(
      event.get<number>('id', 0),
      event.get<number>('limit', 10)
    )
  }
}

/**
 * Show a post by ID
 */
export function factoryPostShowEventHandler (): FunctionalEventHandler<IncomingHttpEvent> {
  return function (event: IncomingHttpEvent): PostResponse {
    return event.get<PostResponse>('post', {} as unknown as PostResponse)
  }
}

/**
 * Create a post
 */
export function factoryPostCreateEventHandler ({ postService }: PostEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<{ id?: number }> {
    const id = await postService.create({
      ...event.getBody<PostModel>({} as any),
      authorId: event.getUser<User>()?.id ?? 0
    })

    return { id: Number(id) }
  }
}

/**
 * Update a post
 */
export function factoryPostUpdateEventHandler ({ postService }: PostEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<void> {
    const updated = await postService.update(event.get<number>('id', 0), event.getBody<PostModel>({} as any))
    if (!updated) {
      throw new InternalServerError(`Failed to update post with ID ${String(event.get<number>('id'))}`)
    }
  }
}

/**
 * Delete a post
 */
export function factoryPostDeleteEventHandler ({ postService, logger }: PostEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const deleted = await postService.delete(event.get<number>('id', 0))
    if (!deleted) {
      throw new InternalServerError(`Failed to update post with ID ${String(event.get<number>('id'))}`)
    }
    logger.info(`Post deleted: ${String(event.get<number>('id'))}, by user: ${String(event.getUser<User>()?.id)}`)
    return { statusCode: 204 }
  }
}

/**
 * Post Event Handler
*/
export const PostEventHandler = defineRoutes(
  [
    [factoryPostListEventHandler, { isFactory: true, path: '/posts/', method: GET, name: 'posts.list' }],
    [factoryPostCreateEventHandler, { isFactory: true, path: '/posts/', method: POST, name: 'posts.create' }],
    [factoryPostUpdateEventHandler, { isFactory: true, path: '/posts/:id', method: PATCH, name: 'posts.update', rules: { id: /\d+/ } }],
    [factoryPostDeleteEventHandler, { isFactory: true, path: '/posts/:id', method: DELETE, name: 'posts.delete', rules: { id: /\d+/ } }],
    [factoryPostListByAuthorEventHandler, { isFactory: true, path: '/posts/authors/:authorId(\\d+)', method: GET, name: 'posts.list-by-author' }],
    [factoryPostShowEventHandler, { isFactory: true, path: '/posts/:post@id(\\d+)', method: GET, name: 'posts.show', bindings: { user: postResolveRouteBinding } }]
  ]
)
