import { ConfigSource, SecretsSourceOptions } from '../declarations'
import { ConfigSourceError } from '../errors/ConfigSourceError'

/**
 * Reads configuration from an AWS Secrets Manager secret whose value is a JSON object.
 *
 * `@aws-sdk/client-secrets-manager` is imported lazily as an optional peer dependency.
 */
export class SecretsConfigSource implements ConfigSource {
  readonly name: string = 'secrets'

  /**
   * Create a Secrets Manager source.
   *
   * @param options - The source options.
   * @returns A new source.
   */
  static create (options: SecretsSourceOptions): SecretsConfigSource {
    return new this(options)
  }

  /**
   * @param options - The source options.
   */
  constructor (private readonly options: SecretsSourceOptions) {}

  /** @inheritdoc */
  async load (): Promise<Record<string, unknown>> {
    const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager').catch(() => {
      throw new ConfigSourceError('The Secrets Manager config source requires "@aws-sdk/client-secrets-manager". Install it: npm i @aws-sdk/client-secrets-manager')
    })

    const client = this.options.client ?? new SecretsManagerClient(this.options.region !== undefined ? { region: this.options.region } : {})
    const result: any = await (client as any).send(new GetSecretValueCommand({ SecretId: this.options.secretId }))

    if (typeof result.SecretString !== 'string') { return {} }

    try {
      return JSON.parse(result.SecretString)
    } catch (error: any) {
      throw new ConfigSourceError(`Secret "${this.options.secretId}" is not valid JSON.`, { cause: error })
    }
  }
}

/**
 * Build a Secrets Manager {@link ConfigSource}.
 *
 * @param options - The source options.
 * @returns The source.
 */
export const secretsSource = (options: SecretsSourceOptions): SecretsConfigSource => SecretsConfigSource.create(options)
