import { defineService } from '@stone-js/core'
import { Post, PostInput } from '../models/Post'
import { IPostService } from './contracts/IPostService'
import { IPostClient } from '../clients/contracts/IPostClient'
import { PostNotFoundError } from '../errors/PostNotFoundError'

/**
 * Post Service Options
*/
export interface PostServiceOptions {
  postClient: IPostClient
}

/**
 * Post Service
*/
export const PostService = ({ postClient }: PostServiceOptions): IPostService => ({
  /**
   * List posts
   *
   * @param limit - The limit of posts to list
   */
  async list (limit: number = 10): Promise<Post[]> {
    return await postClient.list(limit)
  },

  /**
   * List posts by author
   *
   * @param id - The id of the author to list posts
   * @param limit - The limit of posts to list
   */
  async listbyAuthor (id: number, limit: number = 10): Promise<Post[]> {
    return await postClient.listByAuthor(id, limit)
  },

  /**
   * Find a post
   *
   * @param conditions - The conditions to find the post
   * @returns The found post
   */
  async find (conditions: Record<string, any>): Promise<Post> {
    try {
      return await postClient.find(conditions.id)
    } catch (error: any) {
      if (error.status === 404) {
        throw new PostNotFoundError(error.message, { cause: error })
      } else {
        throw error
      }
    }
  },

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
  },

  /**
   * Create a post
   *
   * @param post - The post to create
   */
  async create (post: PostInput): Promise<Post> {
    return await postClient.create(post)
  },

  /**
   * Update a post
   *
   * @param id - The id of the post to update
   * @param post - The post data to update
   */
  async update (id: number, post: PostInput): Promise<Post> {
    return await postClient.update(id, post)
  },

  /**
   * Delete a post
   *
   * @param id - The id of the post to delete
   */
  async delete (id: number): Promise<void> {
    await postClient.delete(id)
  }
})

/**
 * Post Service Blueprint
 *
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
 */
export const PostServiceBlueprint = defineService(PostService, { alias: 'postService', isFactory: true })
