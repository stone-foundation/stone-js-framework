import { IRawResponseWrapper } from '@stone-js/core'
import { RawHttpResponse, RawHttpResponseOptions } from './declarations'

/**
 * Wrapper for HTTP raw responses in Tencent SCF.
 *
 * The `RawHttpResponseWrapper` is responsible for constructing and returning
 * a raw HTTP response that conforms to the expected structure for Tencent SCF.
 * It implements the `IRawResponseWrapper` interface, ensuring compatibility
 * with the Stone.js framework.
 */
export class RawHttpResponseWrapper implements IRawResponseWrapper<RawHttpResponse> {
  /**
   * Factory method to create an instance of `RawHttpResponseWrapper`.
   *
   * This method accepts partial response options, allowing the user to configure
   * only the required fields. It initializes the wrapper with these options.
   *
   * @param options - Partial options to configure the HTTP response.
   * @returns A new instance of `RawHttpResponseWrapper`.
   *
   * @example
   * ```typescript
   * const responseWrapper = RawHttpResponseWrapper.create({
   *   statusCode: 200,
   *   body: { message: 'Success' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   *
   * const response = responseWrapper.respond();
   * console.log(response); // { statusCode: 200, body: '{"message":"Success"}', headers: { 'Content-Type': 'application/json' } }
   * ```
   */
  static create (options: Partial<RawHttpResponseOptions>): RawHttpResponseWrapper {
    return new this(options)
  }

  /**
   * Constructs an instance of `RawHttpResponseWrapper`.
   *
   * This constructor is private and should not be called directly.
   * Use the `create` method to initialize an instance.
   *
   * @param options - Partial options for configuring the HTTP response.
   */
  private constructor (private readonly options: Partial<RawHttpResponseOptions>) {}

  /**
   * Constructs and returns the raw HTTP response.
   *
   * The `respond` method generates a `RawHttpResponse` object based on the
   * provided options. If any required fields are missing, it assigns default values:
   * - `statusCode`: Defaults to `500`.
   *
   * @returns A `RawHttpResponse` object.
   *
   * @example
   * ```typescript
   * const responseWrapper = RawHttpResponseWrapper.create({ body: 'Hello, world!', statusCode: 200 });
   * const response = responseWrapper.respond();
   * console.log(response); // { statusCode: 500, statusMessage: '', body: 'Hello, world!', headers: undefined }
   * ```
   */
  respond (): RawHttpResponse {
    const headers = new Headers(this.options.headers ?? {})
    const setCookies = this.extractSetCookies(headers)
    headers.delete('set-cookie')

    const response: RawHttpResponse = {
      ...this.options,
      statusCode: this.options.statusCode ?? 500,
      headers: Object.fromEntries(headers)
    }

    // Emit multiple Set-Cookie via `multiValueHeaders` (what API Gateway understands). Folding them
    // into a single comma-joined header is unparseable by browsers and leaks a cookie's attributes
    // into the next.
    if (setCookies.length > 0) {
      response.multiValueHeaders = { ...this.options.multiValueHeaders, 'set-cookie': setCookies }
    }

    return response
  }

  /**
   * Extract all `Set-Cookie` values from a Headers instance, tolerant of runtimes without
   * `getSetCookie()`.
   *
   * @param headers - The response headers.
   * @returns The raw `Set-Cookie` strings.
   */
  private extractSetCookies (headers: Headers): string[] {
    if (typeof headers.getSetCookie === 'function') { return headers.getSetCookie() }
    const raw = headers.get('set-cookie')
    return raw !== null && raw.length > 0 ? [raw] : []
  }
}
