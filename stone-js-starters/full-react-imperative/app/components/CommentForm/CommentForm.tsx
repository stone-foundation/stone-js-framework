import './CommentForm.css'
import { User } from '../../models/User'
import { FC, useRef, FormEvent } from 'react'
import { UserAvatar } from '../UserAvatar/UserAvatar'

/**
 * CommentForm options.
 */
export interface CommentFormOptions {
  currentUser: User
  onSubmit: (content: string) => Promise<void>
}

/**
 * CommentForm component.
 */
export const CommentForm: FC<CommentFormOptions> = ({ currentUser, onSubmit }) => {
  const contentRef = useRef<HTMLInputElement>(null)

  // Handle the form submit
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (contentRef.current === null) return

    const content = contentRef.current.value.trim()
    if (content.length === 0) return // Prevent empty submissions

    contentRef.current.value = '' // Clear input field
    void onSubmit(content).catch(() => {})
  }

  // Render the component
  return (
    <form className='comment-form' onSubmit={handleSubmit}>
      <UserAvatar user={currentUser} />
      <input
        type='text'
        ref={contentRef}
        className='comment-input'
        placeholder='Write a comment...'
      />
      <button className='comment-submit' type='submit'>Add Comment</button>
    </form>
  )
}
