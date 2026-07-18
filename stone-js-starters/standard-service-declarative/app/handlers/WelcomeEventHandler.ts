import { EventHandler, Get } from '@stone-js/router'
import { WelcomeService } from '../services/WelcomeService'
import { IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

/**
 * Welcome Event Handler Options
*/
export interface WelcomeEventHandlerOptions {
  welcomeService: WelcomeService
}

/**
 * Welcome Event Handler
 *
 * @EventHandler() is a decorator that marks a class as a handler.
 * @EventHandler() think about it as a controller in other frameworks.
 * Stone.js also provides a @Controller() decorator that is an alias to @EventHandler().
 * If you are familiar with other frameworks, you can use @Controller() instead of @EventHandler().
*/
@EventHandler()
export class WelcomeEventHandler {
  private readonly welcomeService: WelcomeService

  /**
   * Create a new instance of WelcomeEventHandler
   *
   * @param welcomeService
   */
  constructor ({ welcomeService }: WelcomeEventHandlerOptions) {
    this.welcomeService = welcomeService
  }

  /**
   * Welcome
   * With explicit json response type.
   *
   * @param event - The incoming HTTP event
   * @returns A welcome message
  */
  @Get('/:name?')
  @JsonHttpResponse(200)
  welcome (event: IncomingHttpEvent): { message: string } {
    return this.welcomeService.welcome(event.get<string>('name', 'World'))
  }
}
