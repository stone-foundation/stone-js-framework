import { Post, PostCreateModel, PostModel } from '../../models/Post'

/**
 * Post Service contract
 */
export interface IPostService {
  /**
   * List posts.
   *
   * @param limit - The limit of posts to list.
   */
  list: (limit?: number) => Promise<Post[]>

  /**
   * Retrieve posts by a specific user.
   *
   * @param authorId - The author ID.
   * @param limit - The number of posts to retrieve.
   */
  listByAuthor: (authorId: number, limit?: number) => Promise<Post[]>

  /**
   * Find a post by ID.
   *
   * @param id - The ID of the post.
   * @returns The found post.
   * @throws NotFoundError if post is not found.
   */
  findById: (id: number) => Promise<Post>

  /**
   * Create a new post.
   *
   * @param payload - The post data to create.
   */
  create: (payload: Omit<PostCreateModel, 'id'>) => Promise<bigint | undefined>

  /**
   * Update an existing post.
   *
   * @param id - The ID of the post.
   * @param payload - The post data to update.
   * @returns `true` if the update was successful.
   */
  update: (id: number, payload: Partial<PostModel>) => Promise<boolean>

  /**
   * Delete a post.
   *
   * @param id - The ID of the post.
   */
  delete: (id: number) => Promise<boolean>
}
