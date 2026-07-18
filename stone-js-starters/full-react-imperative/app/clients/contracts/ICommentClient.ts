import { Comment, CommentInput } from '../../models/Comment'

/**
 * Comment Client contract
 */
export interface ICommentClient {
  /**
   * List comments for a given post.
   *
   * @param postId - The ID of the post to list comments for.
   * @param limit - Optional limit of comments to retrieve (default: 10).
   * @returns The list of comments.
   */
  list: (postId: number, limit?: number) => Promise<Comment[]>

  /**
   * Create a new comment for a given post.
   *
   * @param postId - The ID of the post to comment on.
   * @param comment - The comment data.
   * @returns The created comment.
   */
  create: (postId: number, comment: CommentInput) => Promise<Comment>

  /**
   * Delete a comment by its ID.
   *
   * @param id - The ID of the comment to delete.
   */
  delete: (id: number) => Promise<void>
}
