import { User } from '../../models/User'
import { Post } from '../../models/Post'
import { deletePost } from '../../pages/utils'
import { PostCard } from '../PostCard/PostCard'
import PullToRefresh from 'react-pull-to-refresh'
import { IContainer, ILogger } from '@stone-js/core'
import { FC, useEffect, useRef, useState } from 'react'
import { PostSkeleton } from '../PostSkeleton/PostSkeleton'
import { CommentWidget } from '../CommentWidget/CommentWidget'
import { IRouter, ReactIncomingEvent } from '@stone-js/use-react'
import { IPostService } from '../../services/contracts/IPostService'
import { ICommentService } from '../../services/contracts/ICommentService'

/**
 * PostWidget options.
 */
export interface PostWidgetOptions {
  items: Post[]
  container: IContainer
  event: ReactIncomingEvent
}

/**
 * PostWidget component.
 */
export const PostWidget: FC<PostWidgetOptions> = ({ items, event, container }) => {
  const limit = useRef(10)
  const isLoading = useRef(false)
  const loadMoreRef = useRef(null)
  const [posts, setPosts] = useState<Post[]>(items)

  const logger = container.make<ILogger>('logger')
  const router = container.make<IRouter>('router')
  const postService = container.make<IPostService>('postService')
  const commentService = container.make<ICommentService>('commentService')

  const handleRefresh = async (): Promise<void> => {
    const value = await postService.list(limit.current)
    setPosts(value)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          limit.current += 10
          postService
            .list(limit.current)
            .then(newPosts => {
              setPosts([...posts ?? [], ...newPosts])
              if (newPosts.length < 10) {
                if (loadMoreRef.current !== null) observer.unobserve(loadMoreRef.current)
              }
            })
            .catch(error => {
              logger.error(error.message, { error })
            })
        }
      },
      { threshold: 1 }
    )

    if (loadMoreRef.current !== null) observer.observe(loadMoreRef.current)

    return () => {
      if (loadMoreRef.current !== null) observer.unobserve(loadMoreRef.current)
    }
  }, [loadMoreRef.current])

  const pullTorefresh = (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
        {posts?.map(post =>
          <PostCard
            key={post.id}
            post={post}
            currentUser={event.getUser<User>()}
            onEdit={() => router.navigate(`/posts/${post.id}/edit`)}
            onDelete={deletePost.bind(this, router, logger, postService, post)}
          >
            <CommentWidget post={post} currentUser={event.getUser<User>() ?? {} as any} commentService={commentService} />
          </PostCard>
        )}
      </PullToRefresh>
      <div ref={loadMoreRef} style={{ height: '1px' }} />
    </>
  )

  return (
    <section>
      {posts?.length === 0 && <p>No posts found.</p>}
      {isLoading.current ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />) : pullTorefresh}
    </section>
  )
}
