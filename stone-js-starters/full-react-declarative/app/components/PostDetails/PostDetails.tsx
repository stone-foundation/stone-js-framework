import { FC } from 'react'
import { Post } from '../../models/Post'
import { User } from '../../models/User'
import { formatDateTime } from '../../utils'
import { StoneLink } from '@stone-js/use-react'
import { CommentWidget } from '../CommentWidget/CommentWidget'
import { CommentService } from '../../services/CommentService'

/**
 * Post details Options
 */
export interface PostDetailsOptions {
  post: Post
  user: User
  commentService: CommentService
  onDelete: (post: Post) => Promise<void>
}

/**
 * Post details component.
 *
 * @param options - The options to create the Post details component.
 */
export const PostDetails: FC<PostDetailsOptions> = ({ user, onDelete, post, commentService }) => {
  const deletePost = (): void => {
    void onDelete(post).catch(() => {})
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>
        <span>{post.author.name}</span>
        <span>{formatDateTime(post.createdAt)}</span>
      </p>
      <p>{post.content}</p>
      <p>
        <StoneLink to={`/posts/${post.id}/edit`}>Edit</StoneLink>
        <button onClick={deletePost}>Delete</button>
      </p>
      <CommentWidget user={user} commentService={commentService} post={post} />
    </article>
  )
}
