import { FC } from 'react'
import { User } from '../../models/User'
import { dateTimeFromNow } from '../../utils'
import { StoneLink } from '@stone-js/use-react'
import { UserAvatar } from '../UserAvatar/UserAvatar'

/**
 * UserCard options.
 */
interface UserCardOptions {
  user: User
}

/**
 * UserCard component.
 */
export const UserCard: FC<UserCardOptions> = ({ user }) => {
  return (
    <div className='user-card'>
      <div className='user-card-header'>
        <StoneLink to={`/users/${user.id}`} className='user-card-link'>
          <UserAvatar user={user} size='lg' />
        </StoneLink>
        <div className='user-card-info'>
          <StoneLink to={`/users/${user.id}`} className='user-card-name'>{user.name}</StoneLink>
          <StoneLink to={`/users/${user.id}`} className='user-card-email'>{user.email}</StoneLink>
        </div>
        <span className={`user-status ${user.isOnline ? 'online' : 'offline'}`} />
      </div>

      <div className='user-card-meta'>
        <span>📝 {user.postCount} Posts</span>
        <span>💬 {user.commentCount} Comments</span>
      </div>

      {!user.isOnline && (
        <div className='user-last-seen'>
          Last seen {dateTimeFromNow(user.lastSeen)}
        </div>
      )}
    </div>
  )
}
