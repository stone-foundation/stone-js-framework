import { setPath } from '../utils'
import { ConfigSource, SsmSourceOptions } from '../declarations'
import { ConfigSourceError } from '../errors/ConfigSourceError'

/**
 * Reads configuration from AWS SSM Parameter Store, recursively under a path.
 *
 * Parameter names are turned into a nested object relative to the path (`/app/db/url` under
 * `/app/` -> `{ db: { url } }`). `SecureString` parameters are decrypted by default.
 * `@aws-sdk/client-ssm` is imported lazily as an optional peer dependency.
 */
export class SsmConfigSource implements ConfigSource {
  readonly name: string = 'ssm'

  private readonly base: string

  /**
   * Create an SSM source.
   *
   * @param options - The source options.
   * @returns A new source.
   */
  static create (options: SsmSourceOptions): SsmConfigSource {
    return new this(options)
  }

  /**
   * @param options - The source options.
   */
  constructor (private readonly options: SsmSourceOptions) {
    this.base = options.path.replace(/\/+$/, '')
  }

  /** @inheritdoc */
  async load (): Promise<Record<string, unknown>> {
    const { SSMClient, GetParametersByPathCommand } = await import('@aws-sdk/client-ssm').catch(() => {
      throw new ConfigSourceError('The SSM config source requires "@aws-sdk/client-ssm". Install it: npm i @aws-sdk/client-ssm')
    })

    const client = this.options.client ?? new SSMClient(this.options.region !== undefined ? { region: this.options.region } : {})
    const out: Record<string, unknown> = {}
    let nextToken: string | undefined

    do {
      const result: any = await (client as any).send(new GetParametersByPathCommand({
        Path: this.options.path,
        Recursive: true,
        WithDecryption: this.options.withDecryption ?? true,
        NextToken: nextToken
      }))

      for (const parameter of result.Parameters ?? []) {
        const relative = String(parameter.Name).slice(this.base.length).replace(/^\/+/, '')
        setPath(out, relative.split('/'), parameter.Value)
      }

      nextToken = result.NextToken
    } while (nextToken !== undefined)

    return out
  }
}

/**
 * Build an SSM {@link ConfigSource}.
 *
 * @param options - The source options.
 * @returns The source.
 */
export const ssmSource = (options: SsmSourceOptions): SsmConfigSource => SsmConfigSource.create(options)
