import './LoginPage.css'
import { IBlueprint } from '@stone-js/core'
import { UserLogin } from '../../models/User'
import { Dispatch, JSX, SetStateAction, useState } from 'react'
import { LoginForm } from '../../components/LoginForm/LoginForm'
import { ISecurityService } from '../../services/contracts/ISecurityService'
import { definePage, IPage, IRouter, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * Login Page options.
 */
interface LoginPageOptions {
  router: IRouter
  blueprint: IBlueprint
  securityService: ISecurityService
}

/**
 * Login Page component.
 */
export const LoginPage = ({ router, blueprint, securityService }: LoginPageOptions): IPage<ReactIncomingEvent> => ({
  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render (): JSX.Element {
    const [error, setError] = useState<boolean>(false)

    return (
      <div>
        <LoginForm
          error={error}
          onSubmit={async (user: UserLogin) => await login(router, blueprint, securityService, user, setError)}
        />
      </div>
    )
  }
})

/**
 * Login the user.
 *
 * @param user - The user to login.
 */
export async function login (
  router: IRouter,
  blueprint: IBlueprint,
  securityService: ISecurityService,
  user: UserLogin,
  setError: Dispatch<SetStateAction<boolean>>
): Promise<void> {
  try {
    await securityService.login(user)
    router.navigate(blueprint.get('app.requestedUrl', '/'), true)
  } catch (_: any) {
    setError(true)
  }
}

/**
 * Login Page Blueprint.
 */
export const LoginPageBlueprint = definePage(LoginPage, { path: '/login', layout: 'security' })
