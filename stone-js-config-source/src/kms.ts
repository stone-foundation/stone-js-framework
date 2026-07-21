import { ConfigTransform, KmsDecryptorOptions } from './declarations'
import { ConfigSourceError } from './errors/ConfigSourceError'

/**
 * Build a value transform that decrypts AWS KMS ciphertext.
 *
 * Pass it as the manager's `transform`: any string value prefixed with `kms:` (configurable) is
 * treated as base64 ciphertext and replaced with its decrypted plaintext; everything else passes
 * through untouched. `@aws-sdk/client-kms` is imported lazily as an optional peer dependency.
 *
 * @param options - The decryptor options.
 * @returns A {@link ConfigTransform}.
 */
export function kmsDecryptor (options: KmsDecryptorOptions = {}): ConfigTransform {
  const prefix = options.prefix ?? 'kms:'
  let resolved: Promise<{ client: any, DecryptCommand: any }> | undefined

  const resolve = async (): Promise<{ client: any, DecryptCommand: any }> => {
    resolved = resolved ?? import('@aws-sdk/client-kms')
      .then(({ KMSClient, DecryptCommand }) => ({
        client: options.client ?? new KMSClient(options.region !== undefined ? { region: options.region } : {}),
        DecryptCommand
      }))
      .catch(() => {
        throw new ConfigSourceError('KMS decryption requires "@aws-sdk/client-kms". Install it: npm i @aws-sdk/client-kms')
      })
    return await resolved
  }

  return async (value: unknown) => {
    if (typeof value !== 'string' || !value.startsWith(prefix)) { return value }
    const { client, DecryptCommand } = await resolve()
    const result: any = await client.send(new DecryptCommand({ CiphertextBlob: Buffer.from(value.slice(prefix.length), 'base64') }))
    return Buffer.from(result.Plaintext).toString('utf-8')
  }
}
