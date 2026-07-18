import { DotenvConfigOptions } from 'dotenv'

/**
 * Configuration options for `dotenv` and `dotenv-expand`.
 */
export interface DotenvOptions extends DotenvConfigOptions {
  /**
   * Expands variables within values in the `.env` file.
   */
  expand?: boolean

  /**
   * Ignores the process environment variables.
   */
  ignoreProcessEnv?: boolean
}

/**
 * Specifies `.env` file paths and options.
 */
export interface DotenvFiles {
  /**
   * Paths to `.env` files.
   */
  path: string | string[]

  /**
   * Whether to use this configuration as the default.
   */
  default?: boolean

  /**
   * Whether to override existing values.
   */
  override?: boolean
}

/**
 * Complete configuration for managing environment variables.
 */
export interface DotenvConfig {

  /**
   * Options for loading and expanding `.env` files.
   */
  options?: DotenvOptions

  /**
   * Configuration for private `.env` files (not included in the bundle).
   */
  private?: DotenvFiles

  /**
   * Configuration for public `.env` files (included in the bundle).
   */
  public?: Record<string, DotenvFiles>
}

/**
 * Default configuration for environment variable management.
 */
export const dotenv: DotenvConfig = {
  options: {
    debug: false,
    expand: true,
    override: false,
    ignoreProcessEnv: false
  }
}
