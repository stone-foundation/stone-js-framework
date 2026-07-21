import { RawWsResponse } from './declarations'
import { IRawResponseWrapper, RawResponseOptions } from '@stone-js/core'

/**
 * Wraps a Stone.js outgoing response into a raw WebSocket frame.
 *
 * The adapter sends the returned object back to the originating socket as JSON when it carries
 * content, so a message handler can reply to the client that sent the frame.
 */
export class RawResponseWrapper implements IRawResponseWrapper<RawWsResponse> {
  /**
   * Create a RawResponseWrapper.
   *
   * @param options - Partial options for configuring the raw response.
   * @returns A new instance.
   */
  static create (options: Partial<RawResponseOptions>): RawResponseWrapper {
    return new this(options)
  }

  /**
   * @param options - Partial options for configuring the raw response.
   */
  private constructor (private readonly options: Partial<RawResponseOptions>) {}

  /**
   * Build and return the raw WebSocket response.
   *
   * @returns The raw response frame.
   */
  respond (): RawWsResponse {
    return this.options
  }
}
