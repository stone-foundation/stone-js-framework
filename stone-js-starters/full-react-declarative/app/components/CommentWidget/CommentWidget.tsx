import { User } from '../../models/User'
import { Post } from '../../models/Post'
import { FC, useEffect, useState } from 'react'
import { CommentItem } from '../CommentItem/CommentItem'
import { CommentForm } from '../CommentForm/CommentForm'
import { CommentService } from '../../services/CommentService'
import { CommentInput, CommentView } from '../../models/Comment'

/**
 * Comment Widget Options
 */
export interface CommentWidgetOptions {
  post: Post
  user: User
  commentService: CommentService
}

/**
 * Comment Items component.
 */
export const CommentWidget: FC<CommentWidgetOptions> = ({ post, user, commentService }) => {
  const [comments, setComments] = useState<CommentView[]>([])
  const [fetchingStatus, setFetchingStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  // Fetch comments
  const fetchComments = (): void => {
    setFetchingStatus('loading')
    commentService
      .list(post.id)
      .then(comments => {
        setComments(comments)
        setFetchingStatus('idle')
      })
      .catch(() => {
        setFetchingStatus('error')
      })
  }

  // Save comment
  const saveComment = (commentInput: CommentInput): void => {
    commentService
      .create(post.id, commentInput)
      .then(() => fetchComments())
      .catch(() => {
        setComments(comments.map(comment => ({
          ...comment,
          status: comment.id === commentInput.id ? 'error' : comment.status
        })))
      })
  }

  // Handle save
  const handleOnSubmit = (content: string): void => {
    const id = Math.random()
    const commentInput: CommentInput = {
      id,
      content,
      postId: post.id
    }

    const commentView: CommentView = {
      ...commentInput,
      author: user,
      status: 'saving',
      createdAt: Date.now()
    }

    setComments([...comments, commentView])

    saveComment(commentInput)
  }

  // Fetch comments on mount
  useEffect(() => { fetchComments() }, [post.id])

  // Render
  if (comments.length === 0 && fetchingStatus === 'loading') {
    return <p>Loading comments...</p>
  } else if (comments.length === 0 && fetchingStatus === 'error') {
    return <p>Error fetching comments</p>
  } else if (comments.length === 0 && fetchingStatus === 'idle') {
    return <p>No comments yet</p>
  } else {
    return (
      <div>
        <CommentForm onSubmit={handleOnSubmit} />
        <div>
          {comments.map((comment) => (
            <CommentItem key={comment.id} commentView={comment} onRetry={saveComment} />
          ))}
        </div>
      </div>
    )
  }
}
