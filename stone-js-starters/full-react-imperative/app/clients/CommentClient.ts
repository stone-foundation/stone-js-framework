import { defineStone } from '@stone-js/core'
import { IAxiosClient } from './contracts/IAxiosClient'
import { Comment, CommentInput } from '../models/Comment'
import { ICommentClient } from './contracts/ICommentClient'

/**
 * Comment Client Options
*/
export interface CommentClientOptions {
  httpClient: IAxiosClient
}

/**
 * Comment Client
 */
export const CommentClient = ({ httpClient: client }: CommentClientOptions): ICommentClient => {
  const path = '/comments'

  return {
    /**
     * List comments
     *
     * @param postId - The id of the Post to list Comments
     * @param limit - The limit of Comments to list
     * @returns The list of Comments
     */
    async list (postId: number, limit: number = 10): Promise<Comment[]> {
      const query = new URLSearchParams({ limit: limit.toString() })
      return await client.get<Comment[]>(`${String(path)}/posts/${String(postId)}?${String(query)}`)
    },

    /**
     * Create a comment
     *
     * @param postId - The id of the Post to create the Comment for
     * @param comment - The Comment to create
     * @returns The created Comment
     */
    async create (postId: number, comment: CommentInput) {
      return await client.post(`${path}/posts/${postId}`, { ...comment, id: undefined })
    },

    /**
     * Delete a comment
     *
     * @param id - The id of the Comment to delete
     */
    async delete (id: number) {
      return await client.delete(`${path}/${id}`)
    }
  }
}

/**
 * Comment Client blueprint.
*/
export const CommentClientBlueprint = defineStone(CommentClient, { alias: 'commentClient' })
