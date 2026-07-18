import { Comment, CommentModel } from '../../models/Comment'

/**
 * Comment Service contract
 */
export interface ICommentService {
  /**
   * List comments.
   *
   * @param limit - The limit of comments to list.
   */
  list: (limit?: number) => Promise<Comment[]>

  /**
   * Retrieve comments for a specific post.
   *
   * @param postId - The post ID.
   * @param limit - The number of comments to retrieve.
   */
  listByPost: (postId: number, limit?: number) => Promise<Comment[]>

  /**
   * Retrieve comments by a specific user.
   *
   * @param authorId - The author ID.
   * @param limit - The number of comments to retrieve.
   */
  listByAuthor: (authorId: number, limit?: number) => Promise<Comment[]>

  /**
   * Find a comment by ID.
   *
   * @param id - The ID of the comment.
   * @returns The found comment.
   * @throws NotFoundError if comment is not found.
   */
  findById: (id: number) => Promise<Comment>

  /**
   * Create a new comment.
   *
   * @param payload - The comment data to create.
   */
  create: (payload: Omit<CommentModel, 'id'>) => Promise<bigint | undefined>

  /**
   * Update an existing comment.
   *
   * @param id - The ID of the comment.
   * @param payload - The comment data to update.
   * @returns The updated comment.
   * @throws NotFoundError if comment is not found.
   */
  update: (id: number, payload: Partial<CommentModel>) => Promise<Comment>

  /**
   * Delete a comment.
   *
   * @param id - The ID of the comment.
   */
  delete: (id: number) => Promise<boolean>
}
