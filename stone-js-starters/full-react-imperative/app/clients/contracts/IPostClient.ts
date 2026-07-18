import { Post, PostInput } from '../../models/Post'

/**
 * Post Client contract
 */
export interface IPostClient {
  /**
   * List posts.
   *
   * @param limit - The limit of posts to list (default: 10).
   * @returns The list of posts.
   */
  list: (limit?: number) => Promise<Post[]>

  /**
   * List posts by author.
   *
   * @param id - The author ID.
   * @param limit - The number of posts to retrieve (default: 10).
   * @returns The list of posts.
   */
  listByAuthor: (id: number, limit?: number) => Promise<Post[]>

  /**
   * Find a post by ID.
   *
   * @param id - The ID of the post to find.
   * @returns The found post.
   */
  find: (id: number) => Promise<Post>

  /**
   * Create a new post.
   *
   * @param post - The post data to create.
   * @returns The created post.
   */
  create: (post: PostInput) => Promise<Post>

  /**
   * Update an existing post.
   *
   * @param id - The ID of the post to update.
   * @param post - The updated post data.
   * @returns The updated post.
   */
  update: (id: number, post: PostInput) => Promise<Post>

  /**
   * Delete a post.
   *
   * @param id - The ID of the post to delete.
   */
  delete: (id: number) => Promise<void>
}
