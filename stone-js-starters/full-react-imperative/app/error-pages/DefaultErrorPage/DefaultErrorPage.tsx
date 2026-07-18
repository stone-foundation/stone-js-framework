import './DefaultErrorPage.css'
import { JSX } from 'react'
import { ILogger } from '@stone-js/core'
import { IErrorPage, ReactIncomingEvent, ErrorPageRenderContext, defineErrorPage } from '@stone-js/use-react'

/**
 * Default Error Page.
 */
export const DefaultErrorPage = ({ logger }: { logger: ILogger }): IErrorPage<ReactIncomingEvent> => ({
  /**
   * Handle the error.
   *
   * @param error - The error to handle.
   * @returns The response.
   */
  handle (error: any): { message: string } {
    logger.error(error.message, { error })
    return { message: 'Oops! Something went wrong!' }
  },

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data, statusCode }: ErrorPageRenderContext<Error>): JSX.Element {
    return (
      <div className='text-center'>
        <h1 className='h1'>{statusCode}</h1>
        <h2 className='h4'>An Error occured!</h2>
        <p className='text-muted mt-24'>{data?.message}</p>
      </div>
    )
  }
})

/**
 * Default Error Page Blueprint.
 */
export const DefaultErrorPageBlueprint = defineErrorPage(DefaultErrorPage, { layout: 'error', error: 'default' })
