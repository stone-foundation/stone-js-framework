import { EventHandler, Get } from '@stone-js/router'
import { IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

/**
 * Framework brand descriptor returned by the welcome endpoint.
 */
export interface FrameworkBrand {
  name: string
  tagline: string
  docs: string
  github: string
}

/**
 * Branded welcome payload.
 */
export interface WelcomePayload {
  message: string
  framework: FrameworkBrand
}

/**
 * Welcome Event Handler
 *
 * Greets the caller at the application root with a branded Stone.js payload.
 * The `name` query param keeps the domain behavior meaningful.
 */
@EventHandler('/', { name: 'welcome' })
export class WelcomeEventHandler {
  /**
   * Return the branded welcome payload.
   */
  @Get('/', { name: 'index' })
  @JsonHttpResponse(200)
  welcome (event: IncomingHttpEvent): WelcomePayload {
    const name = event.get<string>('name', 'Stone')
    return {
      message: `Hello ${name}! Welcome to Stone.js.`,
      framework: {
        name: 'Stone.js',
        tagline: 'The continuum framework',
        docs: 'https://stonejs.dev',
        github: 'https://github.com/stone-foundation/stone-js-framework'
      }
    }
  }
}
