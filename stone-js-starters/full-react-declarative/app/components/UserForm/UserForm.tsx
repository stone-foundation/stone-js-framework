import { FC, useRef } from 'react'
import { UserInput } from '../../models/User'

/**
 * User Form Options
 */
export interface UserFormOptions {
  user?: UserInput
  onSubmit: (user: UserInput) => Promise<void>
}

/**
 * User Form component.
 *
 * @param options - The options to create the User Form component.
 */
export const UserForm: FC<UserFormOptions> = ({ user, onSubmit }) => {
  // Create a reference to the user
  const userRef = useRef<UserInput>({
    name: user?.name ?? '',
    email: user?.email ?? ''
  })

  // Handle the form submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void onSubmit(userRef.current).catch(() => {})
  }

  // Handle the field change
  const onChange = (field: keyof UserInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    userRef.current[field] = event.target.value
  }

  // Render the component
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='name'>Name:</label>
      <input id='name' type='text' onChange={onChange('name')} defaultValue={userRef.current.name} />

      <label htmlFor='email'>Email:</label>
      <input id='email' type='email' onChange={onChange('email')} defaultValue={userRef.current.email} />

      <button type='submit'>Save</button>
    </form>
  )
}
