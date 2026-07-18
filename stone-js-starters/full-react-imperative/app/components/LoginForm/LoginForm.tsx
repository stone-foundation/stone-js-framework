import './LoginForm.css'
import { FC, useRef } from 'react'
import { UserLogin } from '../../models/User'
import { StoneLink } from '@stone-js/use-react'

/**
 * Login Form Options
 */
export interface LoginFormOptions {
  error: boolean
  onSubmit: (user: UserLogin) => Promise<void>
}

/**
 * Login Form component.
 *
 * @param options - The options to create the Login Form component.
 */
export const LoginForm: FC<LoginFormOptions> = ({ error, onSubmit }) => {
  // Create a reference to the login
  const loginRef = useRef<UserLogin>({
    email: '',
    password: ''
  })

  // Handle the form submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void onSubmit(loginRef.current).catch(() => {})
  }

  // Handle the field change
  const onChange = (field: keyof UserLogin) => (event: React.ChangeEvent<HTMLInputElement>) => {
    loginRef.current[field] = event.target.value
  }

  // Render the component
  return (
    <>
      <form onSubmit={handleSubmit} className='panel'>
        {error && <p className='alert alert-danger alert-small'>Invalid email or password</p>}

        <div>
          <label htmlFor='email' className='label'>Email:</label>
          <input
            id='email'
            type='email'
            className='input'
            placeholder='Enter your email'
            onChange={onChange('email')} defaultValue={loginRef.current.email}
          />
        </div>

        <div className='mt-8'>
          <label htmlFor='password' className='label'>Password:</label>
          <input
            id='password'
            type='password'
            className='input'
            placeholder='Enter your password'
            onChange={onChange('password')} defaultValue={loginRef.current.password}
          />
        </div>
        <button type='submit' className='button button-secondary button-full mt-24'>Login</button>
      </form>
      <p className='mt-24 text-center'>
        <StoneLink to='/register' className='button button-primary'>Register</StoneLink>
      </p>
    </>
  )
}
