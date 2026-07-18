import { JSX } from 'react'
import { User } from '../../models/User'
import { UserService } from '../../services/UserService'
import { IPage, Page, ReactIncomingEvent, PageRenderContext, StoneLink } from '@stone-js/use-react'

export interface UserPageOptions {
  userService: UserService
}

/**
 * User Page component.
 */
@Page('/users')
export class UserPage implements IPage<ReactIncomingEvent> {
  private readonly userService: UserService

  /**
   * Create a new Update User Page component.
   *
   * @param userService - The user service.
   */
  constructor ({ userService }: UserPageOptions) {
    this.userService = userService
  }

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @returns The event data.
   */
  async handle (event: ReactIncomingEvent): Promise<User[]> {
    return await this.userService.list(event.get<number>('limit', 10))
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data }: PageRenderContext<User[]>): JSX.Element {
    return (
      <>
        <h1>Users</h1>
        <ul>
          {data?.map(user => (
            <li key={user.id}>
              <StoneLink to={`/users/${user.id}`}>{user.name}</StoneLink>
            </li>
          ))}
        </ul>
        <p><StoneLink to='/users/create'>New User</StoneLink></p>
      </>
    )
  }
}
