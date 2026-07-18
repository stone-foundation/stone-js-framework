/**
 * Options for retrieving environment variables.
 *
 * @property type - The type of the environment variable. Can be 'number', 'boolean', 'array', 'object', 'json', 'enum', 'email', 'host', 'url', or 'string'.
 * @property format - The format of the environment variable if it's a string. Can be 'url', 'host', or 'email'.
 * @property enums - An array of allowed values for enum types.
 * @property optional - Whether the environment variable is optional.
 * @property default - The default value if the environment variable is not set.
 * @property separator - The separator for parsing array or object values (default is ',').
 * @property tld - Whether a top-level domain is required for URLs or emails.
 * @property protocol - Whether a protocol is required for URLs.
 */
export interface Options {
  type?: 'number' | 'boolean' | 'array' | 'object' | 'json' | 'enum' | 'email' | 'host' | 'url' | 'string'
  format?: 'url' | 'host' | 'email'
  enums?: string[]
  optional?: boolean
  default?: any
  separator?: string
  tld?: boolean
  protocol?: boolean
}
