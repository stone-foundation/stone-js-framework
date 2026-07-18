import { ErrorOptions } from '@stone-js/core'
import { UnauthorizedError } from '@stone-js/http-core'

/**
 * Bad Credentials Error
 */
export class BadCredentialsError extends UnauthorizedError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'BadCredentialsError'
  }
}
