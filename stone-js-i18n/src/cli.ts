import { globSync } from 'glob'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname, relative, dirname, sep } from 'node:path'
import type { StoneCliPlugin, StonePluginContext } from '@stone-js/cli'

/**
 * The default root walked for translation directories, relative to the project root.
 */
export const DEFAULT_I18N_ROOT = 'app'

/**
 * The directory name that marks a translation catalogue, anywhere under the root.
 */
export const DEFAULT_I18N_DIRNAME = 'i18n'

/**
 * Kept for compatibility: the conventional single-directory layout.
 */
export const DEFAULT_I18N_DIR = 'app/i18n'

/**
 * Never scanned, whichever option is used: a dependency's own catalogues are not the app's, and a
 * glob like `app/**\/i18n/*\/*.json` would otherwise pull them in.
 */
export const NEVER_SCANNED: string[] = ['**/node_modules/**', '**/.git/**']

/**
 * The file extensions autoloaded from the translations directory.
 *
 * These are the formats the bundler can import directly on every target (JSON via the JSON plugin,
 * the JS family via Babel), so the generated module builds identically on Rollup and Vite.
 */
export const DEFAULT_I18N_EXTENSIONS = 'json,js,mjs,ts'

/**
 * Where the plugin writes its generated module, relative to the build's `.stone/tmp` directory.
 */
export const GENERATED_MODULE = 'plugins/i18n.mjs'

/**
 * Options for the i18n CLI plugin.
 */
export interface I18nCliPluginOptions {
  /**
   * The root walked for translation directories, relative to the project root. Default `'app'`.
   *
   * Every directory named {@link I18nCliPluginOptions.dirname} beneath it contributes, at any depth,
   * so translations can live next to the code that uses them.
   */
  root?: string

  /**
   * The directory name that marks a catalogue. Default `'i18n'`.
   */
  dirname?: string

  /**
   * Scan exactly this one directory instead of walking the root, relative to the project root.
   * Use it for a layout the walk cannot express, for example translations kept outside `app`.
   */
  dir?: string

  /**
   * Take the files from a glob instead of the walk, relative to the project root. Full control, and
   * the escape hatch when a project names its catalogues something else entirely:
   * `'app/**\/locales/*\/*.json'`.
   *
   * Whatever it matches must still end in `<locale>/<namespace>.<ext>`, because that tail is what
   * tells the runtime which locale and namespace a file carries. `node_modules` and `.git` are
   * excluded regardless of what the glob matches.
   */
  pattern?: string

  /**
   * The comma-separated file extensions to autoload. Default `'json,js,mjs,ts'`.
   */
  extensions?: string

  /**
   * Lazy-load catalogs: import only the active locale's catalog on demand (code-split per file),
   * instead of bundling every locale eagerly. Default `true`, for a lighter payload. The locale is
   * awaited before render (no FOUC). Set to `false` to bundle every locale eagerly. See
   * {@link I18nOptions.loaders}.
   */
  lazy?: boolean
}

/**
 * Find every translation directory under a root, at any depth.
 *
 * A catalogue is any directory named `i18n` (configurable), so a project can group translations
 * with the code that uses them: `app/i18n/`, `app/modules/billing/i18n/`, `app/common/i18n/`. All of
 * them contribute, and catalogues sharing a locale and namespace merge, which is what makes a shared
 * `common` namespace across modules work.
 *
 * Build-time only (Node). Returns an empty list when the root is absent, so it is always safe to
 * call. Symlinked directories are not followed, to keep the walk finite.
 *
 * @param root - The absolute root to walk.
 * @param dirname - The directory name marking a catalogue.
 * @returns The matched directories, sorted.
 */
export function findTranslationDirs (root: string, dirname: string = DEFAULT_I18N_DIRNAME): string[] {
  if (!existsSync(root)) { return [] }

  const found: string[] = []
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (!entry.isDirectory()) { continue }
      const path = join(current, entry.name)
      if (entry.name === dirname) {
        found.push(path)
        continue // a catalogue's own subdirectories are locales, not more catalogues
      }
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) { continue }
      walk(path)
    }
  }

  walk(root)
  return found.sort((a, b) => a.localeCompare(b))
}

/**
 * Scan `<dir>/<locale>/<namespace>.<ext>` and return the matching files, as absolute paths.
 *
 * Build-time only (Node). Returns an empty list when the directory is absent, so it is always safe
 * to call. Results are sorted for deterministic, reproducible output.
 *
 * @param dir - The absolute directory to scan.
 * @param extensions - The lowercase extensions (without the dot) to include.
 * @returns The matched files, sorted.
 */
export function scanTranslationFiles (dir: string, extensions: string[]): string[] {
  if (!existsSync(dir)) { return [] }

  const files: string[] = []

  for (const locale of readdirSync(dir)) {
    const localeDir = join(dir, locale)
    if (!statSync(localeDir).isDirectory()) { continue }

    for (const entry of readdirSync(localeDir)) {
      const file = join(localeDir, entry)
      if (extensions.includes(extname(entry).slice(1).toLowerCase()) && statSync(file).isFile()) {
        files.push(file)
      }
    }
  }

  return files.sort((a, b) => a.localeCompare(b))
}

/**
 * Collect every catalogue file the project declares.
 *
 * Walks the root for translation directories, then scans each for `<locale>/<namespace>.<ext>`.
 * De-duplicated and sorted, so the generated module is byte-stable across builds.
 *
 * @param root - The absolute root to walk.
 * @param extensions - The lowercase extensions (without the dot) to include.
 * @param dirname - The directory name marking a catalogue.
 * @returns The matched files, sorted.
 */
export function collectTranslationFiles (
  root: string,
  extensions: string[],
  dirname: string = DEFAULT_I18N_DIRNAME
): string[] {
  const files = findTranslationDirs(root, dirname).flatMap((dir) => scanTranslationFiles(dir, extensions))
  return [...new Set(files)].sort((a, b) => a.localeCompare(b))
}

/**
 * Build a POSIX import specifier from the generated module to a translation file.
 *
 * The specifier keeps the `<locale>/<namespace>.<ext>` tail intact, so the runtime can read the
 * locale and namespace from it, and is always explicitly relative (`./` or `../`) and POSIX, so it
 * resolves the same on every OS and bundler.
 *
 * @param moduleDir - The directory the generated module lives in.
 * @param file - The absolute path of the translation file.
 * @returns The relative POSIX import specifier.
 */
export function toImportSpecifier (moduleDir: string, file: string): string {
  const rel = relative(moduleDir, file).split(sep).join('/')
  return rel.startsWith('.') ? rel : `./${rel}`
}

/** The U+2028 and U+2029 line separators, and the backslash, built by code point (no literals here). */
const LINE_SEP = String.fromCodePoint(0x2028)
const PARA_SEP = String.fromCodePoint(0x2029)
const BACKSLASH = String.fromCodePoint(0x5C)

/**
 * Build a unicode escape sequence (as plain text) for a code point, without writing a backslash
 * escape or the raw character in this source.
 *
 * @param code - The code point.
 * @returns The escape sequence, e.g. the six characters that render the less-than sign.
 */
function unicodeEscape (code: number): string {
  return BACKSLASH + 'u' + code.toString(16).padStart(4, '0').toUpperCase()
}

/**
 * Characters JSON.stringify leaves intact but that are unsafe to embed verbatim in generated
 * source (they can terminate a script context or, historically, a JS string literal).
 */
const UNSAFE_SOURCE_CHARS: Record<string, string> = {
  '<': unicodeEscape(0x3C),
  '>': unicodeEscape(0x3E),
  '/': unicodeEscape(0x2F),
  [LINE_SEP]: unicodeEscape(0x2028),
  [PARA_SEP]: unicodeEscape(0x2029)
}

const UNSAFE_SOURCE_RE = new RegExp('[<>/' + LINE_SEP + PARA_SEP + ']', 'g')

/**
 * Serialize a string as a JS string literal safe to embed in generated source, even inside an HTML
 * `<script>`.
 *
 * `JSON.stringify` handles quoting and standard escaping; this additionally neutralises the
 * characters it leaves intact but that can break out of a script context or a JS string literal
 * (angle brackets, the forward slash, and the U+2028/U+2029 line separators). The decoded string
 * value is unchanged, so an import specifier still resolves to the exact same module.
 *
 * @param value - The raw string (here, an import specifier).
 * @returns A safe JS string literal, quotes included.
 */
export function toSafeJsStringLiteral (value: string): string {
  return JSON.stringify(value).replace(UNSAFE_SOURCE_RE, (char) => UNSAFE_SOURCE_CHARS[char])
}

/**
 * Generate the source of the module the plugin injects into the build.
 *
 * The generated module contributes the resources through real imports, so it builds on every target
 * (no `import.meta.glob`, which only Vite understands). In eager mode it statically imports each
 * catalog and hands them to {@link loadTranslations}; in lazy mode it exposes per-file dynamic
 * importers as {@link I18nOptions.loaders}, so only the active locale's catalog is fetched at runtime.
 * Emitting it as a plain `stone`-wrapped blueprint makes it a meta-module the built app collects. Every
 * embedded specifier is escaped with {@link toSafeJsStringLiteral}, so an unusual file name can never
 * break out of the generated source.
 *
 * @param moduleDir - The directory the generated module lives in.
 * @param files - The absolute translation file paths.
 * @param lazy - Whether to emit lazy per-file loaders instead of eager imports.
 * @returns The generated module source.
 */
export function generateI18nModule (moduleDir: string, files: string[], lazy: boolean): string {
  const specifiers = files.map((file) => toSafeJsStringLiteral(toImportSpecifier(moduleDir, file)))
  // A plain `stone`-wrapped blueprint, which the module scan applies directly (`isStoneBlueprint`).
  // It used to emit `defineConfig(defineI18n({...}))`, which silently did NOTHING: that helper
  // returned an unwrapped `{ i18n }` fragment while `defineConfig` expects a function or an object
  // carrying `configure`, so the generated configuration resolved to an empty `configure` and the
  // catalogs never reached the blueprint. Every translation returned its key, which reads exactly
  // like a missing catalogue. The helper has since been removed from the public API.
  const header = '// Generated by @stone-js/i18n/cli. Do not edit.'

  if (lazy) {
    const entries = specifiers.map((spec) => `      ${spec}: () => import(${spec})`)
    return `${header}

export const stoneI18nResources = {
  stone: {
    i18n: {
      loaders: {
${entries.join(',\n')}
      }
    }
  }
}
`
  }

  const imports = specifiers.map((spec, index) => `import * as __i18n${index} from ${spec}`)
  const entries = specifiers.map((spec, index) => `      ${spec}: __i18n${index}`)
  return `${header}
import { loadTranslations } from '@stone-js/i18n'
${imports.join('\n')}

export const stoneI18nResources = {
  stone: {
    i18n: {
      resources: loadTranslations({
${entries.join(',\n')}
      })
    }
  }
}
`
}

/**
 * The i18n Stone CLI plugin: true zero-config translations.
 *
 * At build time (and in dev) it walks `app` for every directory named `i18n`, at any depth, scans each
 * for `<locale>/<namespace>.*`, and generates a module that contributes the catalogs to the built app,
 * so no manual `loadTranslations(...)` line is needed. Because the walk is deep, translations can be
 * grouped per module (`app/modules/billing/i18n/`) as readily as in one shared `app/i18n/`, and
 * catalogues sharing a locale and namespace merge.
 * It emits plain imports (never `import.meta.glob`), so the same plugin works for a backend service
 * (Rollup), a browser SPA and SSR (Vite) alike. Catalogs are lazy by default: only the active locale
 * is fetched on demand, awaited before render so there is no flash of untranslated keys (pass
 * `lazy: false` to bundle every locale eagerly). Add it to `stone.config`
 * (`plugins: [i18nCliPlugin()]`), or rely on first-party auto-discovery.
 *
 * @param options - The plugin options.
 * @returns The Stone CLI plugin.
 */
export function i18nCliPlugin (options: I18nCliPluginOptions = {}): StoneCliPlugin {
  const root = options.root ?? DEFAULT_I18N_ROOT
  const catalogueDir = options.dirname ?? DEFAULT_I18N_DIRNAME
  const extensions = (options.extensions ?? DEFAULT_I18N_EXTENSIONS).split(',').map((ext) => ext.trim().toLowerCase())
  const lazy = options.lazy ?? true
  const source = options.pattern ?? options.dir ?? `${root}/**/${catalogueDir}`

  return {
    name: '@stone-js/i18n',
    description: `Autoloads ${source}/<locale>/<namespace> translations into the app at build time (${lazy ? 'lazy' : 'eager'}).`,
    onPrepare (context: StonePluginContext): void {
      const moduleDir = dirname(context.buildPath(GENERATED_MODULE))
      const files = resolveTranslationFiles(process.cwd(), { ...options, root, dirname: catalogueDir }, extensions)
      context.writeFile(GENERATED_MODULE, generateI18nModule(moduleDir, files, lazy))
      context.addModule(`./${GENERATED_MODULE}`)
    }
  }
}

/**
 * Resolve the catalogue files, from the most explicit option to the zero-config walk.
 *
 * `pattern` wins (full control), then `dir` (one explicit directory), then the default: walk `root`
 * for every directory named `dirname`, at any depth.
 *
 * @param cwd - The project root.
 * @param options - The plugin options, with defaults already applied for `root` and `dirname`.
 * @param extensions - The lowercase extensions (without the dot) to include.
 * @returns The matched files, absolute and sorted.
 */
export function resolveTranslationFiles (
  cwd: string,
  options: I18nCliPluginOptions & { root: string, dirname: string },
  extensions: string[]
): string[] {
  if (options.pattern !== undefined) {
    return globSync(options.pattern, { cwd, absolute: true, nodir: true, ignore: NEVER_SCANNED })
      .filter((file) => extensions.includes(extname(file).slice(1).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
  }

  if (options.dir !== undefined) {
    return scanTranslationFiles(join(cwd, options.dir), extensions)
  }

  return collectTranslationFiles(join(cwd, options.root), extensions, options.dirname)
}

/**
 * A ready-to-use plugin instance, used by first-party `package.json` auto-discovery.
 */
const plugin: StoneCliPlugin = i18nCliPlugin()
export default plugin
