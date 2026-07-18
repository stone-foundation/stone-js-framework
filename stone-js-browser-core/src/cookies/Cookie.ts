import { serialize } from 'cookie'
import { CookieOptions } from '../declarations'

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
    this.options = options
    this.value = this.deserialize(value)
  }

  /**
   * Deserialize a stored cookie value, tolerating malformed JSON.
   *
   * A `$$j$$:` value that is not valid JSON (posted by a subdomain, an old app version, or a
   * hand-crafted cookie) MUST NOT throw: `document.cookie` is shared and unprotected, so an
   * unguarded `JSON.parse` here crashed the construction of every IncomingBrowserEvent — killing
   * the whole SPA on every navigation. On failure the raw value is kept as-is.
   *
   * @param value - The raw cookie value.
   * @returns The deserialized value (or the raw value if it is not/!valid serialized JSON).
   */
  private deserialize (value: unknown): unknown {
    if (!this.isValueSerialized(value)) { return value }
    try {
      return JSON.parse(value.replace('$$j$$:', ''))
    } catch {
      return value
    }
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
   */
  serialize (): string {
    let value = this.value

    if (!this.isValueSerialized(value)) {
      value = typeof value === 'object' ? `$$j$$:${JSON.stringify(value)}` : String(value)
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

  /**
   * Check if the value is serialized.
   * @param value - The value to check.
   */
  private isValueSerialized (value: unknown): value is string {
    return typeof value === 'string' && value.startsWith('$$j$$:')
  }
}
