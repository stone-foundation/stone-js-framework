import { pathToFileURL } from 'node:url'
import { appModuleFiles, DEFAULT_APP_MODULES_PATTERN } from '@stone-js/filesystem'

/**
 * Set by `stone test`, which resolves the app's files from `stone.config.mjs` and hands the answer to
 * the test process. Honouring it is what makes one config file enough: run through the CLI and a suite
 * discovers exactly what the build builds; run bare `vitest` and the default below still applies.
 */
export const APP_MODULES_PATTERN_ENV = 'STONE_APP_MODULES_PATTERN'

/**
 * Options for {@link discoverAppModules}.
 */
export interface DiscoverModulesOptions {
  /** The application directory to scan. Defaults to `app`. */
  appDir?: string
  /** The glob to match, overriding `appDir` entirely. */
  pattern?: string
}

/**
 * Drop trailing slashes from a directory.
 *
 * Written as a scan rather than a regular expression: `/\/+$/` is super-linear on a long run of
 * slashes, and a pattern that can be defeated by its own input has no business in a path helper.
 *
 * @param dir - The directory.
 * @returns The directory without its trailing slashes.
 */
function withoutTrailingSlash (dir: string): string {
  let end = dir.length
  while (end > 0 && dir[end - 1] === '/') { end-- }
  return dir.slice(0, end)
}

/**
 * Find every module an application exports.
 *
 * This is what production does, expressed for a test runner. A built app imports one bundle of all
 * its source files and boots `Object.values(bundle)`; a test has no bundler, so the same files are
 * imported directly and their exports collected the same way. Same files, same modules, same order.
 *
 * Which files count is decided by `@stone-js/filesystem`, the definition the CLI uses too, so a test
 * suite cannot end up booting a different application than the one that ships.
 *
 * @param options - Where to look.
 * @returns Every exported value, in file order.
 */
export async function discoverAppModules (options: DiscoverModulesOptions = {}): Promise<unknown[]> {
  // Explicit before ambient: a test that names its own directory means it, and an env variable set
  // for the whole run must not quietly redirect it.
  const pattern = options.pattern ??
    (options.appDir !== undefined
      ? `${withoutTrailingSlash(options.appDir)}/**/*.{ts,tsx,js,jsx,mjsx}`
      : process.env[APP_MODULES_PATTERN_ENV] ?? DEFAULT_APP_MODULES_PATTERN)
  const files = appModuleFiles({ pattern })
  const modules: unknown[] = []

  for (const file of files) {
    // A file URL, not a path: on Windows an absolute path is not a valid import specifier.
    const imported = await import(pathToFileURL(file).href) as Record<string, unknown>
    modules.push(...Object.values(imported).filter((module) => module !== undefined))
  }

  return modules
}

/** The default pattern, re-exported so a caller can narrow it rather than restate it. */
export { DEFAULT_APP_MODULES_PATTERN }
