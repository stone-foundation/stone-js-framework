import { FC, useState } from 'react'
import { isNotEmpty } from '@stone-js/core'
import { StoneLink } from '@stone-js/use-react'
import { UserRegister, UserRegisterErrors } from '../../models/User'

/**
 * Register Form Options
 */
export interface RegisterFormOptions {
  done: boolean
  error?: UserRegisterErrors
  onSubmit: (user: UserRegister) => Promise<void>
}

/**
 * Register Form component.
 *
 * @param options - The options to create the Register Form component.
 */
export const RegisterForm: FC<RegisterFormOptions> = ({ onSubmit, error, done }) => {
  // Create a reference to the user
  const [user, setUser] = useState<UserRegister>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Handle the form submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    isValid() && onSubmit(user).catch(() => {})
  }

  const isValid = (): boolean => isNotEmpty(user.name) && isNotEmpty(user.email) && isNotEmpty(user.password) && user.password === user.confirmPassword

  // Handle the field change
  const onChange = (field: keyof UserRegister) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [field]: event.target.value })
  }

  // Create the form component
  const formComponent = (
    <form onSubmit={handleSubmit} className='panel'>
      {error?.message !== undefined && <p className='alert alert-danger alert-small'>{error?.message}</p>}

      <div>
        <label htmlFor='name' className='label'>Name:</label>
        <input
          id='name'
          type='text'
          className='input'
          placeholder='Enter your name'
          onChange={onChange('name')} defaultValue={user.name}
        />
      </div>

      <div>
        <label htmlFor='email' className='label'>Email:</label>
        <input
          id='email'
          type='email'
          className='input'
          placeholder='Enter your email'
          onChange={onChange('email')} defaultValue={user.email}
        />
      </div>

      <div>
        <label htmlFor='password' className='label'>Password:</label>
        <input
          id='password'
          type='password'
          className='input'
          placeholder='Enter your password'
          onChange={onChange('password')} defaultValue={user.password}
        />
      </div>

      <div>
        <label htmlFor='confirmPassword' className='label'>Confirm password:</label>
        <input
          id='confirmPassword'
          type='password'
          className='input'
          placeholder='Confirm your password'
          onChange={onChange('confirmPassword')} defaultValue={user.confirmPassword}
        />
      </div>

      <button type='submit' className='button button-secondary button-full mt-24' disabled={!isValid()}>Register</button>
    </form>
  )

  // Create the done component
  const doneComponent = <div className='panel'><p className='alert alert-success'>Registration successful! 🎉 You can now login</p></div>

  // Get the component
  const component = done ? doneComponent : formComponent

  // Render the component
  return (
    <div>
      {component}
      <p className='mt-24 text-center'>
        <StoneLink to='/login' className='button button-primary'>Login</StoneLink>
      </p>
    </div>
  )
}
