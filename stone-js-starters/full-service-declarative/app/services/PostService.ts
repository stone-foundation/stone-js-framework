import { NotFoundError } from '@stone-js/http-core'
import { PostRepository } from '../repositories/PostRepository'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'
import { Post, PostCreateModel, PostModel } from '../models/Post'

/**
 * Post Service Options
 */
export interface PostServiceOptions {
  postRepository: PostRepository
}

/**
 * Post Service
 *
 * Manages post-related business logic.
 */
@Service({ alias: 'postService' })
export class PostService {
  private readonly postRepository: PostRepository

  /**
   * Resolve route binding.
   *
   * @param _key - The key of the binding.
   * @param value - The value of the binding.
   * @param container - The container instance.
   */
  static async resolveRouteBinding (_key: string, value: any, container: IContainer): Promise<Post | undefined> {
    const postService = container.resolve<PostService>('postService')
    return await postService.findById(Number(value))
  }

  /**
   * Create a new Post Service.
   */
  constructor ({ postRepository }: PostServiceOptions) {
    this.postRepository = postRepository
  }

  /**
   * List posts.
   *
   * @param limit - The limit of posts to list.
   */
  async list (limit: number = 10): Promise<Post[]> {
    return await this.postRepository.list({ limit })
  }

  /**
   * Retrieve posts by a specific user.
   *
   * @param authorId - The author ID.
   * @param limit - The number of posts to retrieve.
   */
  async listByAuthor (authorId: number, limit: number = 10): Promise<Post[]> {
    return await this.postRepository.listByAuthor(authorId, limit)
  }

  /**
   * Find a post by ID.
   *
   * @param id - The ID of the post.
   * @returns The found post.
   */
  async findById (id: number): Promise<Post> {
    const post = await this.postRepository.findById(id)
    if (isNotEmpty<PostModel>(post)) return post
    throw new NotFoundError(`Post with ID ${id} not found`)
  }

  /**
   * Create a new post.
   *
   * @param payload - The post data to create.
   */
  async create (payload: Omit<PostCreateModel, 'id'>): Promise<bigint | undefined> {
    return await this.postRepository.create({ ...payload, createdAt: Date.now(), updatedAt: Date.now() })
  }

  /**
   * Update an existing post.
   *
   * @param id - The ID of the post.
   * @param payload - The post data to update.
   * @returns The updated post.
   */
  async update (id: number, payload: Partial<PostModel>): Promise<boolean> {
    return await this.postRepository.update(id, payload)
  }

  /**
   * Delete a post.
   *
   * @param id - The ID of the post.
   */
  async delete (id: number): Promise<boolean> {
    return await this.postRepository.delete(id)
  }
}
