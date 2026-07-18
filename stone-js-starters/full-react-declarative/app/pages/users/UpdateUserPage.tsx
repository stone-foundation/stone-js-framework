import { JSX } from 'react'
import { User, UserInput } from '../../models/User'
import { UserService } from '../../services/UserService'
import { UserForm } from '../../components/UserForm/UserForm'
import { IPage, Page, ReactIncomingEvent, PageRenderContext, StoneLink } from '@stone-js/use-react'

/**
 * Update User Page options.
 */
export interface UpdateUserPageOptions {
  userService: UserService
}

/**
 * Update User Page component.
 */
@Page('/users/:user@id(\\d+)/edit', { bindings: { user: 'userService@findBy' } })
export class UpdateUserPage implements IPage<ReactIncomingEvent> {
  private readonly userService: UserService

  /**
   * Create a new Update User Page component.
   *
   * @param userService - The user service.
   */
  constructor ({ userService }: UpdateUserPageOptions) {
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
        <h1>Update user</h1>
        <UserForm user={user} onSubmit={async (userInput) => await this.saveUser(user?.id ?? 0, userInput)} />
        <StoneLink to={`/users/${String(user?.id)}`}>Back to user</StoneLink>
        <StoneLink to='/users'>Go to users</StoneLink>
      </>
    )
  }

  /**
   * Save the user.
   *
   * @param user - The user
   */
  private async saveUser (id: number, user: UserInput): Promise<void> {
    await this.userService.update(id, user)
  }
}
