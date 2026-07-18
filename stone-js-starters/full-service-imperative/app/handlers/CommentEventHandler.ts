import { User } from '../models/User'
import { Post as BlogPost } from '../models/Post'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { FunctionalEventHandler, ILogger } from '@stone-js/core'
import { postResolveRouteBinding } from '../services/PostService'
import { CommentModel, CommentResponse } from '../models/Comment'
import { defineRoutes, DELETE, GET, POST } from '@stone-js/router'
import { ICommentService } from '../services/contracts/ICommentService'
import { commentResolveRouteBinding } from '../services/CommentService'

/**
 * Comment Event Handler Options
 */
export interface CommentEventHandlerOptions {
  logger: ILogger
  commentService: ICommentService
}

/**
 * List all comments
 */
export function factoryCommentListEventHandler ({ commentService }: CommentEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<CommentResponse[]> {
    return await commentService.list(event.get<number>('limit', 10))
  }
}

/**
 * List comments by post
 */
export function factoryCommentListByPostEventHandler ({ commentService }: CommentEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<CommentResponse[]> {
    return await commentService.listByPost(
      event.get<number>('postId', 0),
      event.get<number>('limit', 10)
    )
  }
}

/**
 * List comments by author
 */
export function factoryCommentListByAuthorEventHandler ({ commentService }: CommentEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<CommentResponse[]> {
    return await commentService.listByAuthor(
      event.get<number>('authorId', 0),
      event.get<number>('limit', 10)
    )
  }
}

/**
 * Show a comment by ID
 */
export function factoryCommentShowEventHandler ({ commentService }: CommentEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return function (event: IncomingHttpEvent): CommentResponse {
    return event.get<CommentResponse>('comment', {} as unknown as CommentResponse)
  }
}

/**
 * Create a comment
 */
export function factoryCommentCreateEventHandler ({ commentService }: CommentEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<{ id?: number }> {
    const id = await commentService.create({
      ...event.getBody<CommentModel>({} as any),
      authorId: event.getUser<User>()?.id ?? 0,
      postId: event.get<BlogPost>('post', { id: 0 } as any).id
    })

    return { id: Number(id) }
  }
}

/**
 * Delete a comment
 */
export function factoryCommentDeleteEventHandler ({ commentService, logger }: CommentEventHandlerOptions): FunctionalEventHandler<IncomingHttpEvent> {
  return async function (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    await commentService.delete(event.get<number>('id', 0))
    logger.info(`Comment deleted: ${String(event.get<number>('id'))}, by user: ${String(event.getUser<User>()?.id)}`)
    return { statusCode: 204 }
  }
}

/**
 * Comment Event Handler
*/
export const CommentEventHandler = defineRoutes(
  [
    [factoryCommentListEventHandler, { isFactory: true, path: '/comments/', method: GET, name: 'comments.list' }],
    [factoryCommentDeleteEventHandler, { isFactory: true, path: '/comments/:id', method: DELETE, name: 'comments.delete', rules: { id: /\d+/ } }],
    [factoryCommentListByPostEventHandler, { isFactory: true, path: '/comments/posts/:postId(\\d+)', method: GET, name: 'comments.list-by-post' }],
    [factoryCommentListByAuthorEventHandler, { isFactory: true, path: '/comments/authors/:authorId(\\d+)', method: GET, name: 'comments.list-by-author' }],
    [factoryCommentShowEventHandler, { isFactory: true, path: '/comments/:comment@id(\\d+)', method: GET, name: 'comments.show', bindings: { user: commentResolveRouteBinding } }],
    [factoryCommentCreateEventHandler, { isFactory: true, path: '/comments/posts/:post@id(\\d+)', method: POST, name: 'comments.create', bindings: { post: postResolveRouteBinding } }]
  ]
)
