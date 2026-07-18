import { Service } from '@stone-js/core'
import { Post, PostInput } from '../models/Post'
import { PostClient } from '../clients/PostClient'
import { PostNotFoundError } from '../errors/PostNotFoundError'

/**
 * Post Service Options
*/
export interface PostServiceOptions {
  postClient: PostClient
}

/**
 * Post Service
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
@Service({ alias: 'postService' })
export class PostService {
  private readonly postClient: PostClient

  /**
   * Create a new Post Service
  */
  constructor ({ postClient }: PostServiceOptions) {
    this.postClient = postClient
  }

  /**
   * List posts
   *
   * @param limit - The limit of posts to list
   */
  async list (limit: number = 10): Promise<Post[]> {
    return await this.postClient.list(limit)
  }

  /**
   * List posts by author
   *
   * @param id - The id of the author to list posts
   * @param limit - The limit of posts to list
   */
  async listbyAuthor (id: number, limit: number = 10): Promise<Post[]> {
    return await this.postClient.listByAuthor(id, limit)
  }

  /**
   * Find a post
   *
   * @param conditions - The conditions to find the post
   * @returns The found post
   */
  async find (conditions: Record<string, any>): Promise<Post> {
    try {
      return await this.postClient.find(conditions.id)
    } catch (error: any) {
      if (error.status === 404) {
        throw new PostNotFoundError(error.message, { cause: error })
      } else {
        throw error
      }
    }
  }

  /**
   * Find a post by key
   *
   * @param key - The key to find the post
   * @param value - The value to find the post
   * @returns The found post
   * @throws PostNotFoundError
   */
  async findBy (key: string, value: string): Promise<Post | undefined> {
    return await this.find({ [key]: value })
  }

  /**
   * Create a post
   *
   * @param post - The post to create
   */
  async create (post: PostInput): Promise<Post> {
    return await this.postClient.create(post)
  }

  /**
   * Update a post
   *
   * @param id - The id of the post to update
   * @param post - The post data to update
   */
  async update (id: number, post: PostInput): Promise<Post> {
    return await this.postClient.update(id, post)
  }

  /**
   * Delete a post
   *
   * @param id - The id of the post to delete
   */
  async delete (id: number): Promise<void> {
    await this.postClient.delete(id)
  }
}
