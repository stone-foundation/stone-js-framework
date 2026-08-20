import { Controller, Match } from '@stone-js/router'
import { IncomingBrowserEvent } from '@stone-js/browser-core'

/**
 * The payload every route of this starter returns.
 */
export interface WelcomeData {
  message: string
  route: string
  framework: {
    name: string
    tagline: string
    docs: string
  }
}

/**
 * WelcomeController
 *
 * The routes are matched against the URL carried by each navigation event,
 * exactly like they would be in a browser SPA or behind an HTTP adapter:
 * the domain does not know it is running inside a native application.
 */
@Controller()
export class WelcomeController {
  /**
   * The landing route, dispatched once when the application starts.
   *
   * @returns The welcome payload.
   */
  @Match('/')
  welcome (): WelcomeData {
    return this.present('Welcome to Stone.js on React Native!', '/')
  }

  /**
   * A parameterized route: the `name` route parameter is read from the event.
   *
   * @param event - The incoming navigation event.
   * @returns The greeting payload.
   */
  @Match('/hello/:name')
  hello (event: IncomingBrowserEvent): WelcomeData {
    const name = String(event.get<string>('name', 'World'))
    return this.present(`Hello ${name}! Same domain, native screen.`, `/hello/${name}`)
  }

  /**
   * Build the branded payload returned by every route.
   *
   * @param message - The message to display.
   * @param route - The matched route path.
   * @returns The payload.
   */
  private present (message: string, route: string): WelcomeData {
    return {
      message,
      route,
      framework: {
        name: 'Stone.js',
        tagline: 'The continuum framework',
        docs: 'https://stonejs.dev'
      }
    }
  }
}
