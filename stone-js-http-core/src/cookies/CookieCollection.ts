import { parse } from 'cookie'
import { Cookie } from './Cookie'
import { CookieOptions } from '../declarations'
import { CookieError } from '../errors/CookieError'
import { isCookieValueSerialized, isCookieValueSigned, isSignableCookieSecret, unsignCookieValue } from './utils'

/**
 * Class representing a collection of Cookies.
 */
export class CookieCollection {
  private secret?: string
  private options: CookieOptions
  private readonly cookies: Map<string, Cookie>

  /**
   * Create a CookieCollection.
   *
   * @param cookie - String cookie from header.
   * @param options - Cookies options.
   * @param secret - Secret value to sign and unsign cookies.
   */
  static create (cookie?: string, options: CookieOptions = {}, secret?: string): CookieCollection {
    return new this(cookie, options, secret)
  }

  /**
   * Create a CookieCollection.
   *
   * @param cookie - String cookie from header.
   * @param options - Cookies options.
   * @param secret - Secret value to sign and unsign cookies.
   */
  protected constructor (cookie?: string, options: CookieOptions = {}, secret?: string) {
    this.secret = secret
    this.options = options
    this.cookies = this.parse(cookie)
  }

  /**
   * Add a cookie to the collection.
   *
   * @param name - Cookie name.
   * @param value - Cookie value.
   * @param options - Cookie options.
   */
  add (name: string, value: unknown, options: CookieOptions = {}): this {
    this.cookies.set(name, Cookie.create(name, value, { ...this.options, ...options }))
    return this
  }

  /**
   * Update a cookie in the collection.
   *
   * @param name - Cookie name.
   * @param value - New cookie value.
   * @param options - Cookie options.
   */
  update (name: string, value: unknown, options: CookieOptions = {}): this {
    const cookie = this.cookies.get(name)
    if (cookie !== undefined) {
      this.cookies.set(name, cookie.cloneWith(value, options))
    }
    return this
  }

  /**
   * Get a cookie from the collection.
   *
   * @param name - Cookie name.
   * @returns Cookie value.
   */
  get (name: string): Cookie | undefined

  /**
   * Get a cookie from the collection.
   *
   * @param name - Cookie name.
   * @param fallback - Fallback value if the cookie does not exist.
   * @returns Cookie value.
   */
  get (name: string, fallback: Cookie): Cookie

  /**
   * Get a cookie from the collection.
   *
   * @param name - Cookie name.
   * @param fallback - Fallback value if the cookie does not exist.
   * @returns Cookie value.
   */
  get (name: string, fallback?: Cookie): Cookie | undefined {
    return this.cookies.get(name) ?? fallback
  }

  /**
   * Get a cookie value from the collection.
   *
   * @param name - Cookie name.
   * @returns Cookie value.
   */
  getValue<ValueType = unknown>(name: string): ValueType | undefined

  /**
   * Get a cookie value from the collection.
   *
   * @param name - Cookie name.
   * @param fallback - Fallback value if the cookie does not exist.
   * @returns Cookie value.
   */
  getValue<ValueType = unknown>(name: string, fallback: ValueType): ValueType

  /**
   * Get a cookie value from the collection.
   *
   * @param name - Cookie name.
   * @param fallback - Fallback value if the cookie does not exist.
   * @returns Cookie value.
   */
  getValue<ValueType = unknown>(name: string, fallback?: ValueType): ValueType | undefined {
    return this.cookies.get(name)?.getValue() ?? fallback
  }

  /**
   * Check if the collection has a cookie.
   *
   * @param name - Cookie name.
   */
  has (name: string): boolean {
    return this.cookies.has(name)
  }

  /**
   * Remove a cookie from the collection.
   *
   * @param name - Cookie name to remove.
   * @param options - Cookie options.
   * @param force - If true, remove only from collection without setting expiry.
   */
  remove (name: string, options: CookieOptions = {}, force: boolean = false): this {
    if (force) {
      this.cookies.delete(name)
    } else {
      this.update(name, '', { ...options, maxAge: -1 })
    }
    return this
  }

  /**
   * Get all cookies in the collection.
   *
   * @param serialize - If true, serialize the cookies.
   */
  all<S extends boolean>(serialize: S = false as S): S extends true ? string[] : Record<string, unknown> {
    const values = Array.from(this.cookies.values())
    return (serialize
      ? values.map((v) => v.serialize(this.secret))
      : Object.fromEntries(values.map((v) => [v.name, v.value]))) as S extends true ? string[] : Record<string, unknown>
  }

  /**
   * Check if the collection is empty.
   */
  isEmpty (): boolean {
    return this.cookies.size === 0
  }

  /**
   * Clear all cookies from the collection.
   *
   * @param force - If true, remove only from collection without setting expiry.
   */
  clear (force: boolean = false): this {
    if (force) {
      this.cookies.clear()
    } else {
      this.cookies.forEach((v) => this.update(v.name, '', { expires: new Date(1) }))
    }
    return this
  }

  /**
   * Set secure flag for all cookies in the collection.
   *
   * @param value - Whether the cookies are secure.
   */
  secure (value: boolean = false): this {
    this.cookies.forEach((v) => v.setSecure(value))
    return this
  }

  /**
   * Set secret for signing and unsigning cookies.
   *
   * @param value - Secret value.
   */
  setSecret (value: string): this {
    this.secret = value
    return this
  }

  /**
   * Set options for all cookies in the collection.
   *
   * @param options - Cookie options.
   */
  setOptions (options: CookieOptions): this {
    this.options = options
    this.cookies.forEach((cookie, name) => this.cookies.set(name, cookie.cloneWith(cookie.value, options)))
    return this
  }

  /**
   * Parse the cookies from a string.
   *
   * @param cookie - String cookie from header.
   */
  private parse (cookie?: string): Map<string, Cookie> {
    if (typeof cookie !== 'string') { return new Map() }

    return new Map(
      Object
        .entries(parse(cookie))
        .map(([name, value]) => [name, this.deserializeCookieValue(name, value, this.options, this.secret)])
    )
  }

  /**
   * Deserialize the cookie value.
   *
   * @param name - Cookie name.
   * @param rawValue - Cookie raw value.
   * @param secret - Optional secret for unsigning.
   * @returns A new cookie instance.
   */
  private deserializeCookieValue (name: string, rawValue: unknown, options: CookieOptions, secret?: string): Cookie {
    let value = rawValue

    // Only verify a signature when a strong secret is present; otherwise the signed value is
    // left opaque (never unsigned with a weak/empty key).
    if (isSignableCookieSecret(secret) && isCookieValueSigned(value)) {
      value = unsignCookieValue(value, secret)
      if (value === false) {
        throw new CookieError('Failed to unsign the value.')
      }
    }

    if (isCookieValueSerialized(value)) {
      value = JSON.parse(value.replace('$$j$$:', ''))
    }

    return Cookie.create(name, value, options)
  }
}
