import './UnauthorizedErrorPage.css'
import { JSX } from 'react'
import { ILogger } from '@stone-js/core'
import { UnauthorizedError } from '../../errors/UnauthorizedError'
import { IErrorPage, ReactIncomingEvent, ErrorPageRenderContext, defineErrorPage } from '@stone-js/use-react'

/**
 * Unauthorized Error Handler component.
 */
export const UnauthorizedErrorPage = ({ logger }: { logger: ILogger }): IErrorPage<ReactIncomingEvent> => ({
  /**
   * Handle the error.
   *
   * @param error - The error to handle.
   * @returns The response.
   */
  handle (error: UnauthorizedError) {
    logger.error(error.message, { error })
    return { message: "I think you're an alien! Eh ?" }
  },

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data, statusCode }: ErrorPageRenderContext<UnauthorizedError>): JSX.Element {
    return (
      <div className='text-center'>
        <h1 className='h1'>{statusCode}</h1>
        <h2 className='h4'>Are you in the right place?</h2>
        <p className='text-muted mt-24'>{data?.message}</p>
      </div>
    )
  }
})

/**
 * Unauthorized Error Page Blueprint.
 */
export const UnauthorizedErrorPageBlueprint = defineErrorPage(UnauthorizedErrorPage, { layout: 'error', error: 'UnauthorizedError' })
