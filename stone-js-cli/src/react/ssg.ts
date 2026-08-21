import { join, dirname } from 'node:path'
import { CliError } from '../errors/CliError'
import { distPath } from '@stone-js/filesystem'
import { mkdirSync, writeFileSync } from 'node:fs'

/**
 * Static Site Generation (SSG) orchestrator.
 *
 * Implements the CLI side of the `PrerenderContract` from `@stone-js/use-view`: discover the
 * routes to pre-render, render each to HTML (delegated to the built app / use-react's
 * `prerenderPage`), and write `dist/<route>/index.html`. SSG is SSR executed at build time,
 * so pages behave identically whether pre-rendered or server-rendered.
 */

/**
 * A route to pre-render (mirrors `@stone-js/use-view` `PrerenderTarget`).
 */
export interface PrerenderTarget {
  path: string
  params?: Record<string, string>
}

/**
 * The output of pre-rendering a target (mirrors `@stone-js/use-view` `PrerenderResult`).
 */
export interface PrerenderResult {
  path: string
  html: string
  statusCode?: number
}

/**
 * A route definition as extracted at build time (subset of the router definition).
 *
 * `path` mirrors the router: a single path or several aliases for one route.
 */
export interface RouteDefinitionLike {
  path: string | string[]
  methods?: string[]
}

/**
 * The values a dynamic segment can take at build time, keyed by segment name.
 *
 * Declared under `stone.builder.ssg.params`. Only finite, enumerable segments belong here (a
 * locale, a plan tier, a category): anything data-driven stays in `ssg.routes`.
 */
export type SsgParams = Record<string, string[]>

/** What {@link collectStaticTargets} could not expand, reported once so the hole is visible. */
export interface SkippedTargets {
  /** The paths that were skipped. */
  paths: string[]
  /** The segment names that would need declared values, de-duplicated. */
  segments: string[]
}

/** A dynamic segment as written in a route path: `:name`, `:name?`, `:name(pattern)`, `:name(pattern)?`. */
interface DynamicSegment {
  name: string
  pattern?: string
  optional: boolean
  start: number
  end: number
}

/** What may appear in a segment name. */
const NAME_CHAR = /\w/

/** Marks an optional segment left out of a combination, which is not the same as an empty value. */
const ABSENT = Symbol('absent')

/** One combination: the value chosen for each segment name, or {@link ABSENT}. */
type Choice = Record<string, string | typeof ABSENT>

/**
 * Find the dynamic segments of a route path.
 *
 * The pattern is read by walking balanced parentheses rather than with one regular expression,
 * because a constraint legitimately contains them (`:lang((en|fr)-CA)`) and a lazy match would
 * cut it in the wrong place.
 *
 * @param path - The route path.
 * @returns The segments, in the order they appear.
 */
function parseDynamicSegments (path: string): DynamicSegment[] {
  const segments: DynamicSegment[] = []
  let index = 0

  while (index < path.length) {
    if (path[index] !== ':') { index++; continue }

    const segment = readSegment(path, index)

    if (segment === undefined) { index++; continue }

    segments.push(segment)
    index = segment.end
  }

  return segments
}

/**
 * Read one dynamic segment starting at a colon.
 *
 * @param path - The route path.
 * @param start - The colon's index.
 * @returns The segment, or `undefined` when the colon names nothing.
 */
function readSegment (path: string, start: number): DynamicSegment | undefined {
  let cursor = start + 1

  while (cursor < path.length && NAME_CHAR.test(path[cursor])) { cursor++ }

  const name = path.slice(start + 1, cursor)
  if (name.length === 0) { return undefined }

  const constraint = readConstraint(path, cursor)
  cursor = constraint.end

  const optional = path[cursor] === '?'
  if (optional) { cursor++ }

  return { name, pattern: constraint.pattern, optional, start, end: cursor }
}

/**
 * Read a segment's constraint, if it has one.
 *
 * Parentheses are matched by depth rather than by a pattern, because a constraint legitimately
 * contains them (`:lang((en|fr)-CA)`) and a lazy match would cut it in the wrong place.
 *
 * @param path - The route path.
 * @param start - Where the constraint would begin.
 * @returns The constraint and where it ends.
 */
function readConstraint (path: string, start: number): { pattern?: string, end: number } {
  if (path[start] !== '(') { return { end: start } }

  let depth = 0
  let cursor = start

  while (cursor < path.length) {
    if (path[cursor] === '(') { depth++ }
    if (path[cursor] === ')') {
      depth--
      if (depth === 0) { cursor++; break }
    }
    cursor++
  }

  return { pattern: path.slice(start + 1, cursor - 1), end: cursor }
}

/**
 * Substitute one combination of values into a path.
 *
 * An absent optional segment takes its leading slash with it, which is what turns
 * `/:lang?/about` into `/about` rather than into `//about`.
 *
 * @param path - The route path.
 * @param segments - Its dynamic segments.
 * @param choice - The value chosen for each segment name, or {@link ABSENT}.
 * @returns The concrete path.
 */
function substitute (
  path: string,
  segments: DynamicSegment[],
  choice: Choice
): string {
  let out = ''
  let cursor = 0

  for (const segment of segments) {
    const before = path.slice(cursor, segment.start)
    const value = choice[segment.name]

    if (value !== ABSENT) {
      out += before + value
    } else if (before.endsWith('/')) {
      // An absent optional segment takes its leading slash with it, so `/:lang?/about` becomes
      // `/about` rather than `//about`.
      out += before.slice(0, -1)
    } else {
      out += before
    }

    cursor = segment.end
  }

  return normalizePath(`${out}${path.slice(cursor)}` === '' ? '/' : `${out}${path.slice(cursor)}`)
}

/**
 * Expand a route path into every concrete path its declared values produce.
 *
 * An optional segment also yields the path without it, so a localized site declaring
 * `/:lang?/about` with `lang: ['en', 'fr']` pre-renders `/about`, `/en/about` and `/fr/about` —
 * the canonical bare path plus its prefixed twins — from one declaration. Several segments expand
 * as a cartesian product.
 *
 * A value that cannot satisfy its own segment constraint fails the build rather than pre-rendering
 * a path the router will never match at runtime.
 *
 * @param path - The route path.
 * @param params - The declared values, by segment name.
 * @returns The expanded targets, plus the segment names that had no declared values.
 * @throws {CliError} When a declared value contradicts its segment's constraint.
 */
export function expandPath (path: string, params: SsgParams): { targets: PrerenderTarget[], missing: string[] } {
  // A wildcard has no name to declare values for, so it stays unexpandable and unreported.
  if (path.includes('*')) { return { targets: [], missing: [] } }

  const segments = parseDynamicSegments(path)
  if (segments.length === 0) { return { targets: [{ path: normalizePath(path) }], missing: [] } }

  const missing = [...new Set(segments.filter((s) => params[s.name] === undefined).map((s) => s.name))]
  if (missing.length > 0) { return { targets: [], missing } }

  for (const segment of segments) {
    if (segment.pattern === undefined) { continue }
    const constraint = new RegExp(`^(?:${segment.pattern})$`)
    for (const value of params[segment.name]) {
      if (!constraint.test(value)) {
        throw new CliError(
          `SSG cannot pre-render \`${path}\`: the value "${value}" declared for \`:${segment.name}\` in ` +
          `\`stone.builder.ssg.params\` does not match the segment's own constraint \`${segment.pattern}\`, ` +
          'so the router would never match the generated path. Fix the value or the constraint.'
        )
      }
    }
  }

  // One name, one value per combination: a segment repeated in a path stays consistent with itself.
  const names = [...new Set(segments.map((s) => s.name))]
  const optional = new Set(segments.filter((s) => s.optional).map((s) => s.name))

  let combinations: Choice[] = [{}]
  for (const name of names) {
    const values: Array<string | typeof ABSENT> = [...params[name]]
    // The bare form comes first, so the canonical path leads the pre-render set.
    if (optional.has(name)) { values.unshift(ABSENT) }
    combinations = combinations.flatMap((base) => values.map((value) => {
      // Assigned rather than spread with a computed key: that form widens `ABSENT` to `symbol`.
      const next: Choice = { ...base }
      next[name] = value
      return next
    }))
  }

  return {
    targets: combinations.map((choice) => {
      const params = Object.fromEntries(
        Object.entries(choice).filter((entry): entry is [string, string] => entry[1] !== ABSENT)
      )
      const target: PrerenderTarget = { path: substitute(path, segments, choice) }
      if (Object.keys(params).length > 0) { target.params = params }
      return target
    }),
    missing: []
  }
}

/**
 * Collect the GET routes to pre-render from the route definitions.
 *
 * This is what makes SSG zero-config: the routes the app already declares (the same
 * definitions the router scans for lazy loading) become the pre-render set, so the user
 * never restates them. A definition contributes every one of its GET paths (a route may declare
 * several aliases).
 *
 * A parameterized path is expanded when `params` declares values for its segments, which matters
 * most for a parameterized global prefix: without it, one `:lang` on the router prefix puts a
 * dynamic segment on *every* route and auto-discovery collapses to nothing. A path whose segments
 * have no declared values is still skipped, but reported through `onSkipped` instead of vanishing.
 *
 * @param definitions - The build-time route definitions.
 * @param options - Declared segment values, and where to report what could not be expanded.
 * @returns The static prerender targets, de-duplicated by path.
 */
export function collectStaticTargets (
  definitions: RouteDefinitionLike[],
  options: { params?: SsgParams, onSkipped?: (skipped: SkippedTargets) => void } = {}
): PrerenderTarget[] {
  const params = options.params ?? {}
  const targets: PrerenderTarget[] = []
  const skipped: SkippedTargets = { paths: [], segments: [] }

  for (const definition of definitions) {
    const isGet = definition.methods === undefined || definition.methods.length === 0 || definition.methods.includes('GET')
    if (!isGet) continue
    const candidates = Array.isArray(definition.path) ? definition.path : [definition.path]
    for (const path of candidates) {
      if (typeof path !== 'string') { continue }
      const { targets: expanded, missing } = expandPath(path, params)
      targets.push(...expanded)
      if (missing.length > 0) {
        skipped.paths.push(path)
        skipped.segments.push(...missing.filter((name) => !skipped.segments.includes(name)))
      }
    }
  }

  if (skipped.paths.length > 0) { options.onSkipped?.(skipped) }

  return targets.filter((t, i, all) => all.findIndex((x) => x.path === t.path) === i)
}

/**
 * Map a route path to its output HTML file path.
 *
 * `/` → `<out>/index.html`; `/blog/hello` → `<out>/blog/hello/index.html` (clean URLs).
 *
 * @param routePath - The route path.
 * @param outDir - The output directory (defaults to `dist/`).
 * @returns The absolute file path.
 */
export function targetToFilePath (routePath: string, outDir: string = distPath()): string {
  const clean = normalizePath(routePath)
  const relative = clean === '/' ? 'index.html' : `${clean.replace(/^\//, '').replace(/\/$/, '')}/index.html`
  return join(outDir, relative)
}

/**
 * Refuse to ship a page the application could not render.
 *
 * A pre-render is an HTTP request, so a page that throws answers with an error body, and writing that
 * body as the page means the site ships an error page that looks like content, from a build that
 * reported success. Nobody finds that until a visitor does.
 *
 * So the build fails instead, naming every page and what it answered. Nothing is written: a partial
 * output that looks complete is the same failure in a different shape.
 *
 * @param results - What the pre-render produced.
 * @throws {CliError} When any page answered 400 or above.
 */
function assertEveryPageRendered (results: PrerenderResult[]): void {
  const failed = results.filter((result) => (result.statusCode ?? 200) >= 400)

  if (failed.length === 0) { return }

  const detail = failed.map((result) => `  ${result.path} answered ${String(result.statusCode)}`).join('\n')

  throw new CliError(
    `SSG could not render ${failed.length} page(s), so nothing was written:\n${detail}\n\n` +
    'The page threw while rendering on the server. Run `stone dev` and open it to see the error: a ' +
    'pre-render is the same render, so whatever fails here fails there.'
  )
}

/**
 * Write pre-rendered results to disk as `<out>/<route>/index.html`.
 *
 * @param results - The pre-render results.
 * @param outDir - The output directory (defaults to `dist/`).
 * @returns The list of written file paths.
 */
export function writePrerendered (results: PrerenderResult[], outDir: string = distPath()): string[] {
  const written: string[] = []
  for (const result of results) {
    const filePath = targetToFilePath(result.path, outDir)
    mkdirSync(dirname(filePath), { recursive: true })
    writeFileSync(filePath, result.html, 'utf-8')
    written.push(filePath)
  }
  return written
}

/**
 * Run the full SSG pass: collect targets, render each, write files.
 *
 * The `render` function is supplied by the build pipeline (it invokes the built SSR app /
 * use-react's `prerenderPage` for a given path). Rendering runs with bounded concurrency.
 *
 * @param options - Orchestration options.
 * @returns The list of written file paths.
 */
export async function runSsg (options: {
  definitions: RouteDefinitionLike[]
  render: (target: PrerenderTarget) => Promise<PrerenderResult>
  extraTargets?: PrerenderTarget[]
  params?: SsgParams
  onSkipped?: (skipped: SkippedTargets) => void
  outDir?: string
  concurrency?: number
}): Promise<string[]> {
  const derived = collectStaticTargets(options.definitions, { params: options.params, onSkipped: options.onSkipped })
  const merged = [...derived, ...(options.extraTargets ?? [])]
  const targets = merged.filter((t, i, all) => all.findIndex((x) => x.path === t.path) === i)
  const outDir = options.outDir ?? distPath()
  const results: PrerenderResult[] = []

  const limit = Math.max(1, options.concurrency ?? 8)
  for (let i = 0; i < targets.length; i += limit) {
    const batch = targets.slice(i, i + limit)
    results.push(...await Promise.all(batch.map(async (t) => await options.render(t))))
  }

  // Checked before a single file is written, so a broken page cannot reach `dist/`.
  assertEveryPageRendered(results)

  return writePrerendered(results, outDir)
}

/**
 * Normalize a route path: ensure a leading slash, strip a trailing slash (except root).
 */
function normalizePath (path: string): string {
  const withLeading = path.startsWith('/') ? path : `/${path}`
  return withLeading === '/' ? '/' : withLeading.replace(/\/+$/, '')
}
