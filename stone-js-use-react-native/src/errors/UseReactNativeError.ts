import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Custom error for the React Native renderer.
 */
export class UseReactNativeError extends RuntimeError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'UseReactNativeError'
  }
}
