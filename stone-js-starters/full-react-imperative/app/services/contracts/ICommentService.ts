import { Comment, CommentInput } from '../../models/Comment'

/**
 * Comment Service contract
 */
export interface ICommentService {
  /**
   * List comments for a given post.
   *
   * @param postId - The ID of the post to list comments for.
   * @param limit - Optional number of comments to return (default: 10).
   * @returns The list of comments.
   */
  list: (postId: number, limit?: number) => Promise<Comment[]>

  /**
   * Create a new comment for a post.
   *
   * @param postId - The ID of the post.
   * @param comment - The comment data.
   */
  create: (postId: number, comment: CommentInput) => Promise<void>

  /**
   * Delete a comment by its ID.
   *
   * @param id - The ID of the comment to delete.
   */
  delete: (id: number) => Promise<void>
}
