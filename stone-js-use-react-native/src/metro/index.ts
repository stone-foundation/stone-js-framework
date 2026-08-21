import { WriteManifestOptions, writeManifest } from '../build/writeManifest'

/**
 * The manifest generator, on its own.
 *
 * `withStone` is how an application gets it for free, and covers every way Metro can start. But
 * Metro is not the only thing that needs the file to exist: `tsc --noEmit` on a fresh clone reads
 * the entry's `import { modules } from './.stone/modules'` before Metro has ever run, and so does a
 * CI step that type-checks without bundling, and so does an editor opening the project.
 *
 * Exposing it here rather than from the package root keeps the split honest: this entry is the
 * build-time one, it reads the filesystem, and a phone never loads it.
 */
export { writeManifest, type WriteManifestOptions, type ManifestResult } from '../build/writeManifest'

/**
 * The shape of a Metro configuration. Declared structurally so this module needs neither Metro
 * nor Expo installed to be built or type-checked.
 */
export interface MetroConfigLike {
  watchFolders?: string[]
  [key: string]: unknown
}

/**
 * Options for the Metro integration.
 */
export interface WithStoneOptions extends WriteManifestOptions {
  /** The project root. Defaults to the current working directory, which is Metro's own root. */
  projectRoot?: string

  /** Print a line saying how many modules were collected. Defaults to `true`. */
  verbose?: boolean
}

/**
 * Collect the application's modules, then hand Metro its configuration back.
 *
 * This is the whole of the native build's code generation, and it lives here for one reason:
 * Metro loads `metro.config.js` whatever brought it up. `expo start`, `expo run:ios`, an EAS
 * build, an editor extension, all of them go through this file, so wiring the generation here is
 * what makes it happen without anyone remembering to ask.
 *
 * It runs synchronously and before the configuration is returned, so the manifest exists by the
 * time Metro resolves the first import.
 *
 * One thing to know: the manifest is written when Metro starts, not while it runs. Adding a page
 * to a running dev server means restarting it, the same as changing this configuration would.
 * Editing a page that already exists needs nothing: Fast Refresh has never involved this file.
 *
 * @param config - The configuration to pass through, typically `getDefaultConfig(__dirname)`.
 * @param options - The generation options, or the project root as a shorthand.
 * @returns The configuration, unchanged.
 *
 * @example
 * ```js
 * // metro.config.js
 * const { getDefaultConfig } = require('expo/metro-config')
 * const { withStone } = require('@stone-js/use-react-native/metro')
 *
 * module.exports = withStone(getDefaultConfig(__dirname), __dirname)
 * ```
 */
export function withStone<T extends MetroConfigLike> (config: T, options: WithStoneOptions | string = {}): T {
  const resolved: WithStoneOptions = typeof options === 'string' ? { projectRoot: options } : options
  const projectRoot = resolved.projectRoot ?? process.cwd()
  const result = writeManifest(projectRoot, resolved)

  if (resolved.verbose !== false) {
    // Through `console` on purpose: this runs inside Metro's configuration, before anything of
    // ours exists, and a line saying what was collected is what turns a silent generation into
    // something a developer can trust.
    console.log(`[Stone.js] ${result.count} module${result.count === 1 ? '' : 's'} collected${result.changed ? '' : ' (unchanged)'}`)
  }

  return config
}
