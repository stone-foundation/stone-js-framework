import { serialize } from 'cookie'
import { CookieOptions } from '../declarations'
import { isCookieValueSerialized, isCookieValueSigned, signCookieValue } from './utils'

/**
 * Class representing a Cookie.
 */
export class Cookie {
  readonly name: string
  readonly value: unknown
  readonly options: CookieOptions

  /**
   * Create a Cookie.
   * @param name - Cookie name.
   * @param value - Cookie value.
   * @param options - Cookie options.
   */
  static create (name: string, value: unknown, options: CookieOptions = {}): Cookie {
    return new this(name, value, options)
  }

  /**
   * @param name - Cookie name.
   * @param value - Cookie value.
   * @param options - Cookie options.
   */
  protected constructor (name: string, value: unknown, options: CookieOptions = {}) {
    this.name = name
    this.value = value
    this.options = options
  }

  /**
   * Get the cookie value.
   * @returns The cookie value.
   */
  getValue<ValueType = unknown>(): ValueType {
    return this.value as ValueType
  }

  /**
   * Set expiration date for the cookie.
   * @param value - Expiration date.
   */
  setExpires (value: Date): this {
    this.options.expires = value
    return this
  }

  /**
   * Set secure flag for the cookie.
   * @param value - Whether the cookie is secure.
   */
  setSecure (value: boolean): this {
    this.options.secure = value
    return this
  }

  /**
   * Serialize the cookie value.
   * @param secret - Optional secret for signing.
   */
  serialize (secret?: string): string {
    let value = this.value

    if (!isCookieValueSerialized(value)) {
      value = typeof value === 'object' ? `$$j$$:${JSON.stringify(value)}` : String(value)
    }

    // Sign only when a secret is intended. No secret (undefined/empty) → cookies are left
    // unsigned instead of being signed with a forgeable empty key. A set-but-weak secret makes
    // `signCookieValue` throw loudly rather than silently producing a weak signature.
    if (!isCookieValueSigned(value) && secret !== undefined && secret !== '') {
      value = signCookieValue(value, secret)
    }

    return serialize(this.name, String(value), this.options)
  }

  /**
   * Clone the cookie with new name, value, and options.
   * @param value - New cookie value.
   * @param options - New cookie options.
   * @returns A new cookie instance.
   */
  cloneWith (value: unknown, options: CookieOptions = {}): Cookie {
    return new Cookie(this.name, value, { ...this.options, ...options })
  }
}
