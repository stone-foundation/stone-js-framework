import { JSX } from 'react'
import { ILogger, isNotEmpty } from '@stone-js/core'
import { Post, PostInput } from '../../../models/Post'
import { PostService } from '../../../services/PostService'
import { PostForm } from '../../../components/PostForm/PostForm'
import { IPage, Page, ReactIncomingEvent, PageRenderContext, StoneLink } from '@stone-js/use-react'

/**
 * Update Post Page options.
 */
export interface UpdatePostPageOptions {
  logger: ILogger
  postService: PostService
}

/**
 * Update Post Page component.
 */
@Page('/posts/:post@id(\\d+)/edit', { bindings: { post: 'postService@findBy' } })
export class UpdatePostPage implements IPage<ReactIncomingEvent> {
  private readonly logger: ILogger
  private readonly postService: PostService

  /**
   * Create a new Post Page component.
   *
   * @param options - The options to create the Post Page component.
   */
  constructor ({ logger, postService }: UpdatePostPageOptions) {
    this.logger = logger
    this.postService = postService
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ event }: PageRenderContext<Post>): JSX.Element {
    const post = event.get<Post>('post')

    if (isNotEmpty<Post>(post)) {
      return (
        <>
          <h1>{post.title}</h1>
          <PostForm
            post={post}
            onSubmit={async (postInput) => await this.updatePost(post.id, postInput)}
          />
          <StoneLink to={`/posts/${post.id}`}>Back</StoneLink>
        </>
      )
    }

    return (
      <article>
        <h1>Post not found</h1>
      </article>
    )
  }

  /**
   * Update the post.
   *
   * @param post - The post to update.
   */
  private async updatePost (id: number, post: PostInput): Promise<void> {
    try {
      await this.postService.update(id, post)
      window.alert('Post updated successfully')
    } catch (error: any) {
      window.alert('Error updating the post')
      this.logger.error(error.message, { error })
    }
  }
}
