import { IRawResponseWrapper } from '@stone-js/core'
import { AlibabaFcHttpResponse, AlibabaFcHttpRawResponseOptions } from './declarations'

/**
 * Writes the accumulated {@link AlibabaFcHttpRawResponseOptions} onto the FC response.
 *
 * Unlike a Web `Response`, the FC response is imperative: set the status and every header, then
 * `send()` the body once. Multiple `Set-Cookie` values are passed as an array (FC emits them as
 * repeated headers), never folded into one.
 */
export class RawResponseWrapper implements IRawResponseWrapper<AlibabaFcHttpResponse> {
  /**
   * Factory.
   *
   * @param response - The imperative FC response object.
   * @param options - The accumulated response options.
   * @returns A new wrapper.
   */
  static create (response: AlibabaFcHttpResponse, options: Partial<AlibabaFcHttpRawResponseOptions>): RawResponseWrapper {
    return new this(response, options)
  }

  /**
   * @param response - The imperative FC response object.
   * @param options - The accumulated response options.
   */
  private constructor (
    private readonly response: AlibabaFcHttpResponse,
    private readonly options: Partial<AlibabaFcHttpRawResponseOptions>
  ) {}

  /**
   * Write the response onto the FC `resp` and send it.
   *
   * @returns The FC response object.
   */
  respond (): AlibabaFcHttpResponse {
    const resp = this.response

    resp.setStatusCode(this.options.status ?? 500)

    for (const [key, value] of Object.entries(this.options.headers ?? {})) {
      if (key.toLowerCase() !== 'set-cookie') { resp.setHeader(key, value) }
    }

    const cookies = this.options.cookies ?? []
    if (cookies.length === 1) {
      resp.setHeader('Set-Cookie', cookies[0])
    } else if (cookies.length > 1) {
      resp.setHeader('Set-Cookie', cookies)
    }

    resp.send(this.normalizeBody(this.options.body))

    return resp
  }

  /**
   * Coerces the prepared body into what FC's `send()` accepts (string or Buffer).
   *
   * @param body - The prepared response body.
   * @returns A string/Buffer body, or `undefined` when there is none.
   */
  private normalizeBody (body: unknown): string | Buffer | undefined {
    if (body === undefined || body === null) { return undefined }
    if (typeof body === 'string' || Buffer.isBuffer(body)) { return body }
    if (body instanceof Uint8Array) { return Buffer.from(body) }
    if (body instanceof ArrayBuffer) { return Buffer.from(new Uint8Array(body)) }
    return String(body)
  }
}
