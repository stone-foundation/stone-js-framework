import { Stone } from '@stone-js/core'
import { AxiosClient } from './AxiosClient'
import { Post, PostInput } from '../models/Post'

/**
 * Post Client Options
*/
export interface PostClientOptions {
  httpClient: AxiosClient
}

/**
 * Post Client
 */
@Stone({ alias: 'postClient' })
export class PostClient {
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new Post Client
   *
   * @param options - The options to create the Post Client.
   */
  constructor ({ httpClient }: PostClientOptions) {
    this.client = httpClient
    this.path = '/posts'
  }

  /**
   * List posts
   *
   * @param limit - The limit of posts to list
   * @returns The list of posts
   */
  async list (limit: number = 10): Promise<Post[]> {
    return await this.client.get<Post[]>(`${this.path}?limit=${limit}`)
  }

  /**
   * List posts by author
   *
   * @param id - The id of the author to list posts
   * @param limit - The limit of posts to list
   * @returns The list of posts
   */
  async listByAuthor (id: number, limit: number = 10): Promise<Post[]> {
    return await this.client.get<Post[]>(`${this.path}/authors/${id}?limit=${limit}`)
  }

  /**
   * Find an post
   *
   * @param id - The id of the post to find
   * @returns The found post
   */
  async find (id: number): Promise<Post> {
    return await this.client.get<Post>(`${this.path}/${id}`)
  }

  /**
   * Create an post
   *
   * @param post - The post to create
   * @returns The created post
   */
  async create (post: PostInput): Promise<Post> {
    return await this.client.post(this.path, post)
  }

  /**
   * Update an post
   *
   * @param id - The id of the post to update
   * @param post - The post to update
   * @returns The updated post
   */
  async update (id: number, post: PostInput): Promise<Post> {
    return await this.client.patch(`${this.path}/${id}`, post)
  }

  /**
   * Delete an post
   *
   * @param id - The id of the post to delete
   */
  async delete (id: number): Promise<unknown> {
    return await this.client.delete(`${this.path}/${id}`)
  }
}
