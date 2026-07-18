import { JSX } from 'react'
import { WelcomeService } from '../../services/WelcomeService'
import { Page, ReactIncomingEvent, PageRenderContext, IPage } from '@stone-js/use-react'

/**
 * WelcomePage Options
*/
export interface WelcomePageOptions {
  welcomeService: WelcomeService
}

/**
 * Response data
 */
export interface ResponseData {
  message: string
}

/**
 * Welcome Page component.
 */
@Page('/:name?')
export class WelcomePage implements IPage<ReactIncomingEvent> {
  private readonly welcomeService: WelcomeService

  /**
   * Create a new instance of WelcomePage
   *
   * @param welcomeService
   */
  constructor ({ welcomeService }: WelcomePageOptions) {
    this.welcomeService = welcomeService
  }

  /**
   * Handle the incoming event.
   *
   * @param event - The incoming event.
   * @returns A welcome message
  */
  handle (event: ReactIncomingEvent): ResponseData {
    return this.welcomeService.welcome(event.get<string>('name', 'World'))
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data }: PageRenderContext<ResponseData>): JSX.Element {
    return (
      <section className='container'>
        <h1 className='h1 text-center mt-64'>{data?.message}</h1>
      </section>
    )
  }
}
