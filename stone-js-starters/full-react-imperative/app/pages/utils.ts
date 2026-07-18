import { ILogger } from '@stone-js/core'
import { IRouter } from '@stone-js/use-react'
import { PostInput, Post } from '../models/Post'
import { IPostService } from '../services/contracts/IPostService'

/**
 * Create the post.
 *
 * @param post - The post to save.
 */
export async function createPost (
  router: IRouter,
  logger: ILogger,
  postService: IPostService,
  postInput: PostInput
): Promise<void> {
  try {
    const post = await postService.create(postInput)
    router.navigate(`/posts/${post.id}`)
  } catch (error: any) {
    console.error(error)
    window.alert('Error creating the post')
    logger.error(error.message, { error })
  }
}

/**
 * Delete the post.
 *
 * @param post - The post to delete.
 */
export async function deletePost (
  router: IRouter,
  logger: ILogger,
  postService: IPostService,
  post: Post
): Promise<void> {
  if (window.confirm('Are you sure you want to delete this post?')) {
    try {
      await postService.delete(post.id)
      router.navigate('/posts')
    } catch (error: any) {
      window.alert('Error deleting the post')
      logger.error(error.message, { error })
    }
  }
}

/**
 * Update the post.
 *
 * @param post - The post to update.
 */
export async function updatePost (
  logger: ILogger,
  postService: IPostService,
  id: number,
  post: PostInput
): Promise<void> {
  try {
    await postService.update(id, post)
    window.alert('Post updated successfully')
  } catch (error: any) {
    window.alert('Error updating the post')
    logger.error(error.message, { error })
  }
}
