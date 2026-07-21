import { parseConfig, formatOf } from '../utils'
import { ConfigSource, HttpSourceOptions } from '../declarations'
import { ConfigSourceError } from '../errors/ConfigSourceError'

/**
 * Reads configuration from an HTTP endpoint (a GitHub raw file, a gist, any URL).
 *
 * Uses the global `fetch` (override via `options.fetch`). JSON by default; `.yml`/`.yaml` URLs are
 * parsed as YAML. Pass `headers` for a private source (e.g. an authorization token).
 */
export class HttpConfigSource implements ConfigSource {
  readonly name: string = 'http'

  /**
   * Create an HTTP source.
   *
   * @param options - The source options.
   * @returns A new source.
   */
  static create (options: HttpSourceOptions): HttpConfigSource {
    return new this(options)
  }

  /**
   * @param options - The source options.
   */
  constructor (private readonly options: HttpSourceOptions) {}

  /** @inheritdoc */
  async load (): Promise<Record<string, unknown>> {
    const fetchFn = this.options.fetch ?? globalThis.fetch
    if (typeof fetchFn !== 'function') {
      throw new ConfigSourceError('No fetch implementation available for the HTTP config source.')
    }

    const response = await fetchFn(this.options.url, { headers: this.options.headers })
    if (!response.ok) {
      throw new ConfigSourceError(`HTTP config source failed: ${response.status} ${this.options.url}.`)
    }

    return await parseConfig(await response.text(), this.options.format ?? formatOf(this.options.url))
  }
}

/**
 * Build an HTTP {@link ConfigSource}.
 *
 * @param options - The source options.
 * @returns The source.
 */
export const httpSource = (options: HttpSourceOptions): HttpConfigSource => HttpConfigSource.create(options)
