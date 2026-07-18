import { defineStone } from '@stone-js/core'
import { Post, PostInput } from '../models/Post'
import { IPostClient } from './contracts/IPostClient'
import { IAxiosClient } from './contracts/IAxiosClient'

/**
 * Post Client Options
*/
export interface PostClientOptions {
  httpClient: IAxiosClient
}

/**
 * Post Client
 */
export const PostClient = ({ httpClient: client }: PostClientOptions): IPostClient => {
  const path = '/posts'

  return {
    /**
     * List posts
     *
     * @param limit - The limit of posts to list
     * @returns The list of posts
     */
    async list (limit: number = 10): Promise<Post[]> {
      return await client.get<Post[]>(`${path}?limit=${limit}`)
    },

    /**
     * List posts by author
     *
     * @param id - The id of the author to list posts
     * @param limit - The limit of posts to list
     * @returns The list of posts
     */
    async listByAuthor (id: number, limit: number = 10): Promise<Post[]> {
      return await client.get<Post[]>(`${path}/authors/${id}?limit=${limit}`)
    },

    /**
     * Find an post
     *
     * @param id - The id of the post to find
     * @returns The found post
     */
    async find (id: number): Promise<Post> {
      return await client.get<Post>(`${path}/${id}`)
    },

    /**
     * Create an post
     *
     * @param post - The post to create
     * @returns The created post
     */
    async create (post: PostInput) {
      return await client.post(path, post)
    },

    /**
     * Update an post
     *
     * @param id - The id of the post to update
     * @param post - The post to update
     * @returns The updated post
     */
    async update (id: number, post: PostInput) {
      return await client.patch(`${path}/${id}`, post)
    },

    /**
     * Delete an post
     *
     * @param id - The id of the post to delete
     */
    async delete (id: number) {
      return await client.delete(`${path}/${id}`)
    }
  }
}

/**
 * Post Client blueprint.
*/
export const PostClientBlueprint = defineStone(PostClient, { alias: 'postClient' })
