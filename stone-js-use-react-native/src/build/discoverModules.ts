import { readdirSync, statSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'

/**
 * The directory scanned for application modules, relative to the project root.
 */
export const DEFAULT_APP_DIR: string = 'app'

/**
 * The file extensions collected from the application directory.
 */
export const DEFAULT_EXTENSIONS: string[] = ['ts', 'tsx', 'js', 'jsx', 'mjs']

/**
 * Where the generated manifest is written, relative to the project root.
 */
export const GENERATED_MANIFEST: string = join('.stone', 'modules.ts')

/**
 * Options for discovering an application's modules.
 */
export interface DiscoverModulesOptions {
  /** The directory to scan, relative to the project root. Defaults to `app`. */
  appDir?: string

  /** The extensions to collect. Defaults to the TypeScript and JavaScript family. */
  extensions?: string[]
}

/**
 * Whether a file is one of the application's own modules.
 *
 * Declaration files describe code rather than being it, and tests are not part of the
 * application, so neither belongs in the manifest.
 *
 * @param file - The file name.
 * @param extensions - The extensions to accept.
 * @returns True when the file is a module to collect.
 */
export function isApplicationModule (file: string, extensions: string[]): boolean {
  if (file.endsWith('.d.ts')) { return false }
  if (/\.(spec|test)\.[^.]+$/.test(file)) { return false }

  return extensions.includes(extname(file).slice(1).toLowerCase())
}

/**
 * Find the application's modules, deepest paths last.
 *
 * Build-time only, and deliberately a plain filesystem walk: the web build asks Vite for
 * `import.meta.glob`, which no other bundler understands, and Metro understands none of it. So
 * the same question is answered here, in Node, before any bundler runs.
 *
 * Results are sorted, so the generated manifest is byte-identical between two runs on the same
 * tree. A manifest that reordered itself would show up as a diff on every build.
 *
 * @param projectRoot - The absolute project root.
 * @param options - The discovery options.
 * @returns The matched files, as absolute paths, sorted.
 */
export function discoverModules (projectRoot: string, options: DiscoverModulesOptions = {}): string[] {
  const extensions = (options.extensions ?? DEFAULT_EXTENSIONS).map((extension) => extension.toLowerCase())
  const root = join(projectRoot, options.appDir ?? DEFAULT_APP_DIR)
  const found: string[] = []

  const walk = (dir: string): void => {
    let entries: string[]

    try {
      entries = readdirSync(dir)
    } catch {
      return // The directory does not exist: an application with no modules is not an error.
    }

    for (const entry of entries.sort((a, b) => a.localeCompare(b))) {
      const path = join(dir, entry)

      if (statSync(path).isDirectory()) {
        walk(path)
      } else if (isApplicationModule(entry, extensions)) {
        found.push(path)
      }
    }
  }

  walk(root)

  return found
}

/**
 * Build the import specifier the manifest uses to reach a module.
 *
 * Always explicitly relative and always POSIX, so it resolves the same on every operating
 * system, and without its extension, so the bundler applies its own platform resolution
 * (`Component.ios.tsx` before `Component.tsx`) exactly as it would for hand-written code.
 *
 * @param manifestDir - The directory the manifest lives in.
 * @param file - The absolute path of the module.
 * @returns The relative POSIX specifier.
 */
export function toImportSpecifier (manifestDir: string, file: string): string {
  const withoutExtension = file.slice(0, file.length - extname(file).length)
  const relativePath = relative(manifestDir, withoutExtension).split(sep).join('/')

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

/**
 * The line separators and the backslash, built by code point.
 *
 * Never written literally: U+2028 and U+2029 are invisible in an editor, and a source file that
 * carries them is a source file nobody can review.
 */
const LINE_SEPARATOR = String.fromCodePoint(0x2028)
const PARAGRAPH_SEPARATOR = String.fromCodePoint(0x2029)
const BACKSLASH = String.fromCodePoint(0x5C)

/**
 * Build a unicode escape sequence as plain text, without writing the character itself.
 *
 * @param code - The code point.
 * @returns The escape sequence.
 */
function unicodeEscape (code: number): string {
  return BACKSLASH + 'u' + code.toString(16).padStart(4, '0').toUpperCase()
}

/**
 * What `JSON.stringify` leaves intact but that is unsafe to embed in generated source.
 *
 * Only the two line separators. The i18n generator also escapes angle brackets and the forward
 * slash, because its output can end up inside an HTML `<script>`; this one is read by a native
 * bundler and never by a browser, so escaping every slash would make each import unreadable to
 * buy nothing.
 */
const UNSAFE_SOURCE_CHARS: Record<string, string> = {
  [LINE_SEPARATOR]: unicodeEscape(0x2028),
  [PARAGRAPH_SEPARATOR]: unicodeEscape(0x2029)
}

const UNSAFE_SOURCE_RE = new RegExp('[' + LINE_SEPARATOR + PARAGRAPH_SEPARATOR + ']', 'g')

/**
 * Serialize a string as a source-safe JavaScript literal.
 *
 * `JSON.stringify` handles the quoting; this additionally neutralises what it leaves intact but
 * that can terminate a script context or a string literal, so an unusual file name can never
 * break out of the generated source.
 *
 * @param value - The raw string.
 * @returns A safe literal, quotes included.
 */
export function toSafeJsStringLiteral (value: string): string {
  return JSON.stringify(value).replace(UNSAFE_SOURCE_RE, (char) => UNSAFE_SOURCE_CHARS[char])
}

/**
 * Generate the manifest's source.
 *
 * Real static imports, never a glob: this file is read by Metro, and it has to look like code
 * anyone could have written by hand. Which is also why it collects every export of every module
 * the same way the web entry does, so a class, a blueprint or a `define*` fragment is picked up
 * on both platforms by the same rule.
 *
 * @param manifestDir - The directory the manifest lives in.
 * @param files - The discovered module files.
 * @returns The manifest source.
 */
export function generateManifest (manifestDir: string, files: string[]): string {
  const specifiers = files.map((file) => toSafeJsStringLiteral(toImportSpecifier(manifestDir, file)))
  const imports = specifiers.map((specifier, index) => `import * as module${index} from ${specifier}`)
  const names = specifiers.map((_specifier, index) => `module${index}`)

  return `// Generated by @stone-js/use-react-native. Do not edit.
//
// Your application's modules, collected from the app directory at build time. A native bundler
// resolves imports statically, so they are listed here as real imports rather than discovered at
// runtime. Regenerated whenever Metro starts, so adding a file is enough: nothing to maintain.
${imports.length > 0 ? '\n' + imports.join('\n') + '\n' : ''}
const namespaces: Array<Record<string, unknown>> = [${names.join(', ')}]

export const modules: unknown[] = namespaces.flatMap((namespace) => Object.values(namespace))
`
}
