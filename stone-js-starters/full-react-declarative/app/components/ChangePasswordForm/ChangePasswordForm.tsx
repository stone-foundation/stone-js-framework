import { FC, useRef } from 'react'
import { UserChangePassword } from '../../models/User'

/**
 * Change Password Form Options
 */
export interface ChangePasswordFormOptions {
  onSubmit: (user: UserChangePassword) => Promise<void>
}

/**
 * Change Password Form component.
 *
 * @param options - The options to create the Change Password Form component.
 */
export const ChangePasswordForm: FC<ChangePasswordFormOptions> = ({ onSubmit }) => {
  // Create a reference to the user
  const userRef = useRef<UserChangePassword>({
    password: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Handle the form submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void onSubmit(userRef.current).catch(() => {})
  }

  // Handle the field change
  const onChange = (field: keyof UserChangePassword) => (event: React.ChangeEvent<HTMLInputElement>) => {
    userRef.current[field] = event.target.value
  }

  // Render the component
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='password'>Current Password:</label>
      <input id='password' type='password' onChange={onChange('password')} defaultValue={userRef.current.password} />

      <label htmlFor='newPassword'>New Password:</label>
      <input id='newPassword' type='password' onChange={onChange('newPassword')} defaultValue={userRef.current.newPassword} />

      <label htmlFor='confirmPassword'>Confirm password:</label>
      <input id='confirmPassword' type='password' onChange={onChange('confirmPassword')} defaultValue={userRef.current.confirmPassword} />

      <button type='submit'>ChangePassword</button>
    </form>
  )
}
