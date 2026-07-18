import { tmpdir } from 'node:os'
import process from 'node:process'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

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
 * @returns The MD5 hash of the file content.
 */
export function getFileHash (filename: string): string {
  return createHash('md5').update(readFileSync(filename)).digest('hex')
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
