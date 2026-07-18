import { isNotEmpty } from '@stone-js/core'
import { ReactOutgoingResponse, ReactRedirectResponseOptions, ReactResponseOptions } from '../declarations'
import { OutgoingBrowserResponse, RedirectBrowserResponse, RedirectBrowserResponseOptions } from '@stone-js/browser-core'

/**
 * Create an UseReact response.
 *
 * @param options - The options for creating the response.
 * @returns The React response.
 */
export const reactResponse = (
  options: ReactResponseOptions
): ReactOutgoingResponse => {
  if (
    isNotEmpty<RedirectBrowserResponseOptions>(options) &&
    (
      isNotEmpty(options.url) ||
      (isNotEmpty<any>(options.content) && isNotEmpty(options.content.redirect))
    )
  ) {
    return reactRedirectResponse(options)
  }

  return OutgoingBrowserResponse.create(options)
}

/**
 * Create an UseReact redirect response.
 *
 * @param options - The options for creating the response.
 * @returns The React redirect response.
 */
export const reactRedirectResponse = (
  options: ReactRedirectResponseOptions
): ReactOutgoingResponse => {
  return RedirectBrowserResponse.create({ statusCode: 302, ...options })
}
