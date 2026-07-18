import { Comment, CommentCreateModel, CommentModel } from '../../models/Comment'

/**
 * Comment Repository contract
 */
export interface ICommentRepository {
  /**
   * Retrieves a list of comments with optional filtering and sorting.
   *
   * @param options - Optional filters (postId, authorId, limit).
   * @returns The list of comments.
   */
  list: (options?: { postId?: number, authorId?: number, limit?: number }) => Promise<Comment[]>

  /**
   * Retrieves all comments created by a specific author.
   *
   * @param authorId - The ID of the author.
   * @param limit - The number of comments to retrieve.
   * @returns The list of comments.
   */
  listByAuthor: (authorId: number, limit: number) => Promise<Comment[]>

  /**
   * Retrieves all comments for a specific post.
   *
   * @param postId - The ID of the post.
   * @param limit - The number of comments to retrieve.
   * @returns The list of comments.
   */
  listByPost: (postId: number, limit: number) => Promise<Comment[]>

  /**
   * Finds a comment by its ID.
   *
   * @param commentId - The ID of the comment.
   * @returns The comment or `undefined` if not found.
   */
  findById: (commentId: number) => Promise<Comment | undefined>

  /**
   * Creates a new comment.
   *
   * @param comment - The comment data.
   * @returns The ID of the created comment.
   */
  create: (comment: CommentCreateModel) => Promise<bigint | undefined>

  /**
   * Updates a comment by its ID.
   *
   * @param commentId - The ID of the comment to update.
   * @param comment - The updated comment data.
   * @returns The updated comment or `undefined` if not found.
   */
  update: (commentId: number, comment: Partial<CommentModel>) => Promise<Comment | undefined>

  /**
   * Deletes a comment by its ID.
   *
   * @param commentId - The ID of the comment to delete.
   * @returns `true` if deleted, `false` otherwise.
   */
  delete: (commentId: number) => Promise<boolean>

  /**
   * Selects comment fields along with author information.
   *
   * @returns The selection descriptor for joined comment-author records.
   */
  selectWithAuthor: () => Record<string, any>
}
