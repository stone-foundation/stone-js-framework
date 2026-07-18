import { User } from '../models/User'
import { ILogger } from '@stone-js/core'
import { PostService } from '../services/PostService'
import { PostModel, PostResponse } from '../models/Post'
import { Delete, EventHandler, Get, Patch, Post } from '@stone-js/router'
import { IncomingHttpEvent, InternalServerError, JsonHttpResponse } from '@stone-js/http-core'

/**
 * Post Event Handler Options
 */
export interface PostEventHandlerOptions {
  logger: ILogger
  postService: PostService
}

/**
 * Post Event Handler
 *
 * @EventHandler() is a decorator that marks a class as a handler.
 * It acts like a controller in other frameworks.
 */
@EventHandler('/posts', { name: 'posts' })
export class PostEventHandler {
  private readonly logger: ILogger
  private readonly postService: PostService

  /**
   * Create a new instance of PostEventHandler
   *
   * @param postService
   * @param logger
   */
  constructor ({ postService, logger }: PostEventHandlerOptions) {
    this.logger = logger
    this.postService = postService
  }

  /**
   * List all posts
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<PostResponse[]> {
    return await this.postService.list(event.get<number>('limit', 10))
  }

  /**
   * List all posts by a specific author
   */
  @Get('/authors/:id(\\d+)', { name: 'listByAuthor' })
  @JsonHttpResponse(200)
  async listByAuthor (event: IncomingHttpEvent): Promise<PostResponse[]> {
    return await this.postService.listByAuthor(
      event.get<number>('id', 0),
      event.get<number>('limit', 10)
    )
  }

  /**
   * Show a post by ID
   */
  @Get('/:post@id(\\d+)', { bindings: { post: PostService } })
  show (event: IncomingHttpEvent): PostResponse {
    return event.get<PostResponse>('post', {} as unknown as PostResponse)
  }

  /**
   * Create a post
   */
  @Post('/')
  async create (event: IncomingHttpEvent): Promise<{ id?: number }> {
    const id = await this.postService.create({
      ...event.getBody<PostModel>({} as any),
      authorId: event.getUser<User>()?.id ?? 0
    })

    return { id: Number(id) }
  }

  /**
   * Update a post
   */
  @Patch('/:id', { rules: { id: /\d+/ } })
  @JsonHttpResponse(204)
  async update (event: IncomingHttpEvent): Promise<void> {
    const updated = await this.postService.update(event.get<number>('id', 0), event.getBody<PostModel>({} as any))
    if (!updated) {
      throw new InternalServerError(`Failed to update post with ID ${String(event.get<number>('id'))}`)
    }
  }

  /**
   * Delete a post
   */
  @Delete('/:id', { rules: { id: /\d+/ } })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const deleted = await this.postService.delete(event.get<number>('id', 0))
    if (!deleted) {
      throw new InternalServerError(`Failed to update post with ID ${String(event.get<number>('id'))}`)
    }
    this.logger.info(`Post deleted: ${String(event.get<number>('id'))}, by user: ${String(event.getUser<User>()?.id)}`)
    return { statusCode: 204 }
  }
}
