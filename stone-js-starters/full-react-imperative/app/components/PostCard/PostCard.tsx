import { Post } from '../../models/Post'
import { User } from '../../models/User'
import { FC, ReactNode, useState } from 'react'
import { UserBadge } from '../UserBadge/UserBadge'

/**
 * PostCard options.
 */
interface PostCardOptions {
  post: Post
  currentUser?: User
  children: ReactNode
  onEdit?: (post: Post) => void
  onDelete: (post: Post) => Promise<void>
}

/**
 * PostCard component.
 */
export const PostCard: FC<PostCardOptions> = ({ children, post, currentUser, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showComment, setShowComment] = useState(post.commentsCount > 0)

  const isOwner = post.authorId === currentUser?.id

  const deletePost = (): void => {
    void onDelete?.(post).catch(() => {})
  }

  return (
    <article className='post-card'>
      <header className='post-header'>
        <UserBadge user={post.author} createdAt={post.createdAt} />
        {isOwner && (
          <div className='post-actions'>
            <button className='menu-toggle' onClick={() => setShowMenu(!showMenu)}>⋮</button>
            {showMenu && (
              <ul className='post-dropdown'>
                <li onClick={() => onEdit?.(post)}>✏️ Edit</li>
                <li onClick={deletePost}>🗑️ Delete</li>
              </ul>
            )}
          </div>
        )}
      </header>

      <div className='post-content'>
        {post.content !== undefined && <p>{post.content}</p>}
        {post.imagePath !== undefined && (
          <div className='post-image'>
            <img src={post.imagePath} alt='Post' />
          </div>
        )}
      </div>

      <footer className='post-footer'>
        <button className='post-action'>👍 Like</button>
        <button className='post-action' onClick={() => setShowComment(!showComment)}>💬 Comment</button>
        <button className='post-action'>🔁 Share</button>
      </footer>

      {showComment && <div className='post-comments'>{children}</div>}
    </article>
  )
}
