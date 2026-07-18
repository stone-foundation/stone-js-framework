import { parse } from 'cookie'
import { Cookie } from './Cookie'
import { CookieOptions } from '../declarations'

/**
 * Class representing a collection of Cookies.
 */
export class CookieCollection {
  private options: CookieOptions
  private readonly domDocument?: Document
  private readonly cookies: Map<string, Cookie>

  /**
   * Create a CookieCollection.
   *
   * @param cookie - String cookie from header.
   * @param options - Cookies options.
   */
  static create (cookie?: string, options: CookieOptions = {}, domDocument?: Document): CookieCollection {
    return new this(cookie, options, domDocument)
  }

  /**
   * Create a CookieCollection.
   *
   * @param cookie - String cookie from header.
   * @param options - Cookies options.
   */
  protected constructor (cookie?: string, options: CookieOptions = {}, domDocument?: Document) {
    this.options = options
    this.domDocument = domDocument
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
    const cookie = Cookie.create(name, value, { ...this.options, ...options })
    this.saveCookie(cookie)
    this.cookies.set(name, cookie)
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
    const currentCookie = this.cookies.get(name)
    if (currentCookie !== undefined) {
      const cookie = currentCookie.cloneWith(value, options)
      this.saveCookie(cookie)
      this.cookies.set(name, cookie)
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
   */
  remove (name: string, options: CookieOptions = {}): this {
    const currentCookie = this.cookies.get(name)
    if (currentCookie !== undefined) {
      this.cookies.delete(name)
      this.saveCookie(currentCookie.cloneWith('', { ...options, maxAge: -1 }))
    }
    return this
  }

  /**
   * Get all cookies in the collection.
   */
  all (): Cookie[] {
    return Array.from(this.cookies.values())
  }

  /**
   * Check if the collection is empty.
   */
  isEmpty (): boolean {
    return this.cookies.size === 0
  }

  /**
   * Clear all cookies from the collection.
   */
  clear (): this {
    this.cookies.clear()
    return this
  }

  /**
   * Set secure flag for all cookies in the collection.
   *
   * @param value - Whether the cookies are secure.
   */
  secure (value: boolean = true): this {
    // Default to enabling Secure: `collection.secure()` should mark cookies secure, not clear it.
    this.cookies.forEach((v) => this.saveCookie(v.setSecure(value)))
    return this
  }

  /**
   * Set options for all cookies in the collection.
   *
   * @param options - Cookie options.
   */
  setOptions (options: CookieOptions): this {
    this.options = options
    this.cookies.forEach((currentCookie, name) => {
      const cookie = currentCookie.cloneWith(currentCookie.value, options)
      this.saveCookie(cookie)
      this.cookies.set(name, cookie)
    })
    return this
  }

  /**
   * Parse the cookies from a string.
   *
   * @param cookie - String cookie from header.
   */
  private parse (cookie?: string): Map<string, Cookie> {
    if (typeof cookie !== 'string') {
      if (this.domDocument !== undefined) {
        cookie = this.domDocument.cookie
      } else {
        return new Map()
      }
    }

    return new Map(
      Object
        .entries(parse(cookie))
        .map(([name, value]) => [name, Cookie.create(name, value, this.options)])
    )
  }

  /**
   * Save a cookie to the document.
   *
   * @param cookie - Cookie to save.
   * @returns The collection instance.
   */
  private saveCookie (cookie: Cookie): this {
    if (this.domDocument !== undefined) {
      this.domDocument.cookie = cookie.serialize()
    }
    return this
  }
}
