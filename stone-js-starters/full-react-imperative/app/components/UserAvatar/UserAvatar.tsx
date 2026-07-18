import './UserAvatar.css'
import { FC, useState } from 'react'
import { User } from '../../models/User'
import { StoneLink } from '@stone-js/use-react'

/**
 * UserAvatar options.
 */
interface UserAvatarOptions {
  user: User
  withLink?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | number
}

/**
 * UserAvatar component.
 */
export const UserAvatar: FC<UserAvatarOptions> = ({
  user,
  size = 'md',
  className = '',
  withLink = true
}) => {
  const [imgError, setImgError] = useState(false)
  const fallback = user.name?.charAt(0).toUpperCase() ?? '?'

  const getSize = (): number => {
    if (typeof size === 'number') return size
    const sizes = { sm: 28, md: 36, lg: 48 }
    return sizes[size] ?? 36
  }

  const dimension = getSize()

  const shouldShowFallback = user.avatar === undefined || imgError

  return shouldShowFallback
    ? (
      <StoneLink to={withLink ? `/users/${user.id}` : undefined} href='#'>
        <div
          className={`user-avatar-fallback ${className}`}
          style={{ width: dimension, height: dimension, fontSize: dimension / 2.2 }}
        >
          {fallback}
        </div>
      </StoneLink>
      )
    : (
      <StoneLink to={withLink ? `/users/${user.id}` : undefined} href='#'>
        <img
          src={user.avatar}
          alt={user.name}
          className={`user-avatar-img ${className}`}
          style={{ width: dimension, height: dimension }}
          onError={() => setImgError(true)}
        />
      </StoneLink>
      )
}
