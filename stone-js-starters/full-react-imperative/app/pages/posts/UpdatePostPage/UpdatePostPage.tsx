import { JSX } from 'react'
import { updatePost } from '../../utils'
import { Post } from '../../../models/Post'
import { ILogger, isNotEmpty } from '@stone-js/core'
import { PostForm } from '../../../components/PostForm/PostForm'
import { IPostService } from '../../../services/contracts/IPostService'
import { IPage, ReactIncomingEvent, PageRenderContext, definePage } from '@stone-js/use-react'

/**
 * Update Post Page options.
 */
export interface UpdatePostPageOptions {
  logger: ILogger
  postService: IPostService
}

/**
 * Update Post Page component.
 */
export const UpdatePostPage = ({ logger, postService }: UpdatePostPageOptions): IPage<ReactIncomingEvent> => ({
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
        <PostForm
          post={post}
          onSubmit={async (postInput) => await updatePost(logger, postService, post.id, postInput)}
        />
      )
    }

    return (
      <article>
        <h1>Post not found</h1>
      </article>
    )
  }
})

/**
 * Update Post Page Blueprint.
 */
export const UpdatePostPageBlueprint = definePage(
  UpdatePostPage,
  {
    path: '/posts/:post@id(\\d+)/edit',
    bindings: { post: 'postService@findBy' }
  }
)
