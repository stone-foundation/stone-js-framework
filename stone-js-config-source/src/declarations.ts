/**
 * A configuration source: loads a plain config object from a provider (env, a file, AWS SSM,
 * Secrets Manager, an HTTP endpoint...). Sources are merged by the {@link ConfigSourceManager} and
 * written into the blueprint before the app boots.
 */
export interface ConfigSource {
  /** A human-readable name (e.g. `env`, `file`, `ssm`). */
  readonly name: string
  /** Load the source's configuration. */
  load: () => Promise<Record<string, unknown>>
}

/**
 * A per-leaf value transform, applied to every loaded value (e.g. KMS decryption).
 *
 * @param value - The loaded value.
 * @param key - The dotted key path of the value.
 * @returns The transformed value.
 */
export type ConfigTransform = (value: unknown, key: string) => unknown | Promise<unknown>

/** The supported config file formats. */
export type ConfigFileFormat = 'json' | 'yaml'

/**
 * Options for the environment source.
 */
export interface EnvSourceOptions {
  /** Only include keys with this prefix (the prefix is stripped from the resulting keys). */
  prefix?: string
  /** The environment object to read (defaults to `process.env`). */
  env?: Record<string, string | undefined>
}

/**
 * Options for the file source.
 */
export interface FileSourceOptions {
  /** The file path to read. */
  path: string
  /** The format (inferred from the extension when omitted). */
  format?: ConfigFileFormat
  /** Whether a missing file is tolerated (returns `{}`) instead of throwing. */
  optional?: boolean
}

/**
 * Options for the AWS SSM Parameter Store source.
 */
export interface SsmSourceOptions {
  /** The parameter path/prefix to fetch recursively (e.g. `/my-app/`). */
  path: string
  /** Whether to decrypt SecureString parameters (defaults to true). */
  withDecryption?: boolean
  /** The AWS region (passed to the client when none is provided). */
  region?: string
  /** An existing `SSMClient` to reuse. */
  client?: unknown
}

/**
 * Options for the AWS Secrets Manager source.
 */
export interface SecretsSourceOptions {
  /** The secret id (name or ARN). Its JSON value becomes the config object. */
  secretId: string
  /** The AWS region (passed to the client when none is provided). */
  region?: string
  /** An existing `SecretsManagerClient` to reuse. */
  client?: unknown
}

/**
 * Options for the HTTP source (covers GitHub raw files, gists, any URL).
 */
export interface HttpSourceOptions {
  /** The URL to fetch. */
  url: string
  /** The format (inferred from the URL extension when omitted, defaults to json). */
  format?: ConfigFileFormat
  /** Request headers (e.g. an authorization token for a private repo). */
  headers?: Record<string, string>
  /** A `fetch` implementation to use (defaults to the global one). */
  fetch?: typeof fetch
}

/**
 * Options for the KMS decryptor transform.
 */
export interface KmsDecryptorOptions {
  /** The AWS region (passed to the client when none is provided). */
  region?: string
  /** An existing `KMSClient` to reuse. */
  client?: unknown
  /** The prefix marking a ciphertext string (defaults to `kms:`). */
  prefix?: string
}
