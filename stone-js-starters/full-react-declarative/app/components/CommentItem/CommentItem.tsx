import { FC, useState } from 'react'
import { formatDateTime } from '../../utils'
import { CommentView } from '../../models/Comment'

/**
 * Comment Item Props
 */
export interface CommentItemProps {
  commentView: CommentView
  onRetry: (commentView: CommentView) => void
}

/**
 * Comment Item component.
 */
export const CommentItem: FC<CommentItemProps> = ({ commentView, onRetry }) => {
  const [comment, setComment] = useState<CommentView>(commentView)

  // Handle the retry
  const handleOnClick = (): void => {
    setComment({ ...comment, status: 'saving' })
    onRetry(comment)
  }

  // Render the component
  return (
    <div>
      <p>{comment.content}</p>
      <p>
        <span>{comment.author.name}</span>
        <span>{formatDateTime(comment.createdAt)}</span>
      </p>
      {comment.status === 'saving' && <p>Saving...</p>}
      {comment.status === 'error' && (
        <p>
          <span>Error adding the comment!</span>
          <button onClick={handleOnClick}>Retry</button>
        </p>
      )}
    </div>
  )
}
