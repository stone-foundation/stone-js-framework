import './LayoutLeftMenu.css'
import { FC } from 'react'
import { User } from '../../models/User'
import { IContainer, isNotEmpty } from '@stone-js/core'
import { ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

/**
 * LayoutLeftMenu options.
 */
export interface LayoutLeftMenuOptions {
  container: IContainer
}

/**
 * LayoutLeftMenu component.
 */
export const LayoutLeftMenu: FC<LayoutLeftMenuOptions> = ({ container }) => {
  const user = container.make<ReactIncomingEvent>('event').getUser<User>() ?? {} as unknown as User

  return (
    <nav className='main-nav'>
      <StoneLink to='/' className='nav-btn'>Home</StoneLink>
      <StoneLink to='/users' className='nav-btn'>Users</StoneLink>
      {isNotEmpty<User>(user) && (
        <>
          <StoneLink to={`/users/${user.id}`} className='nav-btn'>Profile</StoneLink>
          <StoneLink to='/settings' className='nav-btn'>Settings</StoneLink>
        </>
      )}
    </nav>
  )
}
