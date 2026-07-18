import { User } from '../models/User'
import { ILogger } from '@stone-js/core'
import { Post as BlogPost } from '../models/Post'
import { PostService } from '../services/PostService'
import { CommentService } from '../services/CommentService'
import { CommentModel, CommentResponse } from '../models/Comment'
import { Delete, EventHandler, Get, Post } from '@stone-js/router'
import { IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

/**
 * Comment Event Handler Options
 */
export interface CommentEventHandlerOptions {
  logger: ILogger
  commentService: CommentService
}

/**
 * Comment Event Handler
 *
 * Handles comment-related HTTP events.
 */
@EventHandler('/comments', { name: 'comments' })
export class CommentEventHandler {
  private readonly logger: ILogger
  private readonly commentService: CommentService

  /**
   * Create a new instance of CommentEventHandler
   *
   * @param commentService
   * @param logger
   */
  constructor ({ commentService, logger }: CommentEventHandlerOptions) {
    this.logger = logger
    this.commentService = commentService
  }

  /**
   * List all comments
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<CommentResponse[]> {
    return await this.commentService.list(event.get<number>('limit', 10))
  }

  /**
   * List comments by post
   */
  @Get('/posts/:postId(\\d+)')
  @JsonHttpResponse(200)
  async listByPost (event: IncomingHttpEvent): Promise<CommentResponse[]> {
    return await this.commentService.listByPost(
      event.get<number>('postId', 0),
      event.get<number>('limit', 10)
    )
  }

  /**
   * List comments by author
   */
  @Get('/authors/:authorId(\\d+)')
  @JsonHttpResponse(200)
  async listByAuthor (event: IncomingHttpEvent): Promise<CommentResponse[]> {
    return await this.commentService.listByAuthor(
      event.get<number>('authorId', 0),
      event.get<number>('limit', 10)
    )
  }

  /**
   * Show a comment by ID
   */
  @Get('/:comment@id(\\d+)', { bindings: { comment: CommentService } })
  show (event: IncomingHttpEvent): CommentResponse {
    return event.get<CommentResponse>('comment', {} as unknown as CommentResponse)
  }

  /**
   * Create a comment
   */
  @Post('/posts/:post@id(\\d+)', { bindings: { post: PostService } })
  async create (event: IncomingHttpEvent): Promise<{ id?: number }> {
    const id = await this.commentService.create({
      ...event.getBody<CommentModel>({} as any),
      authorId: event.getUser<User>()?.id ?? 0,
      postId: event.get<BlogPost>('post', { id: 0 } as any).id
    })

    return { id: Number(id) }
  }

  /**
   * Delete a comment
   */
  @Delete('/:id', { rules: { id: /\d+/ } })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    await this.commentService.delete(event.get<number>('id', 0))
    this.logger.info(`Comment deleted: ${String(event.get<number>('id'))}, by user: ${String(event.getUser<User>()?.id)}`)
    return { statusCode: 204 }
  }
}
