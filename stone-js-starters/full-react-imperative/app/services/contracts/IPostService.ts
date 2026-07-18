import { Post, PostInput } from '../../models/Post'

/**
 * Post Service contract
 */
export interface IPostService {
  /**
   * List posts.
   *
   * @param limit - Optional limit of posts to list (default: 10).
   * @returns The list of posts.
   */
  list: (limit?: number) => Promise<Post[]>

  /**
   * List posts by author.
   *
   * @param id - The author ID.
   * @param limit - Optional limit of posts (default: 10).
   * @returns The list of posts.
   */
  listbyAuthor: (id: number, limit?: number) => Promise<Post[]>

  /**
   * Find a post by conditions (e.g., ID).
   *
   * @param conditions - Key-value map to identify the post (e.g., `{ id: 42 }`).
   * @returns The found post.
   * @throws PostNotFoundError if not found.
   */
  find: (conditions: Record<string, any>) => Promise<Post>

  /**
   * Find a post by a specific key and value.
   *
   * @param key - The key to filter by.
   * @param value - The value to match.
   * @returns The post or throws PostNotFoundError.
   */
  findBy: (key: string, value: string) => Promise<Post | undefined>

  /**
   * Create a post.
   *
   * @param post - The post data to create.
   * @returns The created post.
   */
  create: (post: PostInput) => Promise<Post>

  /**
   * Update a post.
   *
   * @param id - The ID of the post to update.
   * @param post - The post data to update.
   * @returns The updated post.
   */
  update: (id: number, post: PostInput) => Promise<Post>

  /**
   * Delete a post by ID.
   *
   * @param id - The ID of the post to delete.
   */
  delete: (id: number) => Promise<void>
}
