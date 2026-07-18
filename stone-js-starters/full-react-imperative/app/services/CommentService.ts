import { defineStone } from '@stone-js/core'
import { Comment, CommentInput } from '../models/Comment'
import { ICommentService } from './contracts/ICommentService'
import { ICommentClient } from '../clients/contracts/ICommentClient'

/**
 * Comment Service Options
*/
export interface CommentServiceOptions {
  commentClient: ICommentClient
}

/**
 * Comment Service
*/
export const CommentService = ({ commentClient }: CommentServiceOptions): ICommentService => ({
  /**
   * List comments
   *
   * @param postId - The id of the post to list comments
   * @param limit - The limit of comments to list
   */
  async list (postId: number, limit: number = 10): Promise<Comment[]> {
    return await commentClient.list(postId, limit)
  },

  /**
   * Create a comment
   *
   * @param postId - The id of the post to create the comment for
   * @param comment - The comment to create
   */
  async create (postId: number, comment: CommentInput): Promise<void> {
    await commentClient.create(postId, comment)
  },

  /**
   * Delete a comment
   *
   * @param id - The id of the comment to delete
   */
  async delete (id: number): Promise<void> {
    await commentClient.delete(id)
  }
})

/**
 * Comment Service blueprint.
 *
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
export const CommentServiceBlueprint = defineStone(CommentService, { alias: 'commentService' })
