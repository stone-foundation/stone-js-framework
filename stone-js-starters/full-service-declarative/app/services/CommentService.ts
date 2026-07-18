import { NotFoundError } from '@stone-js/http-core'
import { Comment, CommentModel } from '../models/Comment'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'
import { CommentRepository } from '../repositories/CommentRepository'

/**
 * Comment Service Options
 */
export interface CommentServiceOptions {
  commentRepository: CommentRepository
}

/**
 * Comment Service
 *
 * Manages comment-related business logic.
 */
@Service({ alias: 'commentService' })
export class CommentService {
  private readonly commentRepository: CommentRepository

  /**
   * Resolve route binding.
   *
   * @param _key - The key of the binding.
   * @param value - The value of the binding.
   * @param container - The container instance.
   */
  static async resolveRouteBinding (_key: string, value: any, container: IContainer): Promise<Comment | undefined> {
    const commentService = container.resolve<CommentService>('commentService')
    return await commentService.findById(Number(value))
  }

  /**
   * Create a new Comment Service.
   */
  constructor ({ commentRepository }: CommentServiceOptions) {
    this.commentRepository = commentRepository
  }

  /**
   * List comments.
   *
   * @param limit - The limit of comments to list.
   */
  async list (limit: number = 10): Promise<Comment[]> {
    return await this.commentRepository.list({ limit })
  }

  /**
   * Retrieve comments for a specific post.
   *
   * @param postId - The post ID.
   * @param limit - The number of comments to retrieve.
   */
  async listByPost (postId: number, limit: number = 10): Promise<Comment[]> {
    return await this.commentRepository.list({ postId, limit })
  }

  /**
   * Retrieve comments by a specific user.
   *
   * @param authorId - The author ID.
   * @param limit - The number of comments to retrieve.
   */
  async listByAuthor (authorId: number, limit: number = 10): Promise<Comment[]> {
    return await this.commentRepository.list({ authorId, limit })
  }

  /**
   * Find a comment by ID.
   *
   * @param id - The ID of the comment.
   * @returns The found comment.
   */
  async findById (id: number): Promise<Comment> {
    const comment = await this.commentRepository.findById(id)
    if (isNotEmpty<CommentModel>(comment)) return comment
    throw new NotFoundError(`Comment with ID ${id} not found`)
  }

  /**
   * Create a new comment.
   *
   * @param payload - The comment data to create.
   */
  async create (payload: Omit<CommentModel, 'id'>): Promise<bigint | undefined> {
    return await this.commentRepository.create({ ...payload, createdAt: Date.now() })
  }

  /**
   * Update an existing comment.
   *
   * @param id - The ID of the comment.
   * @param payload - The comment data to update.
   * @returns The updated comment.
   */
  async update (id: number, payload: Partial<CommentModel>): Promise<Comment> {
    const comment = await this.commentRepository.update(id, payload)
    if (isNotEmpty<CommentModel>(comment)) return comment
    throw new NotFoundError(`Comment with ID ${id} not found`)
  }

  /**
   * Delete a comment.
   *
   * @param id - The ID of the comment.
   */
  async delete (id: number): Promise<boolean> {
    return await this.commentRepository.delete(id)
  }
}
