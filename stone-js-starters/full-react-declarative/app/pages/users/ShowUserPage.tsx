import { JSX } from 'react'
import { User } from '../../models/User'
import { isNotEmpty } from '@stone-js/core'
import { UserService } from '../../services/UserService'
import { IPage, Page, ReactIncomingEvent, PageRenderContext, StoneLink } from '@stone-js/use-react'

/**
 * Show User Page options.
 */
export interface ShowUserPageOptions {
  userService: UserService
}

/**
 * Show User Page component.
 */
@Page('/users/:user@id(\\d+)', { bindings: { user: 'userService@findBy' } })
export class ShowUserPage implements IPage<ReactIncomingEvent> {
  private readonly userService: UserService

  /**
   * Create a new Show User Page component.
   *
   * @param options - The options to create the Show User Page component.
   */
  constructor ({ userService }: ShowUserPageOptions) {
    this.userService = userService
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ event }: PageRenderContext): JSX.Element {
    const user = event.get<User>('user')

    return (
      <>
        <h1>Show user</h1>
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        <StoneLink to={`/users/${String(user?.id)}/edit`}>Edit</StoneLink>
        <button onClick={() => this.deleteUser(user)}>Delete</button>
        <StoneLink to='/users'>Go to users</StoneLink>
      </>
    )
  }

  /**
   * Delete the user.
   *
   * @param container - The container.
   * @param user - The user
   */
  private deleteUser (user?: User): void {
    if (isNotEmpty<User>(user) && window.confirm('Are you sure you want to delete this user?')) {
      void this.userService.delete(user.id).catch(() => {})
    }
  }
}
