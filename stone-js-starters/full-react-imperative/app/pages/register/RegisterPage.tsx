import { Dispatch, JSX, SetStateAction, useState } from 'react'
import { UserRegister, UserRegisterErrors } from '../../models/User'
import { RegisterForm } from '../../components/RegisterForm/RegisterForm'
import { definePage, IPage, ReactIncomingEvent } from '@stone-js/use-react'
import { ISecurityService } from '../../services/contracts/ISecurityService'

/**
 * Register Page options.
 */
interface RegisterPageOptions {
  securityService: ISecurityService
}

/**
 * Register Page component.
 */
export const RegisterPage = ({ securityService }: RegisterPageOptions): IPage<ReactIncomingEvent> => ({
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
          onSubmit={async (user: UserRegister) => await register(securityService, user, setDone, setError)}
        />
      </div>
    )
  }
})

/**
 * Register the user.
 *
 * @param securityService - The security service.
 * @param user - The user to register.
 * @param setDone - The function to set the done state.
 * @param setError - The function to set the error state.
 */
export async function register (
  securityService: ISecurityService,
  user: UserRegister,
  setDone: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<UserRegisterErrors>>
): Promise<void> {
  try {
    await securityService.register(user)
    setDone(true)
  } catch (error: any) {
    setError(error.response?.data?.errors ?? {})
  }
}

/**
 * Register Page Blueprint.
 */
export const RegisterPageBlueprint = definePage(
  RegisterPage,
  {
    path: '/register',
    layout: 'security'
  }
)
