import { IncomingHttpEvent } from '@stone-js/http-core'
import { FunctionalEventHandler } from '@stone-js/core'
import { defineRoutes, GET } from '@stone-js/router'

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
 * Welcome event handler factory.
 *
 * Greets the caller at the application root with a branded Stone.js payload.
 * The `name` query param keeps the domain behavior meaningful.
 */
export function factoryWelcomeEventHandler (): FunctionalEventHandler<IncomingHttpEvent> {
  return function (event: IncomingHttpEvent): WelcomePayload {
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

/**
 * Welcome Event Handler
 */
export const WelcomeEventHandler = defineRoutes(
  [
    [factoryWelcomeEventHandler, { isFactory: true, path: '/', method: GET, name: 'welcome.index' }]
  ]
)
