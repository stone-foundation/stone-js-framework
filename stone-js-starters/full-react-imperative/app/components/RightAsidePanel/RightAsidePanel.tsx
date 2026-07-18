import './RightAsidePanel.css'
import { User } from '../../models/User'
import { IContainer } from '@stone-js/core'
import { FC, useEffect, useState } from 'react'
import { UserBadge } from '../UserBadge/UserBadge'
import { IUserService } from '../../services/contracts/IUserService'

interface RightAsidePanelProps {
  container: IContainer
}

export const RightAsidePanel: FC<RightAsidePanelProps> = ({ container }) => {
  const [online, setOnline] = useState<User[]>([])
  const [newbies, setNewbies] = useState<User[]>([])
  const [popular, setPopular] = useState<User[]>([])
  const userService = container.make<IUserService>('userService')

  useEffect(() => {
    userService.list(5).then(users => {
      setOnline(users.slice(0, 5))
      setNewbies(users.slice(0, 5))
      setPopular(users.slice(0, 5))
    }).catch(() => {})
  }, [userService])

  return (
    <aside className='right-aside-panel'>
      <div className='aside-section'>
        <h3>New Users</h3>
        <ul>
          {newbies.map((user) => (
            <li key={user.id}>
              <UserBadge user={user} size='sm' />
            </li>
          ))}
        </ul>
      </div>

      <div className='aside-section'>
        <h3>Most Popular</h3>
        <ul>
          {popular.map((user) => (
            <li key={user.id}>
              <UserBadge user={user} size='sm' />
            </li>
          ))}
        </ul>
      </div>

      <div className='aside-section'>
        <h3>Online Now</h3>
        <ul>
          {online.map((user) => (
            <li key={user.id}>
              <UserBadge user={user} size='sm' />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
