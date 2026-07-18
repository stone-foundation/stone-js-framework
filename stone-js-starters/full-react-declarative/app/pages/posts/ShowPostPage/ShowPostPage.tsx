import { JSX } from 'react'
import { Post } from '../../../models/Post'
import { User } from '../../../models/User'
import { ILogger, isNotEmpty } from '@stone-js/core'
import { PostService } from '../../../services/PostService'
import { CommentService } from '../../../services/CommentService'
import { PostDetails } from '../../../components/PostDetails/PostDetails'
import { IPage, IRouter, Page, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * Show Post Page options.
 */
export interface ShowPostPageOptions {
  router: IRouter
  logger: ILogger
  postService: PostService
  commentService: CommentService
}

/**
 * Show Post Page component.
 */
@Page('/posts/:post@id(\\d+)', { bindings: { post: 'postService@findBy' } })
export class ShowPostPage implements IPage<ReactIncomingEvent> {
  private readonly router: IRouter
  private readonly logger: ILogger
  private readonly postService: PostService
  private readonly commentService: CommentService

  /**
   * Create a new Post Page component.
   *
   * @param options - The options to create the Post Page component.
   */
  constructor ({ router, logger, postService, commentService }: ShowPostPageOptions) {
    this.router = router
    this.logger = logger
    this.postService = postService
    this.commentService = commentService
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ event }: PageRenderContext<Post>): JSX.Element {
    const post = event.get<Post>('post')
    const user = event.getUser<User>() ?? {} as unknown as User

    // Render the component
    if (isNotEmpty<Post>(post)) {
      return (
        <PostDetails
          user={user}
          post={post}
          onDelete={this.deletePost.bind(this)}
          commentService={this.commentService}
        />
      )
    }

    return <article><h1>Post not found</h1></article>
  }

  /**
   * Delete the post.
   *
   * @param post - The post to delete.
   */
  private async deletePost (post: Post): Promise<void> {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await this.postService.delete(post.id)
        this.router.navigate('/posts')
      } catch (error: any) {
        window.alert('Error deleting the post')
        this.logger.error(error.message, { error })
      }
    }
  }
}
