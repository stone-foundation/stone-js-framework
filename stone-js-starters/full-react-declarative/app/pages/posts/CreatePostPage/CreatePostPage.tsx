import './CreatePostPage.css'
import { JSX } from 'react'
import { ILogger } from '@stone-js/core'
import { PostInput } from '../../../models/Post'
import { PostService } from '../../../services/PostService'
import { PostForm } from '../../../components/PostForm/PostForm'
import { IPage, IRouter, Page, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * Create Post Page options.
 */
export interface CreatePostPageOptions {
  router: IRouter
  logger: ILogger
  postService: PostService
}

/**
 * Create Post Page component.
 */
@Page('/posts/create')
export class CreatePostPage implements IPage<ReactIncomingEvent> {
  private readonly router: IRouter
  private readonly logger: ILogger
  private readonly postService: PostService

  /**
   * Create a new Post Page component.
   *
   * @param options - The options to create the Post Page component.
   */
  constructor ({ router, logger, postService }: CreatePostPageOptions) {
    this.router = router
    this.logger = logger
    this.postService = postService
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render (): JSX.Element {
    return (
      <>
        <h1>New Post</h1>
        <PostForm onSubmit={this.createPost.bind(this)} />
      </>
    )
  }

  /**
   * Create the post.
   *
   * @param post - The post to save.
   */
  private async createPost (postInput: PostInput): Promise<void> {
    try {
      const post = await this.postService.create(postInput)
      this.router.navigate(`/posts/${post.id}`)
    } catch (error: any) {
      console.error(error)
      window.alert('Error creating the post')
      this.logger.error(error.message, { error })
    }
  }
}
