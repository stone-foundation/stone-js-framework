import './AppLayout.css'
import { JSX } from 'react'
import { User } from '../../models/User'
import { IBlueprint, isNotEmpty } from '@stone-js/core'
import { SecurityService } from '../../services/SecurityService'
import { IPageLayout, IRouter, PageLayout, PageLayoutRenderContext, ReactIncomingEvent, StoneLink, StoneOutlet } from '@stone-js/use-react'

/**
 * App Layout options.
 */
export interface AppLayoutOptions {
  router: IRouter
  blueprint: IBlueprint
  securityService: SecurityService
}

/**
 * App Layout component.
 */
@PageLayout({ name: 'default' })
export class AppLayout implements IPageLayout {
  private readonly router: IRouter
  private readonly blueprint: IBlueprint
  private readonly securityService: SecurityService

  /**
   * Create a new App Layout component.
   *
   * @param options - The options to create the App Layout component.
   */
  constructor ({ router, blueprint, securityService }: AppLayoutOptions) {
    this.router = router
    this.blueprint = blueprint
    this.securityService = securityService
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ container, children }: PageLayoutRenderContext): JSX.Element {
    const user = container.make<ReactIncomingEvent>('event').getUser<User>() ?? {} as unknown as User

    return (
      <div className='app-layout'>
        <header>
          <p>
            <StoneLink to='/' className='logo'>
              <img src='/logo.png' alt='Stone.js Logo' />
              <span>Stone.js</span>
            </StoneLink>
          </p>
          {isNotEmpty<User>(user) && (
            <p>
              <span>
                <img src={this.getUserAvatar(user)} alt='Stone.js Logo' />
              </span>
              <span>
                <span>{user.name}</span>
                <span>{user.email}</span>
              </span>
            </p>
          )}
          <p>
            {isNotEmpty<User>(user)
              ? <button onClick={() => this.logout()}>Logout</button>
              : <StoneLink to='/login'>Login</StoneLink>}
          </p>
        </header>
        <main>
          <StoneOutlet>{children}</StoneOutlet>
        </main>
        <footer>&copy; 2025 Stone.js</footer>
      </div>
    )
  }

  /**
   * Logout the user.
   */
  logout (): void {
    if (window.confirm('Are you sure you want to logout?')) {
      void this.securityService.logout().then(() => {
        this.router.navigate('/', true)
      })
    }
  }

  /**
   * Get the user avatar.
   *
   * @param user - The user to get the avatar.
   * @returns The user avatar.
   */
  private getUserAvatar (user: User): string {
    const baseUrl = this.blueprint.get<string>('app.api.baseURL', '')
    return isNotEmpty<string>(user.avatar) ? `${baseUrl}/users/${user.id}/avatar` : '/assets/avatar.png'
  }
}
