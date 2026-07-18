import { JSX } from 'react'
import { UserInput } from '../../models/User'
import { UserService } from '../../services/UserService'
import { UserForm } from '../../components/UserForm/UserForm'
import { IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

/**
 * Create User Page component.
 */
@Page('/users/create')
export class CreateUserPage implements IPage<ReactIncomingEvent> {
  private readonly userService: UserService

  /**
   * Create a new Update User Page component.
   *
   * @param userService - The user service.
   */
  constructor ({ userService }: { userService: UserService }) {
    this.userService = userService
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render (): JSX.Element {
    return (
      <>
        <h1>User form</h1>
        <UserForm onSubmit={this.saveUser.bind(this)} />
        <StoneLink to='/users'>Go to users</StoneLink>
      </>
    )
  }

  /**
   * Save the user.
   *
   * @param user - The user
   */
  private async saveUser (user: UserInput): Promise<void> {
    console.log('user saved', user)
    await this.userService.create(user)
  }
}
