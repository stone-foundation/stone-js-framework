import { parseConfig, formatOf } from '../utils'
import { ConfigSource, FileSourceOptions } from '../declarations'
import { ConfigSourceError } from '../errors/ConfigSourceError'

/**
 * Reads configuration from a local JSON or YAML file.
 *
 * The format is inferred from the extension (`.yml`/`.yaml` -> YAML, else JSON) unless given. A
 * missing file throws, unless `optional` is set (then it yields `{}`).
 */
export class FileConfigSource implements ConfigSource {
  readonly name: string = 'file'

  /**
   * Create a file source.
   *
   * @param options - The source options.
   * @returns A new source.
   */
  static create (options: FileSourceOptions): FileConfigSource {
    return new this(options)
  }

  /**
   * @param options - The source options.
   */
  constructor (private readonly options: FileSourceOptions) {}

  /** @inheritdoc */
  async load (): Promise<Record<string, unknown>> {
    const { readFile } = await import('node:fs/promises')

    let raw: string
    try {
      raw = await readFile(this.options.path, 'utf-8')
    } catch (error: any) {
      if (this.options.optional === true) { return {} }
      throw new ConfigSourceError(`Cannot read config file "${this.options.path}".`, { cause: error })
    }

    return await parseConfig(raw, this.options.format ?? formatOf(this.options.path))
  }
}

/**
 * Build a file {@link ConfigSource}.
 *
 * @param options - The source options.
 * @returns The source.
 */
export const fileSource = (options: FileSourceOptions): FileConfigSource => FileConfigSource.create(options)
