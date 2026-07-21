import { ConfigSource, EnvSourceOptions } from '../declarations'

/**
 * Reads configuration from environment variables.
 *
 * The zero-config default source. With a `prefix`, only matching variables are kept and the prefix
 * is stripped (`APP_DB_URL` -> `DB_URL`).
 */
export class EnvConfigSource implements ConfigSource {
  readonly name: string = 'env'

  /**
   * Create an environment source.
   *
   * @param options - The source options.
   * @returns A new source.
   */
  static create (options: EnvSourceOptions = {}): EnvConfigSource {
    return new this(options)
  }

  /**
   * @param options - The source options.
   */
  constructor (private readonly options: EnvSourceOptions = {}) {}

  /** @inheritdoc */
  async load (): Promise<Record<string, unknown>> {
    const env = this.options.env ?? process.env
    const prefix = this.options.prefix
    const out: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) { continue }
      if (prefix === undefined) {
        out[key] = value
      } else if (key.startsWith(prefix)) {
        out[key.slice(prefix.length)] = value
      }
    }

    return out
  }
}

/**
 * Build an environment {@link ConfigSource}.
 *
 * @param options - The source options.
 * @returns The source.
 */
export const envSource = (options: EnvSourceOptions = {}): EnvConfigSource => EnvConfigSource.create(options)
