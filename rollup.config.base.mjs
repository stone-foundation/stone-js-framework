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
 * Every file under a directory, recursively.
 *
 * Shared by both declaration plugins below: they walked the tree with identical local helpers, and two
 * copies of a traversal is one copy too many.
 *
 * @param {string} dir
 * @returns {string[]}
 */
function walkFiles (dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walkFiles(path) : [path]
  })
}

/**
 * Write `dist/index.d.ts` as `export * from './<file>'` for every emitted
 * declaration (mirroring what multi-entry does for the JS bundle, since these
 * packages have no `src/index.ts`). Runs after the typescript plugin emits the
 * per-file `.d.ts`.
 *
 * The barrel lists the directory, and the build does not empty it, so a declaration left behind by a
 * deleted source used to keep its place on the public entry point. The JS bundle is rebuilt from
 * `src` and had already dropped it, so the types promised exports the runtime no longer had: on a
 * developer's machine `@stone-js/core` still published `perProcess` months after it was deleted, and
 * an API surface generated from that build would have frozen it. A declaration with no source behind
 * it is therefore skipped, and named, rather than trusted because it happens to be on disk.
 *
 * @param {{ dir?: string, out?: string, exclude?: string[], src?: string }} [options]
 */
export function dtsBarrel ({ dir = 'dist', out = 'index.d.ts', exclude = [], src = 'src' } = {}) {
  return {
    name: 'stone-dts-barrel',
    writeBundle () {
      if (!existsSync(dir)) return

      const orphaned = []
      const hasSource = (rel) => {
        // No `src` to compare against (a bespoke build, or declarations emitted from elsewhere)
        // means nothing can be judged stale, so everything stands.
        if (!existsSync(src)) return true
        const base = join(src, rel.replace(/\.d\.ts$/, ''))
        return existsSync(`${base}.ts`) || existsSync(`${base}.tsx`) || existsSync(join(base, 'index.ts'))
      }

      const rels = walkFiles(dir)
        .filter((p) => p.endsWith('.d.ts'))
        .map((p) => relative(dir, p).replaceAll('\\', '/'))
        .filter((r) => r !== out && !exclude.some((e) => r.startsWith(e)))
        .filter((r) => { if (hasSource(r)) return true; orphaned.push(r); return false })
        .sort((left, right) => left.localeCompare(right))

      if (orphaned.length > 0) {
        console.warn(
          `stone-dts-barrel: ${orphaned.length} stale declaration(s) left by a deleted source were ` +
          `kept off the public entry point: ${orphaned.join(', ')}. Remove \`${dir}\` to clear them.`
        )
      }
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

      for (const file of walkFiles(dir).filter((p) => p.endsWith('.d.ts'))) {
        const source = readFileSync(file, 'utf-8')
        const patched = source.replace(
          // `\s*(?:\(\s*)?` rather than `\s*\(?\s*`: two adjacent runs of whitespace around an
          // optional token can backtrack super-linearly on a long run of spaces.
          /((?:from|import|export)\s*(?:\(\s*)?)'(\.[^']*)'/g,
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
 *     entryFileName?: string, json?: boolean, multiEntry?: boolean,
 *     barrel?: { exclude?: string[] }
 *   }>
 * }} p - Injected plugins and options.
 * @returns {import('rollup').RollupOptions[]}
 */
export function createRollupConfig (p) {
  const stack = ({ entryFileName, json, multiEntry = true } = {}) => {
    const list = [
      // `multi-entry` merges several inputs behind a synthetic entry, and that synthetic entry
      // re-exports NAMED exports only: a `export default` in the source silently disappears from the
      // bundle. Any build whose contract is a default export (a CLI plugin, for instance) must opt
      // out, and a single-file input has nothing to merge anyway.
      ...(multiEntry ? [p.multi(entryFileName !== undefined ? { entryFileName } : {})] : []),
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
    const plugins = stack({
      entryFileName: b.entryFileName,
      json: b.json ?? (p.json !== undefined),
      multiEntry: b.multiEntry ?? true
    })
    plugins.push(dtsExtensions())
    if (b.barrel !== undefined) plugins.push(dtsBarrel(b.barrel))
    return {
      input: b.input,
      output: b.output ?? [{ format: 'es', file: b.file }],
      plugins
    }
  })
}
