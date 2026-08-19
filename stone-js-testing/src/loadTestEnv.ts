import { existsSync } from 'node:fs'
import { config } from 'dotenv'
import { basePath } from '@stone-js/filesystem'

/** The env file a test run loads unless told otherwise. */
export const DEFAULT_TEST_ENV_FILE = '.env.test'

/**
 * Load a test env file into `process.env`, if it exists.
 *
 * Without this, suites set `process.env` by hand in `beforeAll`: order-dependent, spread across
 * files, and easy to get wrong. A file says it once, and says it where anyone can read it.
 *
 * Values already present in the environment win, so `FOO=bar pnpm test` and CI-provided secrets keep
 * overriding the file rather than being silently replaced by it. Parsing is `dotenv`, the same
 * library the CLI loads env files with, so quoting and multi-line values behave identically.
 *
 * @param envFile - The file to load, relative to the project root. Defaults to `.env.test`.
 * @returns The variables the file contributed, empty when there is no such file.
 */
export function loadTestEnv (envFile: string = DEFAULT_TEST_ENV_FILE): Record<string, string> {
  const path = basePath(envFile)

  // A missing `.env.test` is the normal case for a project that does not need one, not a failure.
  if (!existsSync(path)) { return {} }

  return config({ path, override: false, quiet: true }).parsed ?? {}
}
