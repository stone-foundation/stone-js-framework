import { IRawResponseWrapper } from '@stone-js/core'
import { FetchRawResponseOptions } from './declarations'

/**
 * Builds a Web `Response` from the accumulated {@link FetchRawResponseOptions}.
 *
 * This is the raw response every WinterCG runtime understands, so the same wrapper works on
 * Cloudflare Workers, Deno, Bun and the Edge runtimes. Multiple `Set-Cookie` values are emitted
 * as repeated headers (the only correct way), not folded into one.
 */
export class RawResponseWrapper implements IRawResponseWrapper<Response> {
  /**
   * Factory.
   *
   * @param options - The accumulated response options.
   * @returns A new wrapper.
   */
  static create (options: Partial<FetchRawResponseOptions>): RawResponseWrapper {
    return new this(options)
  }

  /**
   * @param options - The accumulated response options.
   */
  private constructor (private readonly options: Partial<FetchRawResponseOptions>) {}

  /**
   * Produce the Web `Response`.
   *
   * @returns The response.
   */
  respond (): Response {
    const headers = new Headers(this.options.headers ?? {})

    for (const cookie of this.options.cookies ?? []) {
      headers.append('set-cookie', cookie)
    }

    return new Response(this.options.body ?? null, {
      status: this.options.status ?? 500,
      statusText: this.options.statusText,
      headers
    })
  }
}
