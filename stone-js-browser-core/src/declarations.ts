/**
 * Http method
 */
export type HttpMethod = 'GET'

/**
 * Represents a route.
 */
export interface IRoute {
  params: Record<string, unknown>
  getParam: <TReturn = unknown>(name: string, fallback?: TReturn) => TReturn | undefined
}

/**
 * Enum representing possible values for the `SameSite` attribute in cookies.
 */
export enum CookieSameSite {
  Lax = 'lax',
  None = 'none',
  Strict = 'strict',
}

/**
 * Options for configuring a cookie.
 */
export interface CookieOptions {
  path?: string
  expires?: Date
  domain?: string
  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: CookieSameSite
}
