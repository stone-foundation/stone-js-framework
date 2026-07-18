import { FC, useRef } from 'react'
import { PostInput } from '../../models/Post'

/**
 * Post Form Options
 */
export interface PostFormOptions {
  post?: PostInput
  onSubmit: (post: PostInput) => Promise<void>
}

/**
 * Post Form component.
 *
 * @param options - The options to create the Post Form component.
 */
export const PostForm: FC<PostFormOptions> = ({ post, onSubmit }) => {
  // Create a reference to the post
  const postRef = useRef<PostInput>({
    title: post?.title ?? '',
    content: post?.content ?? ''
  })

  // Handle the form submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void onSubmit(postRef.current).catch(() => {})
  }

  // Handle the field change
  const onChange = (field: keyof PostInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    postRef.current[field] = event.target.value
  }

  // Render the component
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='title'>Title:</label>
      <input id='title' type='text' onChange={onChange('title')} defaultValue={postRef.current.title} />

      <label htmlFor='content'>Content:</label>
      <input id='content' type='text' onChange={onChange('content')} defaultValue={postRef.current.content} />

      <button type='submit'>Publish</button>
    </form>
  )
}
