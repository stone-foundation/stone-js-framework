import { Dispatch, JSX, SetStateAction, useState } from 'react'
import { SecurityService } from '../../services/SecurityService'
import { UserRegister, UserRegisterErrors } from '../../models/User'
import { IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { RegisterForm } from '../../components/RegisterForm/RegisterForm'

/**
 * Register Page options.
 */
interface RegisterPageOptions {
  securityService: SecurityService
}

/**
 * Register Page component.
 */
@Page('/register', { layout: 'security' })
export class RegisterPage implements IPage<ReactIncomingEvent> {
  private readonly securityService: SecurityService

  /**
   * Create a new Register Page component.
   *
   * @param options - The options to create the Register Page component.
   */
  constructor ({ securityService }: RegisterPageOptions) {
    this.securityService = securityService
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render (): JSX.Element {
    const [done, setDone] = useState<boolean>(false)
    const [error, setError] = useState<UserRegisterErrors>({})

    return (
      <div>
        <RegisterForm
          done={done}
          error={error}
          onSubmit={async (user: UserRegister) => await this.register(user, setDone, setError)}
        />
      </div>
    )
  }

  /**
   * Register the user.
   *
   * @param user - The user to register.
   */
  private async register (
    user: UserRegister,
    setDone: Dispatch<SetStateAction<boolean>>,
    setError: Dispatch<SetStateAction<UserRegisterErrors>>
  ): Promise<void> {
    try {
      await this.securityService.register(user)
      setDone(true)
    } catch (error: any) {
      setError(error.response?.data?.errors ?? {})
    }
  }
}
