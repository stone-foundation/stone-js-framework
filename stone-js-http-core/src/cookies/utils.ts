import { sign, unsign } from 'cookie-signature'
import { CookieError } from '../errors/CookieError'

/**
 * Minimum length required of a cookie-signing secret.
 *
 * Cookie signatures use HMAC-SHA256; a weak or empty secret makes the signature trivially
 * forgeable. 32 characters (~256 bits when random) is the floor for a usable secret. A shorter
 * or empty secret is rejected loudly rather than silently producing a forgeable signature.
 */
export const MIN_COOKIE_SECRET_LENGTH = 32

/**
 * Whether a secret is strong enough to sign/verify cookies.
 *
 * @param secret - The candidate secret.
 * @returns True when the secret is a string of at least {@link MIN_COOKIE_SECRET_LENGTH} chars.
 */
export const isSignableCookieSecret = (secret: unknown): secret is string => {
  return typeof secret === 'string' && secret.length >= MIN_COOKIE_SECRET_LENGTH
}

/**
 * Check if the value is serialized.
 * @param value - The value to check.
 */
export const isCookieValueSerialized = (value: unknown): value is string => {
  return typeof value === 'string' && value.startsWith('$$j$$:')
}

/**
 * Check if the value is signed.
 * @param value - The value to check.
 */
export const isCookieValueSigned = (value: unknown): boolean => {
  return typeof value === 'string' && value.startsWith('$$s$$:')
}

/**
 * Sign the cookie value.
 *
 * @param value - The value to sign.
 * @param secret - Secret for signing (must be strong, see {@link isSignableCookieSecret}).
 * @throws {CookieError} If the value is not a string, is already signed, or the secret is weak/empty.
 */
export const signCookieValue = (value: unknown, secret: string): string => {
  if (typeof value !== 'string') {
    throw new CookieError('Can only sign string value.')
  }

  if (!isSignableCookieSecret(secret)) {
    throw new CookieError(
      `A strong secret of at least ${MIN_COOKIE_SECRET_LENGTH} characters is required to sign cookies. ` +
      'An empty or short secret produces a forgeable signature. Set `stone.http.cookie.secret` (or `stone.secret`).'
    )
  }

  if (isCookieValueSigned(value)) {
    throw new CookieError('Cannot sign a signed value.')
  }

  return `$$s$$:${sign(value, secret)}`
}

/**
 * Unsign the cookie value.
 *
 * @param value - The signed value.
 * @param secret - Secret for unsigning (must be strong, see {@link isSignableCookieSecret}).
 * @throws {CookieError} If the value is not a signed string or the secret is weak/empty.
 */
export const unsignCookieValue = (value: unknown, secret: string): string | false => {
  if (typeof value !== 'string') {
    throw new CookieError('Can only unsign string value.')
  }

  if (!isCookieValueSigned(value)) {
    throw new CookieError('Cannot unsign a non signed value.')
  }

  if (!isSignableCookieSecret(secret)) {
    throw new CookieError(
      `A strong secret of at least ${MIN_COOKIE_SECRET_LENGTH} characters is required to unsign cookies.`
    )
  }

  return unsign(value.replace('$$s$$:', ''), secret)
}
