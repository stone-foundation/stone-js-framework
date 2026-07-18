import './UserPage.css'
import { JSX, useState } from 'react'
import { User } from '../../../models/User'
import { UserCard } from '../../../components/UserCard/UserCard'
import { IUserService } from '../../../services/contracts/IUserService'
import { IPage, definePage, ReactIncomingEvent, PageRenderContext } from '@stone-js/use-react'

/**
 * User Page options.
 */
export interface UserPageOptions {
  userService: IUserService
}

/**
 * User Page component.
 */
export const UserPage = ({ userService }: { userService: IUserService }): IPage<ReactIncomingEvent> => ({
  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @returns The event data.
   */
  async handle (event: ReactIncomingEvent): Promise<User[]> {
    return await userService.list(event.get<number>('limit', 10))
  },

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data }: PageRenderContext<User[]>): JSX.Element {
    const [query, setQuery] = useState('')

    return (
      <div className='users-page'>
        <h1 className='users-title'>Users</h1>
        <input
          type='text'
          placeholder='Search by name or email...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className='users-search'
        />
        <div className='user-grid'>
          {data?.map(user => (<UserCard key={user.id} user={user} />))}
        </div>
      </div>
    )
  }
})

/**
 * User Page Blueprint.
 */
export const UserPageBlueprint = definePage(UserPage, { path: '/users' })
