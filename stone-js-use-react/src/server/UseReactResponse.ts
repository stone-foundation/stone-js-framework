import { isNotEmpty } from '@stone-js/core'
import { OutgoingHttpResponse, RedirectResponseOptions, RedirectResponse } from '@stone-js/http-core'
import { ReactOutgoingResponse, ReactRedirectResponseOptions, ReactResponseOptions } from '../declarations'

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
    isNotEmpty<RedirectResponseOptions>(options) &&
    (
      isNotEmpty(options.url) ||
      (isNotEmpty<any>(options.content) && isNotEmpty(options.content.redirect))
    )
  ) {
    return reactRedirectResponse(options)
  }

  return OutgoingHttpResponse.create<OutgoingHttpResponse>(options)
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
  return RedirectResponse.create<RedirectResponse>({ statusCode: 302, ...options })
}
