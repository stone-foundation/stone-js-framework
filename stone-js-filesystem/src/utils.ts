import { tmpdir } from 'node:os'
import { globSync } from 'glob'
import process from 'node:process'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, isAbsolute, join } from 'node:path'

/**
 * Constructs a base path by joining the current working directory with the provided paths.
 *
 * @param paths - The paths to be joined with the current working directory.
 * @returns The resulting path after joining the current working directory with the provided paths.
 */
export function basePath (...paths: string[]): string {
  return join(process.cwd(), ...paths)
}

/**
 * Resolve path from file directory.
 *
 * @param   {...string} paths
 * @returns {string}
 */
export function dirPath (...paths: string[]): string {
  return join(dirname(fileURLToPath(import.meta.url)), ...paths)
}

/**
 * Resolve path from system tmp directory.
 *
 * @param   {...string} paths
 * @returns {string}
 */
export function tmpPath (...paths: string[]): string {
  return join(tmpdir(), ...paths)
}

/**
 * Builds a path by appending the provided paths to a base path.
 *
 * @param paths - The paths to append to the base path.
 * @returns The constructed path.
 */
export function buildPath (...paths: string[]): string {
  return basePath('.stone', ...paths)
}

/**
 * Constructs a path string by appending the provided paths to the 'dist' directory.
 *
 * @param paths - The path segments to be appended to the 'dist' directory.
 * @returns The constructed path string.
 */
export function distPath (...paths: string[]): string {
  return basePath('dist', ...paths)
}

/**
 * Resolve path from app directory.
 *
 * @param   {...string} paths
 * @returns {string}
 */
export function appPath (...paths: string[]): string {
  return basePath('app', ...paths)
}

/**
 * Resolve path from node_modules directory.
 *
 * @param   {...string} paths
 * @returns {string}
 */
export function nodeModulesPath (...paths: string[]): string {
  return basePath('node_modules', ...paths)
}

/**
 * Get File Hash.
 * Creates a file hash for caching purposes.
 *
 * @param filename - The path to the file.
 * @returns The SHA-256 hash of the file content.
 */
export function getFileHash (filename: string): string {
  return createHash('sha256').update(readFileSync(filename)).digest('hex')
}

/**
 * Asynchronously imports a module given its relative path.
 *
 * @param {string} relativePath - The relative path to the module to be imported.
 * @returns {Promise<any>} A promise that resolves to the imported module, or null if the import fails.
 */
export async function importModule<R> (relativePath: string): Promise<R | undefined> {
  try {
    return await import(new URL(join(process.cwd(), relativePath), 'file://').href)
  } catch (_) {}
}

/**
 * The files that make up an application's source.
 *
 * This is the one definition of "the app" shared by the tools that need to find it: the CLI scans it
 * to decide how to build, and `@stone-js/testing` scans it to boot the same modules a test would
 * otherwise have to list by hand. Keeping it here is what stops those two answers from drifting
 * apart.
 */
export const DEFAULT_APP_MODULES_PATTERN = 'app/**/*.{ts,tsx,js,jsx,mjsx}'

/**
 * List an application's source files.
 *
 * Results are absolute and sorted, so a build or a test suite sees the same files in the same order
 * on every machine: an unsorted directory read is one of the ways a suite passes locally and fails
 * in CI.
 *
 * @param options - The pattern to match (defaults to {@link DEFAULT_APP_MODULES_PATTERN}), relative
 *                  to the project root unless it is already absolute.
 * @returns The matching file paths.
 */
export function appModuleFiles (options: { pattern?: string } = {}): string[] {
  const pattern = options.pattern ?? DEFAULT_APP_MODULES_PATTERN
  return globSync(isAbsolute(pattern) ? pattern : basePath(pattern)).sort((a, b) => a.localeCompare(b))
}
