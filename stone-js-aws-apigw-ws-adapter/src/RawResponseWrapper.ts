import { RawWsResponse } from './declarations'
import { IRawResponseWrapper, RawResponseOptions } from '@stone-js/core'

/**
 * Wraps a Stone.js outgoing response into the raw response API Gateway expects for a WebSocket route
 * (typically `{ statusCode: 200 }`; actual client delivery happens via the management API).
 */
export class RawResponseWrapper implements IRawResponseWrapper<RawWsResponse> {
  /**
   * Create a RawResponseWrapper.
   *
   * @param options - Partial response options.
   * @returns A new instance.
   */
  static create (options: Partial<RawResponseOptions>): RawResponseWrapper {
    return new this(options)
  }

  /**
   * @param options - Partial response options.
   */
  private constructor (private readonly options: Partial<RawResponseOptions>) {}

  /**
   * Build the raw response.
   *
   * @returns The raw response.
   */
  respond (): RawWsResponse {
    return this.options
  }
}
