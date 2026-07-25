import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname, relative, dirname, sep } from 'node:path'
import type { StoneCliPlugin, StonePluginContext } from '@stone-js/cli'

/**
 * The default directory scanned for translations, relative to the project root.
 */
export const DEFAULT_I18N_DIR = 'app/i18n'

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
   * The directory scanned for translations, relative to the project root. Default `'app/i18n'`.
   */
  dir?: string

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
 * Wrapping it in `defineConfig(defineI18n(...))` makes it a meta-module the built app collects. Every
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
  const header = "// Generated by @stone-js/i18n/cli. Do not edit.\nimport { defineConfig } from '@stone-js/core'"

  if (lazy) {
    const entries = specifiers.map((spec) => `    ${spec}: () => import(${spec})`)
    return `${header}
import { defineI18n } from '@stone-js/i18n'

export const stoneI18nResources = defineConfig(defineI18n({
  loaders: {
${entries.join(',\n')}
  }
}))
`
  }

  const imports = specifiers.map((spec, index) => `import * as __i18n${index} from ${spec}`)
  const entries = specifiers.map((spec, index) => `    ${spec}: __i18n${index}`)
  return `${header}
import { defineI18n, loadTranslations } from '@stone-js/i18n'
${imports.join('\n')}

export const stoneI18nResources = defineConfig(defineI18n({
  resources: loadTranslations({
${entries.join(',\n')}
  })
}))
`
}

/**
 * The i18n Stone CLI plugin: true zero-config translations.
 *
 * At build time (and in dev) it scans `app/i18n/<locale>/<namespace>.*` and generates a module that
 * contributes the catalogs to the built app, so no manual `loadTranslations(...)` line is needed.
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
  const dir = options.dir ?? DEFAULT_I18N_DIR
  const extensions = (options.extensions ?? DEFAULT_I18N_EXTENSIONS).split(',').map((ext) => ext.trim().toLowerCase())
  const lazy = options.lazy ?? true

  return {
    name: '@stone-js/i18n',
    description: `Autoloads ${dir}/<locale>/<namespace> translations into the app at build time (${lazy ? 'lazy' : 'eager'}).`,
    onPrepare (context: StonePluginContext): void {
      const moduleDir = dirname(context.buildPath(GENERATED_MODULE))
      const files = scanTranslationFiles(join(process.cwd(), dir), extensions)
      context.writeFile(GENERATED_MODULE, generateI18nModule(moduleDir, files, lazy))
      context.addModule(`./${GENERATED_MODULE}`)
    }
  }
}

/**
 * A ready-to-use plugin instance, used by first-party `package.json` auto-discovery.
 */
const plugin: StoneCliPlugin = i18nCliPlugin()
export default plugin
