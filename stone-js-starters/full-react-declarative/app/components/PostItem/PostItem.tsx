import { FC } from 'react'
import { Post } from '../../models/Post'
import { StoneLink } from '@stone-js/use-react'

/**
 * Post Item Options
 */
export interface PostItemOptions {
  post: Post
}

/**
 * Post Item component.
 *
 * @param options - The options to create the Post Item component.
 */
export const PostItem: FC<PostItemOptions> = ({ post }) => {
  return (
    <article>
      <h3>
        <StoneLink to={`/posts/${post.id}`}>{post.title}</StoneLink>
      </h3>
      <p>
        <span>{post.author.name}</span>
        <span>{new Date(post.createdAt).toISOString()}</span>
      </p>
      <p>{post.content.substring(0, 32)}</p>
      <p>
        <StoneLink to={`/posts/${post.id}`}>Show</StoneLink>
        <StoneLink to={`/posts/${post.id}/edit`}>Edit</StoneLink>
      </p>
    </article>
  )
}
