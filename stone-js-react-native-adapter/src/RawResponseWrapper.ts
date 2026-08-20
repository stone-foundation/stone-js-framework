import { IRawResponseWrapper } from '@stone-js/core'
import { RawReactNativeResponseOptions, ReactNativeResponse } from './declarations'

/**
 * Wraps the raw native response.
 *
 * On every other platform the raw response is something to write back: a status and a
 * body. A native application has nobody to write to, so the effect is a render, and the
 * adapter carries it as a deferred closure the view layer contributes. Running it here,
 * at the very end of the event's life, is what keeps rendering out of the kernel.
 */
export class RawResponseWrapper implements IRawResponseWrapper<ReactNativeResponse> {
  /**
   * Create a raw response wrapper.
   *
   * @param options - The raw response options.
   * @returns A new raw response wrapper.
   */
  static create (options: RawReactNativeResponseOptions): RawResponseWrapper {
    return new this(options)
  }

  /**
   * Create a raw response wrapper.
   *
   * @param options - The raw response options.
   */
  private constructor (private readonly options: RawReactNativeResponseOptions) {}

  /**
   * Execute the deferred render effect, if any, and return its result.
   *
   * @returns The platform response.
   */
  async respond (): Promise<ReactNativeResponse> {
    return this.options?.render?.()
  }
}
