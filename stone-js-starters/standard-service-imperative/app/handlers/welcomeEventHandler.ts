import { IncomingHttpEvent } from '@stone-js/http-core'
import { WelcomeService } from '../services/welcomeService'
import { defineRoute, FactoryEventHandler, FunctionalEventHandler } from '@stone-js/router'

/**
 * Welcome Event Handler Options
*/
export interface WelcomeEventHandlerOptions {
  welcomeService: WelcomeService
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
}

/**
 * Welcome
*/
export const WelcomeEventHandler: FactoryEventHandler<IncomingHttpEvent> = (
  { welcomeService }: WelcomeEventHandlerOptions
): FunctionalEventHandler<IncomingHttpEvent> => (event: IncomingHttpEvent): ResponseData => {
  return welcomeService.welcome(event.get<string>('name', 'World'))
}

/**
 * WelcomeEventHandler Blueprint
 */
export const WelcomeEventHandlerBlueprint = defineRoute(WelcomeEventHandler, { path: '/:name?', isFactory: true })
