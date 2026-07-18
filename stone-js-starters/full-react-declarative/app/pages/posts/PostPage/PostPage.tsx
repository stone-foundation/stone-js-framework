import { JSX } from 'react'
import { Post } from '../../../models/Post'
import { PostService } from '../../../services/PostService'
import { PostItem } from '../../../components/PostItem/PostItem'
import { IPage, Page, PageRenderContext, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

/**
 * Post Page options.
 */
export interface PostPageOptions {
  postService: PostService
}

/**
 * List Post Page component.
 */
@Page('/posts')
export class PostPage implements IPage<ReactIncomingEvent> {
  private readonly postService: PostService

  /**
   * Create a new List Post Page component.
   *
   * @param options - The options to create the List Post Page component.
   */
  constructor ({ postService }: PostPageOptions) {
    this.postService = postService
  }

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @returns List of posts.
   */
  async handle (event: ReactIncomingEvent): Promise<Post[]> {
    return await this.postService.list(event.get<number>('limit', 10))
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data: posts }: PageRenderContext<Post[]>): JSX.Element {
    return (
      <>
        <h1>
          <span>Posts</span>
          <StoneLink to='/posts/create'>New Post</StoneLink>
        </h1>
        <div>
          {posts?.length === 0 && <p>No posts found.</p>}
          {posts?.map(post => <PostItem key={post.id} post={post} />)}
        </div>
      </>
    )
  }
}
