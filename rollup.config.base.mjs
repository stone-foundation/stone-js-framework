import { dirname, join, relative, resolve } from 'node:path'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'

/**
 * Shared Rollup build for @stone-js/* packages.
 *
 * Declarations are emitted PER FILE by the typescript plugin (tsconfig
 * `declaration: true`), and a cheap re-export barrel is written as
 * `dist/index.d.ts`. This replaces the previous `rollup-plugin-dts` bundling
 * pass, which was the slow (~13s/module), memory-heavy (8 GB heap) step that
 * OOM'd and corrupted output under parallel builds. Per-file + barrel builds in
 * ~2s with a small footprint, so the whole monorepo builds in parallel again.
 *
 * The build plugins are INJECTED by each package's `rollup.config.mjs` (resolved
 * from that package's own node_modules), so every package keeps its own pinned
 * plugin versions and nothing is centralized at the root that could shift them.
 * This file carries only the shared structure and uses node built-ins.
 */

/**
 * Write `dist/index.d.ts` as `export * from './<file>'` for every emitted
 * declaration (mirroring what multi-entry does for the JS bundle, since these
 * packages have no `src/index.ts`). Runs after the typescript plugin emits the
 * per-file `.d.ts`.
 *
 * @param {{ dir?: string, out?: string, exclude?: string[] }} [options]
 */
export function dtsBarrel ({ dir = 'dist', out = 'index.d.ts', exclude = [] } = {}) {
  return {
    name: 'stone-dts-barrel',
    writeBundle () {
      if (!existsSync(dir)) return
      const walk = (d) => readdirSync(d).flatMap((name) => {
        const p = join(d, name)
        return statSync(p).isDirectory() ? walk(p) : [p]
      })
      const rels = walk(dir)
        .filter((p) => p.endsWith('.d.ts'))
        .map((p) => relative(dir, p).replaceAll('\\', '/'))
        .filter((r) => r !== out && !exclude.some((e) => r.startsWith(e)))
        .sort()
      // `.js`, not extensionless: this package is ESM with an `exports` map, and a consumer on
      // `moduleResolution: nodenext` cannot resolve a relative import without its extension. It
      // silently sees no exports at all, and TypeScript reports the misleading "has no exported
      // member" instead of "module not resolved".
      const lines = rels.map((r) => `export * from './${r.replace(/\.d\.ts$/, '')}.js';`)
      writeFileSync(join(dir, out), lines.join('\n') + '\n', 'utf-8')
    }
  }
}

/**
 * Add the `.js` extension to every relative specifier inside the emitted declarations.
 *
 * `tsc` reproduces what the sources wrote, and the sources are bundler-style (extensionless). In a
 * published ESM package that makes every per-file declaration unresolvable under
 * `moduleResolution: nodenext`, so the types of everything they re-export vanish. Directory
 * specifiers resolve to `<dir>/index.js`; anything already carrying an extension is left alone, and
 * so is a specifier pointing at neither a sibling declaration nor a directory barrel.
 *
 * @param {{ dir?: string }} [options]
 */
export function dtsExtensions ({ dir = 'dist' } = {}) {
  return {
    name: 'stone-dts-extensions',
    writeBundle () {
      if (!existsSync(dir)) return

      const walk = (d) => readdirSync(d).flatMap((name) => {
        const p = join(d, name)
        return statSync(p).isDirectory() ? walk(p) : [p]
      })

      for (const file of walk(dir).filter((p) => p.endsWith('.d.ts'))) {
        const source = readFileSync(file, 'utf-8')
        const patched = source.replace(
          /((?:from|import|export)\s*\(?\s*)'(\.[^']*)'/g,
          (match, head, specifier) => {
            if (/\.(js|mjs|cjs|jsx|json|css)$/.test(specifier)) return match
            const target = resolve(dirname(file), specifier)
            if (existsSync(`${target}.d.ts`)) return `${head}'${specifier}.js'`
            if (existsSync(join(target, 'index.d.ts'))) return `${head}'${specifier}/index.js'`
            return match
          }
        )
        if (patched !== source) writeFileSync(file, patched, 'utf-8')
      }
    }
  }
}

/**
 * Build the Rollup config array for a package, with plugins injected.
 *
 * A build entry is `{ input, file }` by default; pass `entryFileName` for the
 * multi-entry name, `output` for a fully custom output, `json: true` to parse
 * `.json` imports (requires the `json` plugin injected), and `barrel` on the
 * build whose declarations form the public `dist/index.d.ts`.
 *
 * @param {{
 *   multi: Function, commonjs: Function, typescript: Function,
 *   nodeResolve: Function, nodeExternals: Function, json?: Function,
 *   extensions?: string[],
 *   builds?: Array<{
 *     input: string | string[], file?: string, output?: object,
 *     entryFileName?: string, json?: boolean, barrel?: { exclude?: string[] }
 *   }>
 * }} p - Injected plugins and options.
 * @returns {import('rollup').RollupOptions[]}
 */
export function createRollupConfig (p) {
  const stack = ({ entryFileName, json } = {}) => {
    const list = [
      p.multi(entryFileName !== undefined ? { entryFileName } : {}),
      p.nodeExternals(), // Must always be before nodeResolve().
      p.nodeResolve({
        extensions: p.extensions ?? ['.js', '.mjs', '.ts'],
        exportConditions: ['node', 'import', 'require', 'default']
      })
    ]
    if (json === true && p.json !== undefined) list.push(p.json())
    list.push(p.typescript({ noEmitOnError: true, tsconfig: './tsconfig.build.json' }), p.commonjs())
    return list
  }

  const builds = p.builds ?? [{ input: 'src/**/*.ts', file: 'dist/index.js', barrel: {} }]

  return builds.map((b) => {
    const plugins = stack({ entryFileName: b.entryFileName, json: b.json ?? (p.json !== undefined) })
    plugins.push(dtsExtensions())
    if (b.barrel !== undefined) plugins.push(dtsBarrel(b.barrel))
    return {
      input: b.input,
      output: b.output ?? [{ format: 'es', file: b.file }],
      plugins
    }
  })
}
