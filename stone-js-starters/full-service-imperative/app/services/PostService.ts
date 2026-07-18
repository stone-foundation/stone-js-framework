import { NotFoundError } from '@stone-js/http-core'
import { DependencyResolver } from '@stone-js/router'
import { IPostService } from './contracts/IPostService'
import { defineService, isNotEmpty } from '@stone-js/core'
import { Post, PostCreateModel, PostModel } from '../models/Post'
import { IPostRepository } from '../repositories/contracts/IPostRepository'

/**
 * Post Service Options
 */
export interface PostServiceOptions {
  postRepository: IPostRepository
}

/**
 * Factory Post Service
 */
export function factoryPostService ({ postRepository }: PostServiceOptions): IPostService {
  return {
    /**
     * List posts.
     *
     * @param limit - The limit of posts to list.
     */
    async list (limit: number = 10): Promise<Post[]> {
      return await postRepository.list({ limit })
    },

    /**
     * Retrieve posts by a specific user.
     *
     * @param authorId - The author ID.
     * @param limit - The number of posts to retrieve.
     */
    async listByAuthor (authorId: number, limit: number = 10): Promise<Post[]> {
      return await postRepository.listByAuthor(authorId, limit)
    },

    /**
     * Find a post by ID.
     *
     * @param id - The ID of the post.
     * @returns The found post.
     */
    async findById (id: number): Promise<Post> {
      const post: Post | undefined = await postRepository.findById(id)
      if (isNotEmpty<PostModel>(post)) return post
      throw new NotFoundError(`Post with ID ${id} not found`)
    },

    /**
     * Create a new post.
     *
     * @param payload - The post data to create.
     */
    async create (payload: Omit<PostCreateModel, 'id'>): Promise<bigint | undefined> {
      return await postRepository.create({ ...payload, createdAt: Date.now(), updatedAt: Date.now() })
    },

    /**
     * Update an existing post.
     *
     * @param id - The ID of the post.
     * @param payload - The post data to update.
     * @returns The updated post.
     */
    async update (id: number, payload: Partial<PostModel>): Promise<boolean> {
      return await postRepository.update(id, payload)
    },

    /**
     * Delete a post.
     *
     * @param id - The ID of the post.
     */
    async delete (id: number): Promise<boolean> {
      return await postRepository.delete(id)
    }
  }
}

/**
 * Resolve route binding.
 *
 * @param _key - The key of the binding.
 * @param value - The value of the binding.
 * @param container - The container instance.
 */
export async function postResolveRouteBinding (_key: string, value: any, container?: DependencyResolver): Promise<Post | undefined> {
  const postService = container?.resolve<IPostService>('postService')
  return await postService?.findById(Number(value))
}

/**
 * Post Service
 */
export const PostService = defineService(factoryPostService, { isFactory: true, singleton: true, alias: 'postService' })
