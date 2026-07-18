import { FC, useRef } from 'react'

/**
 * Comment Form Props
 */
export interface CommentFormOptions {
  onSubmit: (content: string) => void
}

/**
 * Comment Form component.
 */
export const CommentForm: FC<CommentFormOptions> = ({ onSubmit }) => {
  const contentRef = useRef<HTMLInputElement>(null)

  // Handle the form submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (contentRef.current === null) return

    const content = contentRef.current.value.trim()
    if (content.length === 0) return // Prevent empty submissions

    contentRef.current.value = '' // Clear input field
    onSubmit(content)
  }

  // Render the component
  return (
    <form onSubmit={handleSubmit}>
      <p>
        <input ref={contentRef} type='text' placeholder='Write a comment...' />
        <button type='submit'>Add Comment</button>
      </p>
    </form>
  )
}
