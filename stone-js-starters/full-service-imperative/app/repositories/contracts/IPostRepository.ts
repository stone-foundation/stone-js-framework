import { Post, PostCreateModel, PostModel } from '../../models/Post'

/**
 * Post Repository contract
 */
export interface IPostRepository {
  /**
   * Retrieves a list of posts with optional filtering and sorting.
   *
   * @param options - Optional filters (authorId, limit).
   * @returns The list of posts.
   */
  list: (options?: { authorId?: number, limit?: number }) => Promise<Post[]>

  /**
   * Retrieves all posts created by a specific author.
   *
   * @param authorId - The ID of the author.
   * @param limit - The number of posts to retrieve.
   * @returns The list of posts.
   */
  listByAuthor: (authorId: number, limit: number) => Promise<Post[]>

  /**
   * Finds a post by its ID.
   *
   * @param postId - The ID of the post to retrieve.
   * @returns The post or `undefined` if not found.
   */
  findById: (postId: number) => Promise<Post | undefined>

  /**
   * Creates a new post.
   *
   * @param post - The post to create.
   * @returns The ID of the created post.
   */
  create: (post: PostCreateModel) => Promise<bigint | undefined>

  /**
   * Updates a post by its ID.
   *
   * @param postId - The ID of the post to update.
   * @param post - The updated post data.
   * @returns `true` if the update was successful.
   */
  update: (postId: number, post: Partial<PostModel>) => Promise<boolean>

  /**
   * Deletes a post by its ID.
   *
   * @param postId - The ID of the post to delete.
   * @returns `true` if the post was deleted, otherwise `false`.
   */
  delete: (postId: number) => Promise<boolean>

  /**
   * Selects posts with author information.
   *
   * @returns A selection descriptor including post and author fields.
   */
  selectWithAuthor: () => Record<string, any>
}
