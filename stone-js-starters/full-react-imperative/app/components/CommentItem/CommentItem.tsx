import './CommentItem.css'
import { FC, useState } from 'react'
import { User } from '../../models/User'
import { dateTimeFromNow } from '../../utils'
import { CommentView } from '../../models/Comment'
import { UserAvatar } from '../UserAvatar/UserAvatar'

/**
 * Comment Item Props
 */
export interface CommentItemProps {
  currentUser: User
  commentView: CommentView
  onToggleLike?: (comment: CommentView) => void
  onDeleteComment?: (comment: CommentView) => void
  onRetry: (commentView: CommentView) => Promise<void>
}

/**
 * Comment Item component.
 */
export const CommentItem: FC<CommentItemProps> = ({ currentUser, commentView, onRetry, onDeleteComment, onToggleLike }) => {
  const [comment, setComment] = useState<CommentView>(commentView)

  // Handle the retry
  const handleOnClick = (): void => {
    setComment({ ...comment, status: 'saving' })
    void onRetry(comment).catch(() => {})
  }

  // Render the component
  return (
    <li key={comment.id} className='comment-item'>
      <UserAvatar user={comment.author} size='sm' />
      <div className='comment-bubble'>
        <div className='comment-meta'>
          <strong>{comment.author.name}</strong>
          <span>{dateTimeFromNow(comment.createdAt)}</span>
        </div>
        <p className='comment-text'>{comment.content}</p>
        {comment.author.id === currentUser.id && (onDeleteComment != null) && (
          <button className='comment-delete' onClick={() => onDeleteComment(comment)}>✕</button>
        )}
        <div className='comment-reactions'>
          <button
            className={`like-button ${comment.likedByCurrentUser ? 'liked' : ''}`}
            onClick={() => onToggleLike?.(comment)}
          >
            👍 {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
          </button>
        </div>
      </div>
      {comment.status === 'saving' && <p>Saving...</p>}
      {comment.status === 'error' && (
        <p>
          <span>Error adding the comment!</span>
          <button onClick={handleOnClick}>Retry</button>
        </p>
      )}
    </li>
  )
}
