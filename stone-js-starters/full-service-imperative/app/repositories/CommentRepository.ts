import { desc, eq } from 'drizzle-orm'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { comments, users } from '../database/schema'
import { defineStone, isNotEmpty } from '@stone-js/core'
import { ICommentRepository } from './contracts/ICommentRepository'
import { Comment, CommentCreateModel, CommentModel } from '../models/Comment'

/**
 * Comment Repository Options
 */
export interface CommentRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * Factory Comment Repository
 */
export function factoryCommentRepository ({ database }: CommentRepositoryOptions): ICommentRepository {
  return {
    /**
     * Retrieves a list of comments with optional filtering and sorting.
     *
     * @param options - Optional filters (postId, authorId, limit, orderBy).
     * @returns The list of comments.
     */
    async list (options?: { postId?: number, authorId?: number, limit?: number }): Promise<Comment[]> {
      const query = database
        .select(this.selectWithAuthor())
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))

      if (options?.postId !== undefined) {
        await query.where(eq(comments.postId, options.postId))
      }

      if (options?.authorId !== undefined) {
        await query.where(eq(comments.authorId, options.authorId))
      }

      await query.orderBy(desc(comments.createdAt))

      if (options?.limit !== undefined) {
        await query.limit(options.limit)
      }

      return await query.all() as Comment[]
    },

    /**
     * Retrieves all comments created by a specific user.
     *
     * @param authorId - The ID of the user whose comments are being retrieved.
     * @param limit - The number of comments to retrieve.
     * @returns The list of comments.
     */
    async listByAuthor (authorId: number, limit: number): Promise<Comment[]> {
      return await this.list({ authorId, limit })
    },

    /**
     * Retrieves all comments for a specific post.
     *
     * @param postId - The ID of the post whose comments are being retrieved.
     * @param limit - The number of comments to retrieve.
     * @returns The list of comments.
     */
    async listByPost (postId: number, limit: number): Promise<Comment[]> {
      return await this.list({ postId, limit })
    },

    /**
     * Finds a comment by its ID.
     *
     * @param commentId - The ID of the comment to retrieve.
     * @returns The comment or `undefined` if not found.
     */
    async findById (commentId: number): Promise<Comment | undefined> {
      return await database
        .select(this.selectWithAuthor())
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(eq(comments.id, commentId))
        .get() as Comment | undefined
    },

    /**
     * Creates a new comment.
     *
     * @param comment - The comment to create.
     * @returns The ID of the created comment.
     */
    async create (comment: CommentCreateModel): Promise<bigint | undefined> {
      const result = await database.insert(comments).values(comment)
      return result.lastInsertRowid
    },

    /**
     * Updates a comment by its ID.
     *
     * @param commentId - The ID of the comment to update.
     * @param comment - The updated comment data.
     * @returns The updated comment or `undefined` if not found.
     */
    async update (commentId: number, comment: Partial<CommentModel>): Promise<Comment | undefined> {
      return await database
        .update(comments)
        .set(comment)
        .where(eq(comments.id, commentId))
        .returning(this.selectWithAuthor())
        .get() as Comment | undefined
    },

    /**
     * Deletes a comment by its ID.
     *
     * @param commentId - The ID of the comment to delete.
     * @returns `true` if the comment was deleted, otherwise `false`.
     */
    async delete (commentId: number): Promise<boolean> {
      const result = await database.delete(comments).where(eq(comments.id, commentId)).run()
      return isNotEmpty<bigint>(result.lastInsertRowid) && result.lastInsertRowid > 0
    },

    /**
     * Selects comments with author and post information.
     */
    selectWithAuthor (): Record<string, any> {
      return {
        id: comments.id,
        postId: comments.postId,
        content: comments.content,
        createdAt: comments.createdAt,
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
 * Comment Repository
 */
export const CommentRepository = defineStone(factoryCommentRepository, { isFactory: true, singleton: true, alias: 'commentRepository' })
