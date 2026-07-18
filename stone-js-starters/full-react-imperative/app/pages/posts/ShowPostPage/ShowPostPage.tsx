import { JSX } from 'react'
import { deletePost } from '../../utils'
import { Post } from '../../../models/Post'
import { User } from '../../../models/User'
import { ILogger, isNotEmpty } from '@stone-js/core'
import { PostCard } from '../../../components/PostCard/PostCard'
import { IPostService } from '../../../services/contracts/IPostService'
import { ICommentService } from '../../../services/contracts/ICommentService'
import { CommentWidget } from '../../../components/CommentWidget/CommentWidget'
import { definePage, IPage, IRouter, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * Show Post Page options.
 */
export interface ShowPostPageOptions {
  router: IRouter
  logger: ILogger
  postService: IPostService
  commentService: ICommentService
}

/**
 * Show Post Page component.
 */
export const ShowPostPage = ({ router, logger, postService, commentService }: ShowPostPageOptions): IPage<ReactIncomingEvent> => ({
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
        <PostCard
          key={post.id}
          post={post}
          currentUser={user}
          onEdit={() => router.navigate(`/posts/${post.id}/edit`)}
          onDelete={deletePost.bind(this, router, logger, postService, post)}
        >
          <CommentWidget post={post} currentUser={user} commentService={commentService} />
        </PostCard>
      )
    }

    return <article><h1>Post not found</h1></article>
  }
})

/**
 * Show Post Page Blueprint.
 */
export const ShowPostPageBlueprint = definePage(
  ShowPostPage,
  {
    path: '/posts/:post@id(\\d+)',
    bindings: { post: 'postService@findBy' }
  }
)
