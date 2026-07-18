import './UserBadge.css'
import { FC } from 'react'
import { User } from '../../models/User'
import { dateTimeFromNow } from '../../utils'
import { StoneLink } from '@stone-js/use-react'
import { UserAvatar } from '../UserAvatar/UserAvatar'

/**
 * UserBadge options.
 */
interface UserBadgeOptions {
  user: User
  withLink?: boolean
  createdAt?: number
  className?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg' | number
  direction?: 'horizontal' | 'vertical'
}

/**
 * UserBadge component.
 */
export const UserBadge: FC<UserBadgeOptions> = ({
  user,
  createdAt,
  size = 'md',
  direction = 'horizontal',
  onClick,
  withLink = true,
  className = ''
}) => {
  return (
    <div
      className={`user-badge ${direction} ${className}`}
      onClick={onClick}
      style={{ cursor: (onClick != null) ? 'pointer' : 'default' }}
    >
      <UserAvatar withLink={withLink} user={user} size={size} />
      <div className='user-badge-info'>
        <StoneLink to={withLink ? `/users/${user.id}` : undefined} href='#' className='user-badge-name'>
          {user.name}
        </StoneLink>
        {createdAt !== undefined && <span className='user-badge-details'>{dateTimeFromNow(createdAt)}</span>}
        {createdAt === undefined && user.email !== undefined && <span className='user-badge-details'>{user.email}</span>}
      </div>
    </div>
  )
}
