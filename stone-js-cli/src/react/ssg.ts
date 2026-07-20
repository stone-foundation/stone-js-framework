import { join, dirname } from 'node:path'
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
 * Collect the static (parameterless) GET routes to pre-render from the route definitions.
 *
 * This is what makes SSG zero-config: the routes the app already declares (the same
 * definitions the router scans for lazy loading) become the pre-render set, so the user
 * never restates them. A definition contributes every one of its parameterless GET paths
 * (a route may declare several aliases). Parameterized routes (`:id`, `*`) are skipped:
 * they need a `getStaticPaths`-style expansion the app supplies, merged in via
 * {@link runSsg}'s `extraTargets`.
 *
 * @param definitions - The build-time route definitions.
 * @returns The static prerender targets, de-duplicated by path.
 */
export function collectStaticTargets (definitions: RouteDefinitionLike[]): PrerenderTarget[] {
  const paths: string[] = []
  for (const definition of definitions) {
    const isGet = definition.methods === undefined || definition.methods.length === 0 || definition.methods.includes('GET')
    if (!isGet) continue
    const candidates = Array.isArray(definition.path) ? definition.path : [definition.path]
    for (const path of candidates) {
      if (typeof path === 'string' && !path.includes(':') && !path.includes('*')) {
        paths.push(normalizePath(path))
      }
    }
  }
  return paths
    .map((path) => ({ path }))
    .filter((t, i, all) => all.findIndex((x) => x.path === t.path) === i)
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
  outDir?: string
  concurrency?: number
}): Promise<string[]> {
  const merged = [...collectStaticTargets(options.definitions), ...(options.extraTargets ?? [])]
  const targets = merged.filter((t, i, all) => all.findIndex((x) => x.path === t.path) === i)
  const outDir = options.outDir ?? distPath()
  const results: PrerenderResult[] = []

  const limit = Math.max(1, options.concurrency ?? 8)
  for (let i = 0; i < targets.length; i += limit) {
    const batch = targets.slice(i, i + limit)
    results.push(...await Promise.all(batch.map(async (t) => await options.render(t))))
  }

  return writePrerendered(results, outDir)
}

/**
 * Normalize a route path: ensure a leading slash, strip a trailing slash (except root).
 */
function normalizePath (path: string): string {
  const withLeading = path.startsWith('/') ? path : `/${path}`
  return withLeading === '/' ? '/' : withLeading.replace(/\/+$/, '')
}
