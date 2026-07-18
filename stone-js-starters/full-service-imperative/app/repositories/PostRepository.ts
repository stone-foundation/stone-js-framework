import { desc, eq } from 'drizzle-orm'
import { posts, users } from '../database/schema'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { defineStone, isNotEmpty } from '@stone-js/core'
import { IPostRepository } from './contracts/IPostRepository'
import { Post, PostCreateModel, PostModel } from '../models/Post'

/**
 * Post Repository Options
 */
export interface PostRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * Factory Post Repository
 */
export function factoryPostRepository ({ database }: PostRepositoryOptions): IPostRepository {
  return {
    /**
     * Retrieves a list of posts with optional filtering and sorting.
     *
     * @param options - Optional filters (authorId, limit, orderBy).
     * @returns The list of posts.
     */
    async list (options?: { authorId?: number, limit?: number }): Promise<Post[]> {
      const query = database
        .select(this.selectWithAuthor())
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))

      if (options?.authorId !== undefined) {
        await query.where(eq(posts.authorId, options.authorId))
      }

      await query.orderBy(desc(posts.createdAt))

      if (options?.limit !== undefined) {
        await query.limit(options.limit)
      }

      return await query.all() as Post[]
    },

    /**
     * Retrieves all posts created by a specific user.
     *
     * @param user - The user whose posts are being retrieved.
     * @param limit - The number of posts to retrieve.
     * @returns The list of posts.
     */
    async listByAuthor (authorId: number, limit: number): Promise<Post[]> {
      return await this.list({ authorId, limit })
    },

    /**
     * Finds a post by its ID.
     *
     * @param postId - The ID of the post to retrieve.
     * @returns The post or `undefined` if not found.
     */
    async findById (postId: number): Promise<Post | undefined> {
      return await database
        .select(this.selectWithAuthor())
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.id, postId))
        .get() as Post | undefined
    },

    /**
     * Creates a new post.
     *
     * @param post - The post to create.
     * @returns The ID of the created post.
     */
    async create (post: PostCreateModel): Promise<bigint | undefined> {
      const result = await database.insert(posts).values(post)
      return result.lastInsertRowid
    },

    /**
     * Updates a post by its ID.
     *
     * @param postId - The ID of the post to update.
     * @param post - The updated post data.
     * @returns The updated post or `undefined` if not found.
     */
    async update (postId: number, post: Partial<PostModel>): Promise<boolean> {
      const result = await database.update(posts).set(post).where(eq(posts.id, postId))
      return isNotEmpty<bigint>(result.lastInsertRowid) && result.lastInsertRowid > 0
    },

    /**
     * Deletes a post by its ID.
     *
     * @param postId - The ID of the post to delete.
     * @returns `true` if the post was deleted, otherwise `false`.
     */
    async delete (postId: number): Promise<boolean> {
      const result = await database.delete(posts).where(eq(posts.id, postId)).run()
      return isNotEmpty<bigint>(result.lastInsertRowid) && result.lastInsertRowid > 0
    },

    /**
     * Selects posts with author information.
     */
    selectWithAuthor (): Record<string, any> {
      return {
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        }
      }
    }
  }
}

/**
 * Post Repository
 */
export const PostRepository = defineStone(factoryPostRepository, { isFactory: true, singleton: true, alias: 'postRepository' })
