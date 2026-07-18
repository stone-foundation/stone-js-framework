import './LayoutHeader.css'
import { FC, useState } from 'react'
import { User } from '../../models/User'
import { Dropdown } from '../Dropdown/Dropdown'
import { UserBadge } from '../UserBadge/UserBadge'
import { IContainer, isNotEmpty } from '@stone-js/core'
import { ISecurityService } from '../../services/contracts/ISecurityService'
import { IRouter, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

/**
 * LayoutHeader options.
 */
export interface LayoutHeaderOptions {
  container: IContainer
}

/**
 * LayoutHeader component.
 */
export const LayoutHeader: FC<LayoutHeaderOptions> = ({ container }) => {
  const router = container.make<IRouter>('router')
  const [showDropdown, setShowDropdown] = useState(false)
  const securityService = container.make<ISecurityService>('securityService')
  const user = container.make<ReactIncomingEvent>('event').getUser<User>() ?? {} as unknown as User

  return (
    <nav className='app-navbar'>
      <div className='header-left'>
        <StoneLink to='/' className='logo'>
          <img src='/logo.png' alt='Stone.js Logo' />
          <span>Stone.js</span>
        </StoneLink>
      </div>
      {isNotEmpty<User>(user) && (
        <div className='header-right'>
          <div className='dropdown-wrapper'>
            <UserBadge withLink={false} user={user} onClick={() => setShowDropdown(!showDropdown)} />
            <Dropdown show={showDropdown} onClose={() => setShowDropdown(false)}>
              <ul className='dropdown-menu'>
                <li><StoneLink to={`/users/${user.id}`}>Show Profile</StoneLink></li>
                <li><StoneLink to={`/users/${user.id}/edit`}>Manage Profile</StoneLink></li>
                <li><button onClick={logout.bind(this, router, securityService)}>Logout</button></li>
              </ul>
            </Dropdown>
          </div>
        </div>
      )}
    </nav>
  )
}

/**
 * Logout the user.
 */
export function logout (router: IRouter, securityService: ISecurityService): void {
  if (window.confirm('Are you sure you want to logout?')) {
    securityService.logout().then(() => {
      router.navigate('/', true)
    }).catch(() => {})
  }
}
