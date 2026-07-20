import { IRawResponseWrapper } from '@stone-js/core'
import { AzureHttpResponseInit, AzureFunctionsHttpRawResponseOptions } from './declarations'

/**
 * Builds an Azure Functions `HttpResponseInit` from the accumulated {@link AzureFunctionsHttpRawResponseOptions}.
 *
 * The handler returns this object and the Functions host writes the wire response. Multiple
 * `Set-Cookie` values are emitted as repeated headers on a `Headers` instance (the only correct
 * way), not folded into one.
 */
export class RawResponseWrapper implements IRawResponseWrapper<AzureHttpResponseInit> {
  /**
   * Factory.
   *
   * @param options - The accumulated response options.
   * @returns A new wrapper.
   */
  static create (options: Partial<AzureFunctionsHttpRawResponseOptions>): RawResponseWrapper {
    return new this(options)
  }

  /**
   * @param options - The accumulated response options.
   */
  private constructor (private readonly options: Partial<AzureFunctionsHttpRawResponseOptions>) {}

  /**
   * Produce the Azure `HttpResponseInit`.
   *
   * @returns The response init.
   */
  respond (): AzureHttpResponseInit {
    const headers = new Headers(this.options.headers ?? {})

    for (const cookie of this.options.cookies ?? []) {
      headers.append('set-cookie', cookie)
    }

    return {
      status: this.options.status ?? 500,
      headers,
      body: this.options.body ?? undefined
    }
  }
}
