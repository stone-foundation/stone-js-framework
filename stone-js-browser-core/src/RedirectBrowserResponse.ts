import { isEmpty } from '@stone-js/core'
import { BrowserError } from './errors/BrowserError'
import { OutgoingBrowserResponse, OutgoingBrowserResponseOptions } from './OutgoingBrowserResponse'

/**
 * Options for creating a Redirect HTTP Response.
 */
export interface RedirectBrowserResponseOptions extends OutgoingBrowserResponseOptions {
  url: string | URL
}

/**
 * Class representing a RedirectBrowserResponse.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class RedirectBrowserResponse extends OutgoingBrowserResponse {
  // Own identity constant — do NOT shadow the parent's OUTGOING_BROWSER_RESPONSE with a different
  // value (that made `Redirect….OUTGOING_BROWSER_RESPONSE` disagree with the parent's).
  static readonly REDIRECT_BROWSER_RESPONSE = 'stonejs@redirect_browser_response'
  public readonly targetUrl?: string | URL

  /**
   * Create an instance of RedirectBrowserResponse.
   *
   * @param options - Options for the outgoing browser response.
   * @returns A new instance of RedirectBrowserResponse.
   */
  static create (options: RedirectBrowserResponseOptions): RedirectBrowserResponse {
    return new RedirectBrowserResponse(options)
  }

  /**
   * Create an instance of RedirectBrowserResponse from the given path or URL.
   *
   * @param url - The path or URL to redirect to. If a string is provided, it will be treated as a relative path.
   * @param statusCode - The HTTP status code for the redirect (default is 302).
   * @returns A new instance of RedirectBrowserResponse.
   */
  static to (url: string | URL, statusCode: number = 302): RedirectBrowserResponse {
    return new RedirectBrowserResponse({ url, statusCode })
  }

  /**
   * Create a RedirectBrowserResponse.
   *
   * @param options - Options for creating the RedirectBrowserResponse.
   * @throws HttpError if the status code is not a redirect code.
   */
  constructor (options: RedirectBrowserResponseOptions) {
    // Default to 302 (a real redirect) rather than the parent's 200 — a redirect response with a
    // 200 status is meaningless (the old `create({ url })` produced exactly that).
    super({ statusCode: 302, ...options })

    if (isEmpty(options.url ?? options.content)) {
      throw new BrowserError('Cannot redirect to an empty URL.')
    }

    /* v8 ignore next */ // super() always sets a numeric statusCode; the ?? is a type guard only.
    const code = this.statusCode ?? 302
    if (code < 300 || code >= 400) {
      throw new BrowserError(`This status code (${code}) is not a redirect code.`)
    }

    const target = options.url ?? (options.content as any)?.redirect ?? options.content
    this.assertSafeTarget(target)
    this.targetUrl = target
  }

  /**
   * Reject dangerous redirect target schemes (`javascript:`, `data:`, `vbscript:`, …).
   *
   * The class does not navigate itself, but consumers assign `targetUrl` to `location.href`; an
   * unvalidated `javascript:` target would be an XSS sink. Relative paths and http(s) are allowed.
   *
   * @param url - The redirect target.
   * @throws BrowserError if the scheme is unsafe.
   */
  private assertSafeTarget (url: string | URL): void {
    const value = String(url instanceof URL ? url.href : url).trim()

    // Relative/same-document targets are always safe.
    if (value.startsWith('/') || value.startsWith('.') || value.startsWith('#') || value.startsWith('?')) { return }

    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value)?.[1]?.toLowerCase()
    if (scheme !== undefined && scheme !== 'http' && scheme !== 'https') {
      throw new BrowserError(`Unsafe redirect target scheme "${scheme}:".`)
    }
  }
}
