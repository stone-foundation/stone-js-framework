import './CommentWidget.css'
import { User } from '../../models/User'
import { Post } from '../../models/Post'
import { FC, useEffect, useState } from 'react'
import { CommentItem } from '../CommentItem/CommentItem'
import { CommentForm } from '../CommentForm/CommentForm'
import { CommentInput, CommentView } from '../../models/Comment'
import { ICommentService } from '../../services/contracts/ICommentService'

/**
 * Comment Widget Options
 */
export interface CommentWidgetOptions {
  post: Post
  currentUser: User
  commentService: ICommentService
}

/**
 * Comment Items component.
 */
export const CommentWidget: FC<CommentWidgetOptions> = ({ post, currentUser, commentService }) => {
  const [limit, setLimit] = useState(10)
  const [comments, setComments] = useState<CommentView[]>([])
  const [showMoreComments, setShowMoreComments] = useState(false)
  const [fetchingStatus, setFetchingStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  // Fetch comments
  const fetchComments = async (): Promise<void> => {
    try {
      setFetchingStatus('loading')
      const comments = await commentService.list(post.id, limit)
      setFetchingStatus('idle')
      setComments(comments)
      setShowMoreComments(comments.length < post.commentsCount)
    } catch (_: any) {
      setFetchingStatus('error')
    }
  }

  const fetchMoreComments = (): void => {
    setLimit(limit + 10)
    setShowMoreComments(false)
    void fetchComments().catch(() => {})
  }

  // Save comment
  const saveComment = async (commentInput: CommentInput): Promise<void> => {
    try {
      await commentService.create(post.id, commentInput)
      await fetchComments()
    } catch (_: any) {
      setComments(comments.map(comment => ({
        ...comment,
        status: comment.id === commentInput.id ? 'error' : comment.status
      })))
    }
  }

  // Handle save
  const handleOnSubmit = async (content: string): Promise<void> => {
    const id = Math.random()
    const commentInput: CommentInput = {
      id,
      content,
      likesCount: 0,
      postId: post.id,
      likedByCurrentUser: false
    }

    const commentView: CommentView = {
      ...commentInput,
      author: currentUser,
      status: 'saving',
      createdAt: Date.now()
    }

    setComments([...comments, commentView])

    await saveComment(commentInput)
  }

  // Fetch comments on mount
  useEffect(() => { fetchComments().then(() => {}).catch(() => {}) }, [post.id])

  // Render
  if (comments.length === 0 && fetchingStatus === 'loading') {
    return <p className='comment-loading'>Loading comments...</p>
  } else if (comments.length === 0 && fetchingStatus === 'error') {
    return <p className='comment-error'>Error fetching comments</p>
  } else {
    return (
      <div className='comment-section'>
        <CommentForm
          currentUser={currentUser}
          onSubmit={handleOnSubmit}
        />
        <ul className='comment-list'>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              currentUser={currentUser}
              commentView={comment}
              onRetry={saveComment}
            />
          ))}
        </ul>
        {showMoreComments && (
          <button
            className='show-more-comments'
            onClick={() => fetchMoreComments()}
          >
            Show more comments
          </button>
        )}
      </div>
    )
  }
}
