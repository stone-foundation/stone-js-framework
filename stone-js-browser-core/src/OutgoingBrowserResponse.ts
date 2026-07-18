import { OutgoingResponse, OutgoingResponseOptions } from '@stone-js/core'

/**
 * Options for creating an Outgoing Browser Response.
 */
export interface OutgoingBrowserResponseOptions extends OutgoingResponseOptions {}

export class OutgoingBrowserResponse extends OutgoingResponse {
  static OUTGOING_BROWSER_RESPONSE = 'stonejs@outgoing_browser_response'

  /**
   * Create an instance of OutgoingBrowserResponse.
   *
   * @param options - Options for the outgoing browser response.
   * @returns A new instance of OutgoingBrowserResponse.
   */
  static create (options: OutgoingBrowserResponseOptions): OutgoingBrowserResponse {
    return new OutgoingBrowserResponse(options)
  }

  /**
   * Constructor for OutgoingBrowserResponse.
   * Initializes headers and cookies based on the provided options.
   *
   * @param options - Options for the outgoing browser response.
   */
  constructor (options: OutgoingBrowserResponseOptions) {
    super({ statusCode: 200, ...options, type: OutgoingBrowserResponse.OUTGOING_BROWSER_RESPONSE })
  }

  /**
   * Check if the status code falls within the specified range.
   *
   * @param start - The starting value of the range (inclusive).
   * @param end - The ending value of the range (exclusive).
   * @returns True if the status code is within the specified range, otherwise false.
   */
  isInStatusRange (start: number, end: number): boolean {
    const code = this.statusCode ?? 500
    return code >= start && code < end
  }

  /**
   * Check if the status code is invalid.
   *
   * @returns True if the status code is invalid, otherwise false.
   */
  isInvalid (): boolean {
    const code = this.statusCode ?? 500
    return code < 100 || code >= 600
  }

  /**
   * Check if the status code represents an informational response (1xx).
   *
   * @returns True if the status code is informational, otherwise false.
   */
  is1xx (): boolean {
    return this.isInStatusRange(100, 200)
  }

  /**
   * Check if the status code represents a successful response (2xx).
   *
   * @returns True if the status code is successful, otherwise false.
   */
  is2xx (): boolean {
    return this.isInStatusRange(200, 300)
  }

  /**
   * Check if the status code represents a redirection response (3xx).
   *
   * @returns True if the status code is a redirection, otherwise false.
   */
  is3xx (): boolean {
    return this.isInStatusRange(300, 400)
  }

  /**
   * Check if the status code represents a client error response (4xx).
   *
   * @returns True if the status code is a client error, otherwise false.
   */
  is4xx (): boolean {
    return this.isInStatusRange(400, 500)
  }

  /**
   * Check if the status code represents a server error response (5xx).
   *
   * @returns True if the status code is a server error, otherwise false.
   */
  is5xx (): boolean {
    return this.isInStatusRange(500, 600)
  }

  /**
   * Check if the status code is not an error (i.e., not 4xx or 5xx).
   *
   * @returns True if the status code is not an error, otherwise false.
   */
  isNotError (): boolean {
    return !this.isError()
  }

  /**
   * Check if the status code is an error (i.e., 4xx or 5xx).
   *
   * @returns True if the status code is an error, otherwise false.
   */
  isError (): boolean {
    return this.is4xx() || this.is5xx()
  }

  /**
   * Check if the status code is 200 (OK).
   *
   * @returns True if the status code is 200, otherwise false.
   */
  isOk (): boolean {
    return this.statusCode === 200
  }

  /**
   * Check if the status code is 401 (Unauthorized).
   *
   * @returns True if the status code is 401, otherwise false.
   */
  isUnauthorized (): boolean {
    return this.statusCode === 401
  }

  /**
   * Check if the status code is 403 (Forbidden).
   *
   * @returns True if the status code is 403, otherwise false.
   */
  isForbidden (): boolean {
    return this.statusCode === 403
  }

  /**
   * Check if the status code is 404 (Not Found).
   *
   * @returns True if the status code is 404, otherwise false.
   */
  isNotFound (): boolean {
    return this.statusCode === 404
  }
}
