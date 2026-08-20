import { IRawResponseWrapper } from '@stone-js/core'
import { NativeResponse, RawNativeResponseOptions } from './declarations'

/**
 * Wraps the raw native response: the platform effect is the deferred `render`
 * closure contributed by the response middleware, executed once the kernel has
 * resolved the outgoing response.
 */
export class RawResponseWrapper implements IRawResponseWrapper<NativeResponse> {
  /**
   * Factory method to create an instance of `RawResponseWrapper`.
   *
   * @param options - The raw response options.
   * @returns A new instance of `RawResponseWrapper`.
   */
  static create (options: RawNativeResponseOptions): RawResponseWrapper {
    return new this(options)
  }

  private constructor (private readonly options: RawNativeResponseOptions) {}

  /**
   * Execute the deferred render effect and return its result.
   *
   * @returns The platform response.
   */
  async respond (): Promise<NativeResponse> {
    return await this.options?.render?.()
  }
}
