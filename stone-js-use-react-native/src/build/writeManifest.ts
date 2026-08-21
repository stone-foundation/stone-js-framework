import { dirname, join } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { DiscoverModulesOptions, GENERATED_MANIFEST, discoverModules, generateManifest } from './discoverModules'

/**
 * The outcome of writing the manifest.
 */
export interface ManifestResult {
  /** The absolute path written. */
  path: string

  /** How many modules were collected. */
  count: number

  /** Whether the file changed. */
  changed: boolean
}

/**
 * Options for writing the manifest.
 */
export interface WriteManifestOptions extends DiscoverModulesOptions {
  /** Where to write, relative to the project root. Defaults to `.stone/modules.ts`. */
  manifest?: string
}

/**
 * Write the application's module manifest.
 *
 * Only when it changed. Metro watches the files it bundles, so rewriting an identical manifest on
 * every start would ask it to rebuild for nothing, and in dev that is a reload the developer did
 * not ask for.
 *
 * @param projectRoot - The absolute project root.
 * @param options - The write options.
 * @returns What was written.
 */
export function writeManifest (projectRoot: string, options: WriteManifestOptions = {}): ManifestResult {
  const path = join(projectRoot, options.manifest ?? GENERATED_MANIFEST)
  const files = discoverModules(projectRoot, options)
  const source = generateManifest(dirname(path), files)

  let previous: string | undefined

  try {
    previous = readFileSync(path, 'utf-8')
  } catch {
    previous = undefined
  }

  if (previous === source) {
    return { path, count: files.length, changed: false }
  }

  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, source, 'utf-8')

  return { path, count: files.length, changed: true }
}
