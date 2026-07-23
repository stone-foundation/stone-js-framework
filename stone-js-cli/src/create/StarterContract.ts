import fsExtra from 'fs-extra'
import simpleGit from 'simple-git'
import { execFileSync } from 'node:child_process'
import { CliError } from '../errors/CliError'
import { tmpPath } from '@stone-js/filesystem'
import { isAbsolute, join, resolve } from 'node:path'

const { existsSync, removeSync, copySync, readJsonSync } = fsExtra

/**
 * The starter contract a package declares in its own `package.json`:
 *
 * ```jsonc
 * { "name": "@acme/stone-starters", "stone": { "starters": [
 *   { "value": "api", "title": "REST API", "tags": ["api"], "path": "api" }
 * ] } }
 * ```
 *
 * This is the ONLY thing the CLI knows about a starter — it lives in the starter, not here.
 */
export interface StarterEntry {
  /** Unique id (the questionnaire answer value). */
  value: string
  /** Display title. */
  title?: string
  /** One-line description. */
  description?: string
  /** Free-form tags (e.g. `api`, `spa`, `ssr`, `ssg`). */
  tags?: string[]
  /** Sub-path of the template inside the package (default `.`). */
  path?: string
}

/**
 * A starter entry resolved to a concrete local directory, ready to copy.
 */
export interface ResolvedStarter extends StarterEntry {
  /** The declaring package name (display group). */
  provider: string
  /** Absolute root directory of the fetched/installed package. */
  dir: string
}

/**
 * Context for fetching/collecting starters.
 */
export interface StarterFetchContext {
  /** Current working directory (for local links and auto-detection). */
  cwd: string
  /** Minimal logger. */
  output: { info: (message: string) => void }
}

/**
 * The built-in default starter link. It is just a LINK — the CLI stays agnostic; the actual
 * starter set is declared by that package's own `stone.starters` manifest.
 */
export const DEFAULT_STARTER_LINK = 'github:stone-foundation/stone-js-framework'

/**
 * Resolves the starter links to use: those given via `--starters` / `stone.createApp.starters`,
 * otherwise the single built-in default. Passing links never disables the user's other options.
 *
 * @param blueprint - The application blueprint.
 * @returns The starter links.
 */
export function resolveStarterLinks (blueprint: { get: <T>(key: string, fallback: T) => T }): string[] {
  const links = blueprint.get<string[]>('stone.createApp.starters', []) ?? []
  return links.length > 0 ? links : [DEFAULT_STARTER_LINK]
}

/**
 * Parses a starter link into a fetch descriptor.
 *
 * Supported: `github:owner/repo(#ref)`, any `*.git` / `git@` / `git+` URL, `npm:<pkg>`,
 * a bare npm package name (`@scope/x`, `x`), or a local path (`./x`, `/x`).
 *
 * @param link - The starter link.
 * @returns The parsed descriptor.
 */
export function parseStarterLink (link: string): { kind: 'git' | 'npm' | 'local', target: string, ref?: string } {
  if (link.startsWith('github:')) {
    const [repo, ref] = link.slice('github:'.length).split('#')
    return { kind: 'git', target: `https://github.com/${repo}.git`, ref }
  }
  if (link.endsWith('.git') || link.startsWith('git@') || link.startsWith('git+')) {
    return { kind: 'git', target: link.replace(/^git\+/, '') }
  }
  if (link.startsWith('npm:')) {
    return { kind: 'npm', target: link.slice('npm:'.length) }
  }
  if (link.startsWith('.') || isAbsolute(link)) {
    return { kind: 'local', target: link }
  }
  return { kind: 'npm', target: link }
}

/**
 * Fetches a starter link to a local directory and returns it with its `package.json`.
 *
 * @param link - The starter link.
 * @param context - The fetch context.
 * @returns The resolved directory and its package.json.
 * @throws {CliError} When the link cannot be fetched.
 */
export async function fetchStarter (link: string, context: StarterFetchContext): Promise<{ dir: string, packageJson: any }> {
  const parsed = parseStarterLink(link)

  if (parsed.kind === 'local') {
    const dir = resolve(context.cwd, parsed.target)
    return { dir, packageJson: readPackageJson(dir) }
  }

  if (parsed.kind === 'git') {
    const name = `starter-${slug(link)}`
    const dir = tmpPath(name)
    existsSync(dir) && removeSync(dir)
    context.output.info(`Fetching starter from ${parsed.target}`)
    const options = parsed.ref !== undefined ? ['--depth', '1', '--branch', parsed.ref] : ['--depth', '1']
    await simpleGit(tmpPath()).clone(parsed.target, name, options)
    return { dir, packageJson: readPackageJson(dir) }
  }

  // npm
  const prefix = tmpPath(`starter-npm-${slug(link)}`)
  existsSync(prefix) && removeSync(prefix)
  context.output.info(`Installing starter ${parsed.target}`)
  execFileSync('npm', ['install', parsed.target, '--prefix', prefix, '--no-save', '--no-audit', '--no-fund'], { stdio: 'inherit', shell: false })
  const dir = join(prefix, 'node_modules', barePackageName(parsed.target))
  return { dir, packageJson: readPackageJson(dir) }
}

/**
 * Reads the starter entries a package declares in `package.json` -> `stone.starters`.
 * When none are declared, the whole package is treated as a single starter (path `.`),
 * so a plain template repo works with zero manifest.
 *
 * @param packageJson - The package's manifest.
 * @returns The declared starter entries.
 */
export function readStarterEntries (packageJson: any): StarterEntry[] {
  const declared = packageJson?.stone?.starters
  if (Array.isArray(declared) && declared.length > 0) {
    return declared as StarterEntry[]
  }
  return [{ value: packageJson?.name ?? 'default', title: packageJson?.name ?? 'default', path: '.' }]
}

/**
 * Fetches every link and expands each into its declared starter entries.
 *
 * @param links - The starter links.
 * @param context - The fetch context.
 * @returns The resolved starters.
 */
export async function collectStarters (links: string[], context: StarterFetchContext): Promise<ResolvedStarter[]> {
  const resolved: ResolvedStarter[] = []
  for (const link of links) {
    const { dir, packageJson } = await fetchStarter(link, context)
    for (const entry of readStarterEntries(packageJson)) {
      resolved.push({ ...entry, provider: packageJson?.name ?? link, dir })
    }
  }
  return resolved
}

/**
 * Auto-detects installed starter packages: any dependency whose `package.json` declares
 * `stone.starters`. This is the zero-config, plug-and-play path — install a starter pack and
 * it shows up, without passing any link.
 *
 * @param cwd - The project directory to scan.
 * @returns The auto-detected starters.
 */
export function autodetectStarters (cwd: string): ResolvedStarter[] {
  const rootPkg = readPackageJson(cwd, true)
  const deps = { ...rootPkg?.dependencies, ...rootPkg?.devDependencies }
  const resolved: ResolvedStarter[] = []

  for (const name of Object.keys(deps)) {
    const dir = join(cwd, 'node_modules', name)
    const packageJson = readPackageJson(dir, true)
    if (packageJson?.stone?.starters === undefined) { continue }
    for (const entry of readStarterEntries(packageJson)) {
      resolved.push({ ...entry, provider: name, dir })
    }
  }

  return resolved
}

/**
 * Returns every available starter (fetched links + auto-detected packages), memoised on the
 * blueprint so the questionnaire and the materialisation step never fetch twice.
 *
 * @param blueprint - The application blueprint (get/set).
 * @param context - The fetch context.
 * @returns The available starters.
 */
export async function getAvailableStarters (
  blueprint: { get: <T>(key: string, fallback: T) => T, set: (key: string, value: unknown) => unknown },
  context: StarterFetchContext
): Promise<ResolvedStarter[]> {
  const cached = blueprint.get<ResolvedStarter[] | undefined>('stone.createApp.available', undefined)
  if (cached !== undefined) { return cached }

  const collected = [
    ...await collectStarters(resolveStarterLinks(blueprint), context),
    ...autodetectStarters(context.cwd)
  ]

  blueprint.set('stone.createApp.available', collected)
  return collected
}

/**
 * Copies a resolved starter's files into the destination directory.
 *
 * @param starter - The resolved starter.
 * @param destDir - The destination directory.
 * @throws {CliError} When the starter directory/path does not exist.
 */
export function materializeStarter (starter: ResolvedStarter, destDir: string): void {
  const srcDir = join(starter.dir, starter.path ?? '.')
  if (!existsSync(srcDir)) {
    throw new CliError(`Starter "${starter.value}" from "${starter.provider}" was not found at ${srcDir}.`)
  }
  copySync(srcDir, destDir)
}

/**
 * Reads a `package.json`, optionally tolerating a missing file (returns `undefined`).
 */
function readPackageJson (dir: string, optional = false): any {
  const file = join(dir, 'package.json')
  if (!existsSync(file)) {
    if (optional) { return undefined }
    throw new CliError(`No package.json found in starter at ${dir}.`)
  }
  return readJsonSync(file)
}

/**
 * Builds a filesystem-safe slug from a link.
 */
function slug (link: string): string {
  return link.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

/**
 * Extracts the bare package name (drops any trailing version) from an npm spec.
 */
function barePackageName (spec: string): string {
  const at = spec.lastIndexOf('@')
  return at > 0 ? spec.slice(0, at) : spec
}
