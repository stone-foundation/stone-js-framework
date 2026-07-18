import { Stone } from '@stone-js/core'
import { AxiosClient } from './AxiosClient'
import { Comment, CommentInput } from '../models/Comment'

/**
 * Comment Client Options
*/
export interface CommentClientOptions {
  httpClient: AxiosClient
}

/**
 * Comment Client
 */
@Stone({ alias: 'commentClient' })
export class CommentClient {
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new Comment Client
   *
   * @param options - The options to create the Comment Client.
   */
  constructor ({ httpClient }: CommentClientOptions) {
    this.path = '/comments'
    this.client = httpClient
  }

  /**
   * List comments
   *
   * @param postId - The id of the Post to list Comments
   * @param limit - The limit of Comments to list
   * @returns The list of Comments
   */
  async list (postId: number, limit: number = 10): Promise<Comment[]> {
    const query = new URLSearchParams({ limit: limit.toString() })
    return await this.client.get<Comment[]>(`${this.path}/posts/${postId}?${String(query)}`)
  }

  /**
   * Create a comment
   *
   * @param postId - The id of the Post to create the Comment for
   * @param comment - The Comment to create
   * @returns The created Comment
   */
  async create (postId: number, comment: CommentInput): Promise<Comment> {
    return await this.client.post(`${this.path}/posts/${postId}`, { ...comment, id: undefined })
  }

  /**
   * Delete a comment
   *
   * @param id - The id of the Comment to delete
   */
  async delete (id: number): Promise<unknown> {
    return await this.client.delete(`${this.path}/${id}`)
  }
}
