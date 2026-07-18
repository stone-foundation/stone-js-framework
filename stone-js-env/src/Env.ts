import { EnvError } from './EnvError'
import { Options } from './declarations'
import { email, safeParse, string, pipe, number, ip, url } from 'valibot'

/**
 * Env module to manage environment variables.
 */
let envCache: Record<string, any> = {}

/**
 * Get the specified env variable value.
 *
 * @param key - The environment variable key.
 * @returns The value of the environment variable.
 */
export function get<T> (key: string): T | undefined

/**
 * Get the specified env variable value.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value of the environment variable.
 */
export function get<T> (key: string, options: Options | any): T

/**
 * Get the specified env variable value.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value of the environment variable.
 */
export function get<T> (key: string, options?: Options | any): T | undefined {
  if (options === undefined) return getString(key) as T
  if (typeof options === 'function') return custom(key, options)

  const typeHandlers: Record<string, (key: string, options?: Options) => any> = {
    number: getNumber,
    boolean: getBoolean,
    array: getArray,
    object: getObject,
    json: getJson,
    email: getEmail,
    host: getHost,
    url: getUrl,
    string: getString
  }

  return (typeHandlers[options.type] ?? getString)(key, options)
}

/**
 * Get the specified env variable value as a string.
 *
 * @param key - The environment variable key.
 * @returns The value as a string.
 */
export function getString (key: string): string | undefined

/**
 * Get the specified env variable value as a string.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a string.
 */
export function getString (key: string, options: Options | string): string

/**
 * Get the specified env variable value as a string.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a string.
 */
export function getString (key: string, options?: Options | string): string | undefined {
  return custom(
    key,
    (key, value, opts) => {
      switch (opts.format) {
        case 'url':
          return getUrl(key, opts)
        case 'host':
          return getHost(key, opts)
        case 'email':
          return getEmail(key, opts)
        default:
          return value !== undefined ? String(value) : opts.default
      }
    },
    options
  )
}

/**
 * Get the specified env variable value as a number.
 *
 * @param key - The environment variable key.
 * @returns The value as a number.
 */
export function getNumber (key: string): number | undefined

/**
 * Get the specified env variable value as a number.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a number.
 */
export function getNumber (key: string, options: Options | number): number

/**
 * Get the specified env variable value as a number.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a number.
 */
export function getNumber (key: string, options?: Options | number): number | undefined {
  return custom(
    key,
    (key: string, value: string | undefined, opts) => {
      // Absent/empty: return the provided default (as a number) or undefined — never a
      // silent 0 from Number(null)/Number('').
      if (value === undefined || value === '') {
        return opts.default === null || opts.default === undefined ? undefined : Number(opts.default)
      }

      const result = safeParse(pipe(number()), Number(value))

      if (!result.success) {
        throw new EnvError(`Value for ${key} must be a valid number, received: ${maskValue(value)}`)
      }

      return Number(value)
    },
    options
  )
}

/**
 * Get the specified env variable value as a boolean.
 *
 * @param key - The environment variable key.
 * @returns The value as a boolean.
 */
export function getBoolean (key: string): boolean | undefined

/**
 * Get the specified env variable value as a boolean.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a boolean.
 */
export function getBoolean (key: string, options: Options | boolean): boolean

/**
 * Get the specified env variable value as a boolean.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a boolean.
 */
export function getBoolean (key: string, options?: Options | boolean): boolean | undefined {
  return custom(
    key,
    (key: string, value: string | undefined, opts) => {
      // Absent: honor the provided default instead of silently returning false.
      if (value === undefined) {
        return opts.default === null || opts.default === undefined ? undefined : Boolean(opts.default)
      }

      if (!['true', 'false', '1', '0'].includes(String(value).toLowerCase())) {
        throw new EnvError(`Value for ${key} must be a valid boolean, received: ${maskValue(value)}`)
      }

      return ['true', '1'].includes(String(value).toLowerCase())
    },
    options
  )
}

/**
 * Get the specified env variable value as an array.
 *
 * @param key - The environment variable key.
 * @returns The value as an array of strings.
 */
export function getArray (key: string): string[] | undefined

/**
 * Get the specified env variable value as an array.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as an array of strings.
 */
export function getArray (key: string, options: Options | string[]): string[]

/**
 * Get the specified env variable value as an array.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as an array of strings.
 */
export function getArray (key: string, options?: Options | string[]): string[] | undefined {
  return custom(
    key,
    (_key, value, opts) => {
      const output = value !== undefined
        ? value
          .split(opts.separator ?? ',')
          .map((v: string) => v.trim())
        : undefined

      return output ?? opts.default
    },
    options
  )
}

/**
 * Get the specified env variable value as an object.
 *
 * @param key - The environment variable key.
 * @returns The value as an object.
 */
export function getObject (key: string): Record<string, any> | undefined

/**
 * Get the specified env variable value as an object.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as an object.
 */
export function getObject (key: string, options: Options | Record<string, any>): Record<string, any> | undefined

/**
 * Get the specified env variable value as an object.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as an object.
 */
export function getObject (key: string, options?: Options | Record<string, any>): Record<string, any> | undefined {
  return custom(
    key,
    (_key, value, opts) => {
      const output = value !== undefined
        ? Object.fromEntries(
          value.split(opts.separator ?? ',').map((v: string) => {
            const [k, w] = v.split(':').map((w: string) => w.trim())
            let parsedValue: string | number | boolean = w
            const schema = pipe(number())
            const result = safeParse(schema, Number(w))

            if (w !== undefined && result.success) parsedValue = Number(w)
            if (['true', 'false', '1', '0'].includes(w.toLowerCase())) parsedValue = ['true', '1'].includes(w.toLowerCase())
            return [k, parsedValue]
          })
        )
        : undefined

      return output ?? opts.default
    },
    options
  )
}

/**
 * Get the specified env variable value as JSON.
 *
 * @param key - The environment variable key.
 * @returns The value as a JSON object.
 */
export function getJson<R = unknown> (key: string): R

/**
 * Get the specified env variable value as JSON.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a JSON object.
 */
export function getJson<R = unknown> (key: string, options: Options | R): R

/**
 * Get the specified env variable value as JSON.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a JSON object.
 */
export function getJson<R = unknown | undefined> (key: string, options?: Options | R): R {
  return custom(
    key,
    (key, value, opts) => {
      try {
        return value === undefined ? opts.default : JSON.parse(value)
      } catch (e: any) {
        if (opts.optional === false) {
          throw new EnvError(`Value for ${key} must be valid JSON. Error: ${e.message as string}`)
        }
        return opts.default
      }
    },
    options
  )
}

/**
 * Get the specified env variable value as an enum.
 *
 * @param key - The environment variable key.
 * @param enums - Array of possible enum values or options.
 * @returns The value as an enum.
 */
export function getEnum (key: string, enums: string[] | Options): string | undefined

/**
 * Get the specified env variable value as an enum.
 *
 * @param key - The environment variable key.
 * @param enums - Array of possible enum values or options.
 * @param defaultValue - Default value if not set.
 * @param options - Options for retrieving the value.
 * @returns The value as an enum.
 */
export function getEnum (key: string, enums: string[] | Options, defaultValue: string, options?: Options): string

/**
 * Get the specified env variable value as an enum.
 *
 * @param key - The environment variable key.
 * @param enums - Array of possible enum values or options.
 * @param defaultValue - Default value if not set.
 * @param options - Options for retrieving the value.
 * @returns The value as an enum.
 */
export function getEnum (key: string, enums: string[] | Options = [], defaultValue?: string, options?: Options): string | undefined {
  options = options ?? {}

  if (Array.isArray(enums)) {
    options.enums = enums
    options.default = defaultValue
    options.optional = defaultValue !== undefined
  } else if (typeof enums === 'object') {
    options = enums
  }

  options.enums ??= []

  return custom(
    key,
    (key, value: string | undefined, opts) => {
      if (opts.optional === false && (value === undefined || opts.enums === undefined || !(opts.enums?.includes(value)))) {
        throw new EnvError(`Value for ${key} must be one of: ${String(opts.enums)}. Received: ${maskValue(value)}`)
      }

      return value ?? opts.default
    },
    options
  )
}

/**
 * Get the specified env variable value as an email.
 *
 * @param key - The environment variable key.
 * @returns The value as an email.
 */
export function getEmail (key: string): string | undefined

/**
 * Get the specified env variable value as an email.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as an email.
 */
export function getEmail (key: string, options: Options | string): string

/**
 * Get the specified env variable value as an email.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as an email.
 */
export function getEmail (key: string, options?: Options | string): string | undefined {
  return custom(
    key,
    (key, value: string | undefined, opts) => {
      const schema = pipe(string(), email())
      const result = safeParse(schema, value)

      if (value !== undefined && !result.success) {
        throw new EnvError(`Value for ${key} must be a valid email address. Received: ${maskValue(value)}`)
      }

      return value !== undefined ? String(value) : opts.default
    },
    options
  )
}

/**
 * Get the specified env variable value as a URL.
 *
 * @param key - The environment variable key.
 * @returns The value as a URL.
 */
export function getUrl (key: string): string | undefined

/**
 * Get the specified env variable value as a URL.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a URL.
 */
export function getUrl (key: string, options: Options | string): string

/**
 * Get the specified env variable value as a URL.
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a URL.
 */
export function getUrl (key: string, options?: Options | string): string | undefined {
  return custom(
    key,
    (key, value: string | undefined, opts) => {
      const schema = pipe(string(), url())
      const result = safeParse(schema, value)

      if (value !== undefined && !result.success) {
        throw new EnvError(`Value for ${key} must be a valid URL. Received: ${maskValue(value)}`)
      }

      return value !== undefined ? String(value) : opts.default
    },
    options
  )
}

/**
 * Get the specified env variable value as a host (IP or URL).
 *
 * @param key - The environment variable key.
 * @returns The value as a host.
 */
export function getHost (key: string): string | undefined

/**
 * Get the specified env variable value as a host (IP or URL).
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a host.
 */
export function getHost (key: string, options: Options | string): string

/**
 * Get the specified env variable value as a host (IP or URL).
 *
 * @param key - The environment variable key.
 * @param options - Options for retrieving the value.
 * @returns The value as a host.
 */
export function getHost (key: string, options?: Options | string): string | undefined {
  return custom(
    key,
    (key, value: string | undefined, opts) => {
      const schemaIp = pipe(string(), ip())
      const schemaUrl = pipe(string(), url())
      const resultIp = safeParse(schemaIp, value)
      const resultUrl = safeParse(schemaUrl, value)

      if (value !== undefined && !resultIp.success && !resultUrl.success) {
        throw new EnvError(`Value for ${key} must be a valid host (URL or IP). Received: ${maskValue(value)}`)
      }

      return value !== undefined ? String(value) : opts.default
    },
    options
  )
}

/**
 * Get the specified env variable value with custom validator.
 *
 * @param key - The environment variable key.
 * @param validator - The custom validation function.
 * @param options - Options for retrieving the value.
 * @returns The validated value of the environment variable.
 */
export function custom<T = any> (key: string, validator: (key: string, value: string | undefined, options: Options) => T, options?: Options | T): T {
  // Cache per (key, accessor-type): the validator source is stable per accessor, so
  // get('PORT') (string) and getNumber('PORT') (number) never share a cache entry.
  const cacheKey = `${key} ${validator.toString()}`
  const cachedValue = envCache[cacheKey]

  if (cachedValue !== undefined) {
    return cachedValue
  }

  const value = getEnv(key)

  options = normalizeOptions(options)

  if (options.optional === false && isEmpty(value)) {
    throw new EnvError(`Value for ${key} is required.`)
  }

  const validatedValue = validator(key, value, options)

  if (validatedValue !== undefined) {
    envCache[cacheKey] = validatedValue
  }

  return validatedValue
}

/**
 * Redact a value for safe inclusion in error messages. Secrets (connection strings,
 * tokens, passwords) must never appear verbatim in logs/error reports.
 *
 * @param value - The raw value.
 * @returns A masked representation exposing only a short hint and the length.
 */
function maskValue (value: string | undefined): string {
  /* v8 ignore next 2 -- defensive: custom() rejects absent values with a "required" error before maskValue runs, so at runtime `value` is always a present, non-empty string. */
  const str = value ?? ''
  if (str.length === 0) { return '<empty>' }
  if (str.length <= 2) { return '**' }
  return `${str.slice(0, 1)}***(${str.length} chars)`
}

/**
 * Get system env variables.
 * For Node.js environment get variables from process.env at runtime.
 * For Browser environment get variables from .env at buildtime.
 *
 * @param key - The environment variable key.
 * @returns The value of the environment variable.
 */
export function getEnv (key: string): string | undefined {
  return isBrowser() ? window.process?.env?.[key] : process.env[key]
}

/**
 * Determine if the current environment matches the given value.
 *
 * @param env - The environment to check.
 * @returns True if the current environment matches the given value, otherwise false.
 */
export function is (env: string): boolean {
  return getEnv('NODE_ENV') === env
}

/**
 * Determine if the current environment is production.
 *
 * @returns True if in a production environment, otherwise false.
 */
export function isProduction (): boolean {
  return is('production') || is('prod')
}

/**
 * Determine if the current environment is not production.
 *
 * @returns True if not in a production environment, otherwise false.
 */
export function isNotProduction (): boolean {
  return !isProduction()
}

/**
 * Determine if the current environment is prod.
 *
 * @returns True if in a prod environment, otherwise false.
 */
export function isProd (): boolean {
  return isProduction()
}

/**
 * Determine if the current environment is not prod.
 *
 * @returns True if not in a prod environment, otherwise false.
 */
export function isNotProd (): boolean {
  return isNotProduction()
}

/**
 * Determine if the current environment is testing.
 *
 * @returns True if in a testing environment, otherwise false.
 */
export function isTesting (): boolean {
  return is('test') || is('testing')
}

/**
 * Clear the environment variable cache.
 *
 * @returns The Env class.
 */
export function clearCache (): void {
  envCache = {}
}

/**
 * Determine if the current environment is a browser.
 *
 * @returns True if in a browser environment, otherwise false.
 */
function isBrowser (): boolean {
  return typeof window === 'object'
}

/**
 * Normalize options.
 *
 * @param options - The options to normalize.
 * @returns The normalized options.
 */
function normalizeOptions (options?: Options | any): Options {
  // Never mutate the caller's object: build a fresh, normalized copy.
  const base = (options === undefined || Array.isArray(options) || typeof options !== 'object')
    ? { default: options }
    : { ...options }

  return {
    ...base,
    optional: base.optional ?? base.default !== undefined,
    default: base.default ?? null
  }
}

/**
 * Check if a value is empty.
 *
 * @param value - The value to check.
 * @returns True if the value is empty, otherwise false.
 */
function isEmpty<T> (value: any): value is T {
  if (value === undefined || value === null) return true
  // if (Array.isArray(value) && value.length === 0) return true
  // if (typeof value === 'object' && Object.keys(value).length === 0) return true
  if (typeof value === 'string' && value.trim().length === 0) return true

  return false
}
